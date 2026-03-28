-- Link a Supabase Auth user to teacher_accounts so they can save_my_diary as teacher.
-- The user must exist under Authentication → Users (staff email).

-- By email:
insert into public.teacher_accounts (user_id, display_name)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
from auth.users u
where lower(u.email) = lower(trim('teacher@school.edu'))
on conflict (user_id) do update
set display_name = excluded.display_name;

-- Verify:
select t.*, u.email from public.teacher_accounts t join auth.users u on u.id = t.user_id;
