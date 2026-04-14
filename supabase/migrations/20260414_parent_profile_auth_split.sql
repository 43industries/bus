-- Split parent profile RPC into public (minimal) and authenticated (sensitive) shapes.
-- Keeps admission-based map UX while protecting guardian contact fields.

create or replace function public.get_parent_profile_public(p_admission text)
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
    student_name
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
    )
  );
end;
$$;

create or replace function public.get_parent_profile_secure(p_admission text)
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
  if auth.uid() is null then
    raise exception 'PARENT_AUTH_REQUIRED' using hint = 'Sign in first.';
  end if;

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

  if not exists (
    select 1
    from public.parent_accounts pa
    join public.student_guardians sg on sg.guardian_id = pa.guardian_id
    where pa.user_id = auth.uid()
      and sg.student_id = rec.id
  ) then
    raise exception 'NOT_GUARDIAN_FOR_STUDENT';
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

create or replace function public.get_parent_profile(p_admission text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return public.get_parent_profile_secure(p_admission);
end;
$$;

revoke execute on function public.get_parent_profile(text) from anon;
revoke execute on function public.get_parent_profile(text) from public;
grant execute on function public.get_parent_profile(text) to authenticated;

revoke execute on function public.get_parent_profile_secure(text) from anon;
revoke execute on function public.get_parent_profile_secure(text) from public;
grant execute on function public.get_parent_profile_secure(text) to authenticated;

grant execute on function public.get_parent_profile_public(text) to anon, authenticated;
