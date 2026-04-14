import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

type TripRequest = {
  action: "start_trip" | "update_status";
  bus_id?: string;
  status?: string;
  lat?: number;
  lng?: number;
};

const VALID_STATUSES = [
  "LEFT_SCHOOL",
  "EN_ROUTE_TO_HOME",
  "ARRIVED_HOME_STOP",
  "LEFT_HOME_AREA",
  "RETURNING_TO_SCHOOL",
  "ARRIVED_SCHOOL",
] as const;

const STATUS_ORDER: Record<string, number> = {};
VALID_STATUSES.forEach((s, i) => (STATUS_ORDER[s] = i));

const NOTIFY_STATUSES = new Set(["LEFT_SCHOOL", "ARRIVED_HOME_STOP"]);

const SMS_TEMPLATES: Record<string, (busLabel: string) => string> = {
  LEFT_SCHOOL: (bus) =>
    `BusBuddy: ${bus} has left school and is on the way home. Track live: open your BusBuddy app.`,
  ARRIVED_HOME_STOP: (bus) =>
    `BusBuddy: ${bus} has arrived at the home stop. Your child is being dropped off.`,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sendTwilioMessage(
  accountSid: string,
  authToken: string,
  from: { messagingServiceSid?: string; fromPhone?: string },
  to: string,
  body: string,
) {
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = btoa(`${accountSid}:${authToken}`);
  const params = new URLSearchParams();
  params.set("To", to);
  params.set("Body", body);
  if (from.messagingServiceSid)
    params.set("MessagingServiceSid", from.messagingServiceSid);
  else if (from.fromPhone) params.set("From", from.fromPhone);
  else throw new Error("TWILIO_SENDER_NOT_CONFIGURED");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const data = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    sid: data.sid ?? null,
    error: data.message ?? null,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "METHOD_NOT_ALLOWED" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioMsgSvcSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID") ?? undefined;
  const twilioFromPhone = Deno.env.get("TWILIO_FROM_PHONE") ?? undefined;

  if (!supabaseUrl || !serviceRoleKey || !anonKey)
    return json(500, { error: "SERVER_CONFIG_ERROR" });

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return json(401, { error: "AUTH_REQUIRED" });

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const svc = createClient(supabaseUrl, serviceRoleKey);

  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user)
    return json(401, { error: "INVALID_AUTH" });

  // Caller must be a driver or fleet manager (driver_accounts or teacher_accounts)
  const userId = authData.user.id;
  const { data: driverRow } = await svc
    .from("driver_accounts")
    .select("bus_id,bus_label")
    .eq("user_id", userId)
    .maybeSingle();
  const { data: teacherRow } = await svc
    .from("teacher_accounts")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!driverRow && !teacherRow)
    return json(403, { error: "NOT_DRIVER_OR_FLEET_MANAGER" });

  const body = (await req.json().catch(() => ({}))) as TripRequest;
  const busId = body.bus_id || driverRow?.bus_id;
  if (!busId) return json(400, { error: "BUS_ID_REQUIRED" });

  const busLabel =
    driverRow?.bus_label ||
    busId.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  // ---- START TRIP ----
  if (body.action === "start_trip") {
    // Close any existing open trip for this bus
    await svc
      .from("trips")
      .update({ completed_at: new Date().toISOString() })
      .eq("bus_id", busId)
      .is("completed_at", null);

    const { data: trip, error: tripErr } = await svc
      .from("trips")
      .insert({
        bus_id: busId,
        current_status: "LEFT_SCHOOL",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (tripErr) return json(500, { error: "TRIP_CREATE_FAILED", detail: tripErr.message });

    // Record first event
    const { data: evt } = await svc
      .from("trip_events")
      .insert({
        trip_id: trip.id,
        status: "LEFT_SCHOOL",
        lat: body.lat ?? null,
        lng: body.lng ?? null,
      })
      .select()
      .single();

    // Fire notifications for LEFT_SCHOOL
    const notifResults = await notifyParents(
      svc,
      trip.id,
      evt?.id ?? null,
      busId,
      busLabel,
      "LEFT_SCHOOL",
      { twilioAccountSid, twilioAuthToken, twilioMsgSvcSid, twilioFromPhone },
    );

    console.log(
      JSON.stringify({
        event: "trip_started",
        tripId: trip.id,
        busId,
        notified: notifResults.sent,
        failed: notifResults.failed,
      }),
    );

    return json(200, {
      trip_id: trip.id,
      status: "LEFT_SCHOOL",
      notifications: { sent: notifResults.sent, failed: notifResults.failed },
    });
  }

  // ---- UPDATE STATUS ----
  if (body.action === "update_status") {
    const status = body.status;
    if (!status || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number]))
      return json(400, { error: "INVALID_STATUS", valid: [...VALID_STATUSES] });

    // Find the active trip for this bus
    const { data: trip, error: tripErr } = await svc
      .from("trips")
      .select("id,current_status")
      .eq("bus_id", busId)
      .is("completed_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tripErr || !trip)
      return json(404, { error: "NO_ACTIVE_TRIP", detail: "Start a trip first." });

    // Enforce forward-only progression (no going backwards)
    const currentOrder = STATUS_ORDER[trip.current_status] ?? -1;
    const nextOrder = STATUS_ORDER[status] ?? -1;
    if (nextOrder <= currentOrder)
      return json(409, {
        error: "INVALID_TRANSITION",
        current: trip.current_status,
        requested: status,
      });

    // Insert event (unique constraint prevents duplicates)
    const { data: evt, error: evtErr } = await svc
      .from("trip_events")
      .insert({
        trip_id: trip.id,
        status,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
      })
      .select()
      .single();

    if (evtErr) {
      if (evtErr.code === "23505")
        return json(409, { error: "DUPLICATE_EVENT", status });
      return json(500, { error: "EVENT_INSERT_FAILED", detail: evtErr.message });
    }

    // Update trip current_status
    const updates: Record<string, unknown> = { current_status: status };
    if (status === "ARRIVED_SCHOOL") updates.completed_at = new Date().toISOString();
    await svc.from("trips").update(updates).eq("id", trip.id);

    // Notify parents if this is a notification-worthy status
    let notifResults = { sent: 0, failed: 0 };
    if (NOTIFY_STATUSES.has(status)) {
      notifResults = await notifyParents(
        svc,
        trip.id,
        evt?.id ?? null,
        busId,
        busLabel,
        status,
        { twilioAccountSid, twilioAuthToken, twilioMsgSvcSid, twilioFromPhone },
      );
    }

    console.log(
      JSON.stringify({
        event: "trip_status_updated",
        tripId: trip.id,
        busId,
        status,
        notified: notifResults.sent,
        failed: notifResults.failed,
      }),
    );

    return json(200, {
      trip_id: trip.id,
      status,
      notifications: { sent: notifResults.sent, failed: notifResults.failed },
    });
  }

  return json(400, { error: "INVALID_ACTION", valid: ["start_trip", "update_status"] });
});

// ---------------------------------------------------------------------------
// Notify all parents of students assigned to this bus
// ---------------------------------------------------------------------------
type TwilioCfg = {
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioMsgSvcSid?: string;
  twilioFromPhone?: string;
};

async function notifyParents(
  svc: ReturnType<typeof createClient>,
  tripId: string,
  tripEventId: string | null,
  busId: string,
  busLabel: string,
  status: string,
  twilio: TwilioCfg,
): Promise<{ sent: number; failed: number }> {
  // Find all active students on this bus
  const { data: assignments } = await svc
    .from("student_bus_assignments")
    .select("student_id")
    .eq("bus_id", busId)
    .eq("is_active", true);

  if (!assignments || assignments.length === 0) return { sent: 0, failed: 0 };

  const studentIds = [...new Set(assignments.map((a) => a.student_id))];

  // For each student, find guardians with receives_sms = true
  const { data: guardianRows } = await svc
    .from("student_guardians")
    .select("student_id,guardian_id,receives_sms,parent_guardians!inner(id,phone,full_name,is_active)")
    .in("student_id", studentIds)
    .eq("receives_sms", true)
    .eq("parent_guardians.is_active", true);

  if (!guardianRows || guardianRows.length === 0) return { sent: 0, failed: 0 };

  const message = SMS_TEMPLATES[status]?.(busLabel) ?? `BusBuddy: ${busLabel} status update — ${status}.`;
  let sent = 0;
  let failed = 0;

  for (const row of guardianRows) {
    const guardian = Array.isArray(row.parent_guardians)
      ? row.parent_guardians[0]
      : row.parent_guardians;
    const phone = guardian?.phone?.replace(/[^\d+]/g, "");
    if (!phone) continue;

    // Log the attempt
    const { data: logRow } = await svc
      .from("notification_log")
      .insert({
        trip_id: tripId,
        trip_event_id: tripEventId,
        bus_id: busId,
        student_id: row.student_id,
        guardian_id: row.guardian_id,
        channel: "sms",
        status: "pending",
        message,
      })
      .select("id")
      .single();

    // Send SMS if Twilio is configured
    if (twilio.twilioAccountSid && twilio.twilioAuthToken) {
      try {
        const result = await sendTwilioMessage(
          twilio.twilioAccountSid,
          twilio.twilioAuthToken,
          {
            messagingServiceSid: twilio.twilioMsgSvcSid,
            fromPhone: twilio.twilioFromPhone,
          },
          phone,
          message,
        );
        if (result.ok) {
          sent++;
          if (logRow) {
            await svc
              .from("notification_log")
              .update({ status: "sent", provider_sid: result.sid })
              .eq("id", logRow.id);
          }
        } else {
          failed++;
          if (logRow) {
            await svc
              .from("notification_log")
              .update({ status: "failed", error_detail: result.error })
              .eq("id", logRow.id);
          }
        }
      } catch (err) {
        failed++;
        if (logRow) {
          await svc
            .from("notification_log")
            .update({
              status: "failed",
              error_detail: err instanceof Error ? err.message : "UNKNOWN",
            })
            .eq("id", logRow.id);
        }
      }
    } else {
      // No Twilio config — mark as failed with reason
      failed++;
      if (logRow) {
        await svc
          .from("notification_log")
          .update({ status: "failed", error_detail: "TWILIO_NOT_CONFIGURED" })
          .eq("id", logRow.id);
      }
    }

    // Also insert a "push" notification log entry (delivered via Realtime channel)
    await svc.from("notification_log").insert({
      trip_id: tripId,
      trip_event_id: tripEventId,
      bus_id: busId,
      student_id: row.student_id,
      guardian_id: row.guardian_id,
      channel: "push",
      status: "sent",
      message,
    });
  }

  return { sent, failed };
}
