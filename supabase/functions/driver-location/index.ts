import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Body = {
  lat?: number;
  lng?: number;
  speed_kmh?: number | null;
};

function formatBusLabel(busId: string): string {
  if (busId === "bus_07") return "Bus 07";
  return busId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing or invalid Authorization" }), {
      status: 401,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch (_) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const lat = typeof body.lat === "number" ? body.lat : NaN;
  const lng = typeof body.lng === "number" ? body.lng : NaN;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return new Response(JSON.stringify({ error: "lat and lng must be numbers" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return new Response(JSON.stringify({ error: "lat/lng out of range" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!url || !anonKey || !serviceKey) {
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();

  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
      status: 401,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(url, serviceKey);

  const { data: acc, error: accErr } = await admin
    .from("driver_accounts")
    .select("bus_id, bus_label")
    .eq("user_id", user.id)
    .maybeSingle();

  if (accErr) {
    console.error("driver_accounts", accErr);
    return new Response(JSON.stringify({ error: "Could not resolve driver bus" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const defaultBus = Deno.env.get("DEFAULT_BUS_ID") || "bus_07";
  const busId = acc?.bus_id ?? defaultBus;
  const busLabel = (acc?.bus_label && String(acc.bus_label).trim()) ||
    formatBusLabel(busId);

  const speed =
    typeof body.speed_kmh === "number" && Number.isFinite(body.speed_kmh)
      ? body.speed_kmh
      : null;

  const recordedAt = new Date().toISOString();

  const { error: upsertErr } = await admin.from("bus_state").upsert(
    {
      bus_id: busId,
      lat,
      lng,
      speed_kmh: speed,
      recorded_at: recordedAt,
    },
    { onConflict: "bus_id" },
  );

  if (upsertErr) {
    console.error("bus_state upsert", upsertErr);
    return new Response(JSON.stringify({ error: "Could not save location" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      bus_id: busId,
      bus_label: busLabel,
      recorded_at: recordedAt,
    }),
    { status: 200, headers: { ...CORS, "Content-Type": "application/json" } },
  );
});
