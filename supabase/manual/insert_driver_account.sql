-- BusBuddy: link a Supabase Auth user to a bus for driver-location updates.
-- Run in: Supabase Dashboard → SQL Editor (or psql as a privileged role).
--
-- Prerequisites: migration applied so public.driver_accounts exists.
-- The driver must already exist under Authentication → Users.

-- ---------------------------------------------------------------------------
-- Option A — by email (recommended; change the email string only)
-- ---------------------------------------------------------------------------

insert into public.driver_accounts (user_id, bus_id, bus_label)
select u.id, 'bus_07', 'Bus 07'
from auth.users u
where u.email = lower(trim('driver@example.com'))  -- ← driver’s login email
on conflict (user_id) do update
set
  bus_id = excluded.bus_id,
  bus_label = excluded.bus_label,
  updated_at = now();

-- Should insert/update exactly one row. If 0 rows: email not found in auth.users.

-- ---------------------------------------------------------------------------
-- Option B — by user UUID (paste id from Dashboard → Authentication → Users)
-- ---------------------------------------------------------------------------

/*
insert into public.driver_accounts (user_id, bus_id, bus_label)
values (
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::uuid,
  'bus_07',
  'Bus 07'
)
on conflict (user_id) do update
set
  bus_id = excluded.bus_id,
  bus_label = excluded.bus_label,
  updated_at = now();
*/

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------

select da.user_id, da.bus_id, da.bus_label, u.email
from public.driver_accounts da
join auth.users u on u.id = da.user_id;
