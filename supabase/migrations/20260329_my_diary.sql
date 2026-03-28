-- My Diary: pupil info, guardians, next of kin, medical, weekly homework & comments.
-- Access: get_my_diary (read) for valid admission; save_my_diary for parent (admission) or teacher (JWT + teacher_accounts).

create table if not exists public.my_diary (
  student_id uuid primary key references public.student_profiles (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_my_diary_updated on public.my_diary (updated_at);

comment on table public.my_diary is 'Per-student school diary JSON; updated via save_my_diary RPC only.';

alter table public.my_diary enable row level security;

-- Teachers who may edit diaries (Supabase Auth users).
create table if not exists public.teacher_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

comment on table public.teacher_accounts is 'Staff accounts: save_my_diary checks auth.uid() here.';

alter table public.teacher_accounts enable row level security;

-- ----- Read diary (admission must match an active student) -----
create or replace function public.get_my_diary (p_admission text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  sid uuid;
  adm text;
  pl jsonb;
  sn text;
begin
  adm := upper(trim(p_admission));
  if adm = '' or length(adm) > 64 then
    return null;
  end if;

  select id, student_name into sid, sn
  from public.student_profiles
  where admission_no = adm and is_active;

  if sid is null then
    return null;
  end if;

  select payload into pl from public.my_diary where student_id = sid;
  if pl is null then
    pl := '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'admission', adm,
    'studentName', sn,
    'studentId', sid,
    'payload', pl
  );
end;
$$;

grant execute on function public.get_my_diary (text) to anon, authenticated;

-- ----- Save diary: student role rejected; parent by admission; teacher by JWT -----
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

grant execute on function public.save_my_diary (text, jsonb, text) to anon, authenticated;
