-- Edge function helper table for lightweight DB-backed throttling.
-- Keeps short-lived counters keyed by bucket/window.

create table if not exists public.sms_rate_limits (
  window_seconds integer not null,
  bucket bigint not null,
  scope text not null,
  key text not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (window_seconds, bucket, scope, key)
);

alter table public.sms_rate_limits enable row level security;

-- No policies for anon/authenticated. Edge functions use service_role.
