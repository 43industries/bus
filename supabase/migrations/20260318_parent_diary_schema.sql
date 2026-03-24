create extension if not exists pgcrypto;

create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  admission_no text not null unique,
  student_name text not null,
  parent_name text,
  home_stop_name text,
  home_lat double precision,
  home_lng double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.parent_guardians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  relation text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (phone)
);

create table if not exists public.student_guardians (
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  guardian_id uuid not null references public.parent_guardians(id) on delete cascade,
  receives_sms boolean not null default true,
  primary key (student_id, guardian_id)
);

create table if not exists public.student_bus_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  bus_id text not null,
  bus_label text,
  run_type text not null default 'all' check (run_type in ('morning', 'evening', 'trip', 'all')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.school_diary_entries (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null check (entry_type in ('events', 'timetable', 'academic')),
  title text not null,
  entry_date date,
  meta text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_student_profiles_admission on public.student_profiles(admission_no);
create index if not exists idx_student_bus_assignments_student on public.student_bus_assignments(student_id);
create index if not exists idx_school_diary_entries_type_order on public.school_diary_entries(entry_type, sort_order, entry_date);

