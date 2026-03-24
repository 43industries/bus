-- RLS: student/guardian tables are not directly readable by anon.
-- Parents resolve one profile via SECURITY DEFINER function get_parent_profile(admission).
-- Diary + live bus_state remain readable by anon (active / public tracking use case).

-- ----- Live bus position (if not already created remotely) -----
create table if not exists public.bus_state (
  bus_id text primary key,
  lat double precision,
  lng double precision,
  speed_kmh double precision,
  recorded_at timestamptz
);

-- ----- RPC: single-student bundle for parent login -----
create or replace function public.get_parent_profile(p_admission text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  rec record;
  norm text := upper(trim(p_admission));
begin
  if norm = '' or length(norm) > 64 then
    return null;
  end if;

  select
    id,
    admission_no,
    student_name,
    parent_name,
    home_stop_name,
    home_lat,
    home_lng
  into rec
  from public.student_profiles
  where admission_no = norm
    and is_active;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'admission', rec.admission_no,
    'studentName', rec.student_name,
    'parentName', coalesce(rec.parent_name, 'Parent'),
    'home', jsonb_build_object(
      'name', coalesce(rec.home_stop_name, 'Home Stop'),
      'lat', rec.home_lat,
      'lng', rec.home_lng
    ),
    'buses', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'busId', a.bus_id,
            'label', coalesce(a.bus_label, a.bus_id)
          )
          order by a.bus_id
        )
        from public.student_bus_assignments a
        where a.student_id = rec.id
          and a.is_active
      ),
      '[]'::jsonb
    ),
    'guardians', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'name', coalesce(pg.full_name, 'Guardian'),
            'phone', pg.phone,
            'enabled', sg.receives_sms
          )
          order by pg.full_name
        )
        from public.student_guardians sg
        join public.parent_guardians pg on pg.id = sg.guardian_id
        where sg.student_id = rec.id
          and pg.is_active
          and pg.phone is not null
          and btrim(pg.phone) <> ''
      ),
      '[]'::jsonb
    )
  );
end;
$$;

grant execute on function public.get_parent_profile(text) to anon, authenticated;

-- ----- Row Level Security -----
alter table public.student_profiles enable row level security;
alter table public.parent_guardians enable row level security;
alter table public.student_guardians enable row level security;
alter table public.student_bus_assignments enable row level security;
alter table public.school_diary_entries enable row level security;
alter table public.bus_state enable row level security;

-- Diary: active rows readable by API roles
drop policy if exists school_diary_entries_select_anon on public.school_diary_entries;
create policy school_diary_entries_select_anon
  on public.school_diary_entries
  for select
  to anon, authenticated
  using (is_active = true);

-- Live bus: readable by API roles (subscribe + select)
drop policy if exists bus_state_select_anon on public.bus_state;
create policy bus_state_select_anon
  on public.bus_state
  for select
  to anon, authenticated
  using (true);

-- service_role bypasses RLS for admin/seed operations.
-- Enable Realtime for public.bus_state in the Supabase dashboard if map updates stop streaming.
