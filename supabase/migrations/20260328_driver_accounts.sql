-- Links Supabase Auth users to a bus for driver-location updates (service role only).
create table if not exists public.driver_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  bus_id text not null,
  bus_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.driver_accounts is
  'Assign each driver auth user to a bus_id. Edge Function driver-location reads this; no direct client access.';

alter table public.driver_accounts enable row level security;

-- No anon/authenticated policies: drivers never SELECT this table from the browser.

create index if not exists idx_driver_accounts_bus on public.driver_accounts (bus_id);

-- After creating a driver in Authentication → Users, link them to a bus, e.g.:
-- insert into public.driver_accounts (user_id, bus_id, bus_label)
-- values ('<uuid from auth.users>', 'bus_07', 'Bus 07');
