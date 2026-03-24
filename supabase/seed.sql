-- BusBuddy demo seed: students, guardians, bus assignments, school diary.
-- Loaded after migrations when you run: supabase db reset
-- Safe to re-run: uses ON CONFLICT on natural keys.

-- ===== Students (matches index.html demo admissions) =====
insert into public.student_profiles (
  id, admission_no, student_name, parent_name, home_stop_name, home_lat, home_lng
)
values
  (
    '11111111-1111-4111-8111-111111111101',
    'ADM1001',
    'Mercy Jebet',
    'Mrs. Jebet',
    'Westlands Shopping Mall',
    -1.26631,
    36.80444
  ),
  (
    '11111111-1111-4111-8111-111111111102',
    'ADM1002',
    'Tom Barasa',
    'Mr. Barasa',
    'Riverside Drive',
    -1.26895,
    36.80305
  )
on conflict (admission_no) do update
set
  student_name = excluded.student_name,
  parent_name = excluded.parent_name,
  home_stop_name = excluded.home_stop_name,
  home_lat = excluded.home_lat,
  home_lng = excluded.home_lng;

-- ===== Guardians =====
insert into public.parent_guardians (id, full_name, phone, relation)
values
  ('22222222-2222-4222-8222-222222222201', 'Mrs. Jebet', '+254712345001', 'mother'),
  ('22222222-2222-4222-8222-222222222202', 'Mr. Jebet', '+254712345002', 'father'),
  ('22222222-2222-4222-8222-222222222203', 'Aunt Carol', '+254712345003', 'aunt'),
  ('22222222-2222-4222-8222-222222222301', 'Mr. Barasa', '+254722111101', 'father'),
  ('22222222-2222-4222-8222-222222222302', 'Mrs. Barasa', '+254722111102', 'mother')
on conflict (phone) do update
set full_name = excluded.full_name, relation = excluded.relation;

-- ===== Student ↔ guardian (receives_sms: Aunt Carol off for demo) =====
insert into public.student_guardians (student_id, guardian_id, receives_sms)
values
  ('11111111-1111-4111-8111-111111111101', '22222222-2222-4222-8222-222222222201', true),
  ('11111111-1111-4111-8111-111111111101', '22222222-2222-4222-8222-222222222202', true),
  ('11111111-1111-4111-8111-111111111101', '22222222-2222-4222-8222-222222222203', false),
  ('11111111-1111-4111-8111-111111111102', '22222222-2222-4222-8222-222222222301', true),
  ('11111111-1111-4111-8111-111111111102', '22222222-2222-4222-8222-222222222302', true)
on conflict (student_id, guardian_id) do update
set receives_sms = excluded.receives_sms;

-- ===== Bus / van assignments (fixed ids so seed is idempotent) =====
insert into public.student_bus_assignments (id, student_id, bus_id, bus_label, run_type)
values
  (
    '44444444-4444-4444-8444-444444444401',
    '11111111-1111-4111-8111-111111111101',
    'bus_07',
    'Bus 07 (Morning + Evening)',
    'all'
  ),
  (
    '44444444-4444-4444-8444-444444444402',
    '11111111-1111-4111-8111-111111111101',
    'van_03',
    'Van 03 (Backup vehicle)',
    'all'
  ),
  (
    '44444444-4444-4444-8444-444444444403',
    '11111111-1111-4111-8111-111111111102',
    'bus_07',
    'Bus 07 (Main)',
    'all'
  )
on conflict (id) do update
set
  student_id = excluded.student_id,
  bus_id = excluded.bus_id,
  bus_label = excluded.bus_label,
  run_type = excluded.run_type;

-- ===== School diary (de-dupe by stable id) =====
insert into public.school_diary_entries (id, entry_type, title, entry_date, meta, sort_order)
values
  (
    '33333333-3333-4333-8333-333333333301',
    'events',
    'Parents Meeting',
    '2026-05-04',
    'Main Hall · 10:00 AM',
    10
  ),
  (
    '33333333-3333-4333-8333-333333333302',
    'events',
    'Science Fair',
    '2026-05-10',
    'Grade 4-6 · School Grounds',
    20
  ),
  (
    '33333333-3333-4333-8333-333333333303',
    'events',
    'Sports Day',
    '2026-05-16',
    'All classes · 8:30 AM',
    30
  ),
  (
    '33333333-3333-4333-8333-333333333401',
    'timetable',
    'Morning Classes',
    null,
    'Mon-Fri · 7:40 AM - 12:30 PM',
    10
  ),
  (
    '33333333-3333-4333-8333-333333333402',
    'timetable',
    'Clubs & Activities',
    null,
    'Mon-Thu · 2:30 PM - 4:00 PM',
    20
  ),
  (
    '33333333-3333-4333-8333-333333333403',
    'timetable',
    'Guidance Session',
    null,
    'Friday · 1:30 PM - 2:30 PM',
    30
  ),
  (
    '33333333-3333-4333-8333-333333333501',
    'academic',
    'Mid-term Exams Start',
    '2026-06-05',
    'All grades',
    10
  ),
  (
    '33333333-3333-4333-8333-333333333502',
    'academic',
    'Exam Review Day',
    '2026-06-12',
    'Teachers + Parents Portal',
    20
  ),
  (
    '33333333-3333-4333-8333-333333333503',
    'academic',
    'Term Closing Day',
    '2026-07-24',
    'Report cards released',
    30
  )
on conflict (id) do update
set
  entry_type = excluded.entry_type,
  title = excluded.title,
  entry_date = excluded.entry_date,
  meta = excluded.meta,
  sort_order = excluded.sort_order;
