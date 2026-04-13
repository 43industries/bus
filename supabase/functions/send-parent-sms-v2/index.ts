import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

type SendRequest = {
  studentAdmission?: string;
  bus?: string;
  recipients?: string[];
  message?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_MESSAGE_LEN = 480;
const MAX_RECIPIENTS_PER_REQUEST = 5;
const LIMIT_PER_IP_PER_MINUTE = 8;
const LIMIT_PER_STUDENT_PER_HOUR = 20;

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeAdmission(value: unknown): string {
  return String(value ?? "").trim().toUpperCase();
}

function normalizePhone(value: unknown): string {
  return String(value ?? "").replace(/[^\d+]/g, "");
}

function maskPhone(phone: string): string {
  if (phone.length <= 5) return "***";
  return `${phone.slice(0, 3)}***${phone.slice(-2)}`;
}

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
}

async function hashValue(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

async function incrementAndCheckLimit(
  serviceClient: ReturnType<typeof createClient>,
  scope: "ip" | "student",
  key: string,
  windowSeconds: number,
  limit: number,
) {
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const { data: existing, error: existingError } = await serviceClient
    .from("sms_rate_limits")
    .select("count")
    .eq("window_seconds", windowSeconds)
    .eq("bucket", bucket)
    .eq("scope", scope)
    .eq("key", key)
    .maybeSingle();

  if (existingError) throw new Error(`RATE_LIMIT_STORE_ERROR:${existingError.message}`);

  const nextCount = (existing?.count ?? 0) + 1;
  const { error: upsertError } = await serviceClient
    .from("sms_rate_limits")
    .upsert({
      window_seconds: windowSeconds,
      bucket,
      scope,
      key,
      count: nextCount,
      updated_at: new Date().toISOString(),
    }, { onConflict: "window_seconds,bucket,scope,key" });

  if (upsertError) throw new Error(`RATE_LIMIT_UPDATE_ERROR:${upsertError.message}`);
  if (nextCount > limit) throw new Error("RATE_LIMIT_EXCEEDED");
}

async function sendTwilioMessage(
  accountSid: string,
  authToken: string,
  fromConfig: { messagingServiceSid?: string; fromPhone?: string },
  to: string,
  body: string,
) {
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = btoa(`${accountSid}:${authToken}`);
  const payload = new URLSearchParams();
  payload.set("To", to);
  payload.set("Body", body);
  if (fromConfig.messagingServiceSid) payload.set("MessagingServiceSid", fromConfig.messagingServiceSid);
  else if (fromConfig.fromPhone) payload.set("From", fromConfig.fromPhone);
  else throw new Error("TWILIO_SENDER_NOT_CONFIGURED");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });
  const payloadJson = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    sid: payloadJson.sid ?? null,
    error: payloadJson.message ?? null,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "METHOD_NOT_ALLOWED" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioMessagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID") ?? undefined;
  const twilioFromPhone = Deno.env.get("TWILIO_FROM_PHONE") ?? undefined;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json(500, { error: "SERVER_CONFIG_ERROR" });
  if (!twilioAccountSid || !twilioAuthToken) return json(500, { error: "TWILIO_CONFIG_ERROR" });

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return json(401, { error: "AUTH_REQUIRED" });

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) return json(401, { error: "INVALID_AUTH" });

  const payload = await req.json().catch(() => ({} as SendRequest)) as SendRequest;
  const admission = normalizeAdmission(payload.studentAdmission);
  const message = String(payload.message ?? "").trim().slice(0, MAX_MESSAGE_LEN);

  if (!admission || admission.length > 64) return json(400, { error: "INVALID_ADMISSION" });
  if (!message) return json(400, { error: "INVALID_MESSAGE" });

  try {
    const clientIp = getClientIp(req);
    await incrementAndCheckLimit(serviceClient, "ip", clientIp, 60, LIMIT_PER_IP_PER_MINUTE);
    await incrementAndCheckLimit(serviceClient, "student", admission, 3600, LIMIT_PER_STUDENT_PER_HOUR);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "RATE_LIMIT_FAILURE";
    if (msg.includes("RATE_LIMIT_EXCEEDED")) return json(429, { error: "RATE_LIMITED" });
    return json(500, { error: "RATE_LIMIT_CHECK_FAILED" });
  }

  const { data: student, error: studentError } = await serviceClient
    .from("student_profiles")
    .select("id,admission_no,student_name")
    .eq("admission_no", admission)
    .eq("is_active", true)
    .maybeSingle();

  if (studentError) return json(500, { error: "STUDENT_LOOKUP_FAILED" });
  if (!student) return json(404, { error: "STUDENT_NOT_FOUND" });

  const { data: links, error: linkError } = await serviceClient
    .from("parent_accounts")
    .select("user_id,guardian_id,student_guardians!inner(student_id)")
    .eq("user_id", authData.user.id)
    .eq("student_guardians.student_id", student.id)
    .limit(1);
  if (linkError) return json(500, { error: "GUARDIAN_CHECK_FAILED" });
  if (!links || links.length === 0) return json(403, { error: "NOT_GUARDIAN_FOR_STUDENT" });

  const { data: guardians, error: guardiansError } = await serviceClient
    .from("student_guardians")
    .select("receives_sms,parent_guardians!inner(phone,is_active)")
    .eq("student_id", student.id)
    .eq("receives_sms", true)
    .eq("parent_guardians.is_active", true);
  if (guardiansError) return json(500, { error: "GUARDIAN_LOOKUP_FAILED" });

  const allowedPhones = new Set<string>();
  for (const row of guardians ?? []) {
    const g = Array.isArray(row.parent_guardians) ? row.parent_guardians[0] : row.parent_guardians;
    const phone = normalizePhone(g?.phone);
    if (phone) allowedPhones.add(phone);
  }
  if (allowedPhones.size === 0) return json(400, { error: "NO_GUARDIANS_ENABLED" });

  const requested = Array.isArray(payload.recipients) ? payload.recipients.map(normalizePhone).filter(Boolean) : [];
  const selected = requested.length > 0
    ? requested.filter((phone) => allowedPhones.has(phone))
    : Array.from(allowedPhones);
  const recipients = Array.from(new Set(selected)).slice(0, MAX_RECIPIENTS_PER_REQUEST);
  if (recipients.length === 0) return json(403, { error: "NO_AUTHORIZED_RECIPIENTS" });

  const results: Array<{ to: string; ok: boolean; status: number; sid: string | null; error: string | null }> = [];
  for (const to of recipients) {
    const result = await sendTwilioMessage(
      twilioAccountSid,
      twilioAuthToken,
      {
        messagingServiceSid: twilioMessagingServiceSid,
        fromPhone: twilioFromPhone,
      },
      to,
      message,
    );
    results.push({ to: maskPhone(to), ...result });
  }

  const sent = results.filter((result) => result.ok).length;
  const failed = results.length - sent;
  const admissionHash = await hashValue(admission);
  console.log(JSON.stringify({
    event: "send_parent_sms",
    admissionHash,
    requesterUserId: authData.user.id,
    bus: String(payload.bus ?? ""),
    sent,
    failed,
  }));

  return json(200, {
    studentAdmission: student.admission_no,
    studentName: student.student_name,
    bus: String(payload.bus ?? ""),
    sent,
    failed,
    results,
  });
});
