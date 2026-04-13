-- Market readiness: parent diary writes require authenticated guardian linked via parent_accounts.
-- Revokes anonymous execute on save_my_diary (admission-only writes were a privilege-escalation risk).

create table if not exists public.parent_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  guardian_id uuid not null references public.parent_guardians (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (guardian_id)
);

comment on table public.parent_accounts is 'Maps Supabase Auth user to parent_guardians; required for parent save_my_diary.';

alter table public.parent_accounts enable row level security;

-- No SELECT/INSERT policies for anon/authenticated: rows are managed via SQL (dashboard) or service_role.

create or replace function public.save_my_diary (
  p_admission text,
  p_payload jsonb,
  p_role text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  sid uuid;
  adm text;
  r text;
begin
  adm := upper(trim(p_admission));
  r := lower(trim(coalesce(p_role, '')));

  if r = 'student' then
    raise exception 'STUDENT_READ_ONLY' using hint = 'Students may only view the diary.';
  end if;

  if adm = '' or length(adm) > 64 then
    raise exception 'INVALID_ADMISSION';
  end if;

  if r not in ('parent', 'teacher') then
    raise exception 'INVALID_ROLE';
  end if;

  select id into sid
  from public.student_profiles
  where admission_no = adm and is_active;

  if sid is null then
    raise exception 'STUDENT_NOT_FOUND';
  end if;

  if r = 'parent' then
    if auth.uid() is null then
      raise exception 'PARENT_AUTH_REQUIRED' using hint = 'Parents must sign in; link user via parent_accounts.';
    end if;
    if not exists (
      select 1
      from public.parent_accounts pa
      join public.student_guardians sg on sg.guardian_id = pa.guardian_id
      where pa.user_id = auth.uid()
        and sg.student_id = sid
    ) then
      raise exception 'NOT_GUARDIAN_FOR_STUDENT';
    end if;
  end if;

  if r = 'teacher' then
    if auth.uid() is null then
      raise exception 'TEACHER_AUTH_REQUIRED';
    end if;
    if not exists (
      select 1 from public.teacher_accounts t where t.user_id = auth.uid()
    ) then
      raise exception 'NOT_A_TEACHER';
    end if;
  end if;

  insert into public.my_diary (student_id, payload, updated_at)
  values (sid, coalesce(p_payload, '{}'::jsonb), now())
  on conflict (student_id) do update
  set payload = excluded.payload,
      updated_at = now();

  return public.get_my_diary(adm);
end;
$$;

revoke execute on function public.save_my_diary (text, jsonb, text) from anon;
revoke execute on function public.save_my_diary (text, jsonb, text) from public;
grant execute on function public.save_my_diary (text, jsonb, text) to authenticated;
