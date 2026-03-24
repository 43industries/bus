import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type SmsRequest = {
  studentAdmission?: string | null;
  studentName?: string | null;
  bus?: string | null;
  recipients?: string[];
  message?: string;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizePhone(phone: string): string {
  return String(phone).replace(/[^\d+]/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  let body: SmsRequest;
  try {
    body = await req.json();
  } catch (_) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const recipients = (body.recipients ?? []).map(normalizePhone).filter(Boolean);
  const message = (body.message ?? "").trim();

  if (!recipients.length || !message) {
    return new Response(
      JSON.stringify({ error: "recipients[] and message are required" }),
      {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  }

  // Twilio credentials (set via Supabase secrets).
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  // Recommended: messaging service sid. fallback: sender number.
  const serviceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");
  const fromPhone = Deno.env.get("TWILIO_FROM_PHONE");

  if (!accountSid || !authToken || (!serviceSid && !fromPhone)) {
    return new Response(
      JSON.stringify({
        error:
          "Missing Twilio secrets. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and either TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_PHONE.",
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  }

  const authHeader = `Basic ${btoa(`${accountSid}:${authToken}`)}`;
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const results = await Promise.all(
    recipients.map(async (to) => {
      const payload = new URLSearchParams();
      payload.set("To", to);
      payload.set("Body", message);
      if (serviceSid) payload.set("MessagingServiceSid", serviceSid);
      else if (fromPhone) payload.set("From", fromPhone);

      const twilioRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
      });

      const data = await twilioRes.json().catch(() => ({}));
      return {
        to,
        ok: twilioRes.ok,
        status: twilioRes.status,
        sid: data.sid ?? null,
        error: data.message ?? null,
      };
    }),
  );

  const okCount = results.filter((r) => r.ok).length;
  const failedCount = results.length - okCount;

  return new Response(
    JSON.stringify({
      studentAdmission: body.studentAdmission ?? null,
      studentName: body.studentName ?? null,
      bus: body.bus ?? null,
      sent: okCount,
      failed: failedCount,
      results,
    }),
    {
      status: failedCount > 0 ? 207 : 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    },
  );
});

