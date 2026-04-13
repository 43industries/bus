# Hosted setup follow-up (migration, Vercel, parents, legal)

Do these on **your** machine or in the Supabase / Vercel dashboards. This repo cannot push to your hosted project without the Supabase CLI and your login.

## 1. Apply the new migration (`20260413_parent_accounts_diary_writes.sql`)

**Option A — CLI (recommended)**

```powershell
# Install CLI once: https://supabase.com/docs/guides/cli/getting-started
# scoop install supabase   OR   npm i -g supabase

cd e:\bus
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>   # if not already linked
supabase db push
```

**Option B — PowerShell script (migrations + functions)**

```powershell
cd e:\bus
.\scripts\deploy-supabase.ps1
```

Requires `supabase` on `PATH` and the same `login` / `link` as above.

**Option C — Dashboard SQL (if you cannot use CLI)**

1. Open Supabase → **SQL Editor**.
2. Paste the full contents of [`supabase/migrations/20260413_parent_accounts_diary_writes.sql`](../supabase/migrations/20260413_parent_accounts_diary_writes.sql).
3. Run once. If `parent_accounts` already exists from a partial run, adjust or run only the `create or replace function` + `revoke`/`grant` section.

After push, confirm in **Database → Roles** or SQL:

```sql
-- Should succeed for authenticated only; anon should not have EXECUTE
select has_function_privilege('anon', 'public.save_my_diary(text, jsonb, text)', 'EXECUTE');      -- expect false
select has_function_privilege('authenticated', 'public.save_my_diary(text, jsonb, text)', 'EXECUTE'); -- expect true
```

---

## 2. Rotate the exposed Vercel OIDC token

A `VERCEL_OIDC_TOKEN` that left the machine (e.g. in `.env.local`) should be treated as compromised.

1. **Remove local copy**  
   - Do not store the old token anywhere.  
   - If you use `vercel env pull`, regenerate after re-auth (below).

2. **Vercel account / project security**  
   - In [Vercel Dashboard](https://vercel.com/dashboard) → your **Account Settings** → review **Tokens** (personal access tokens) and **revoke** any token you suspect was exposed or that was active when the leak happened.  
   - OIDC-style tokens used by the CLI are typically **short-lived**; revoking PATs and re-authenticating limits blast radius.

3. **Re-authenticate the CLI**

   ```powershell
   vercel logout
   vercel login
   ```

4. **Refresh local env (optional)**

   ```powershell
   cd e:\bus
   vercel link    # if needed
   vercel env pull
   ```

   Ensure [`.gitignore`](../.gitignore) keeps ignoring `.env*.local` and never commit pulled files.

If your team uses **GitHub OIDC** or **Vercel for Git**, confirm no CI secrets referenced the leaked value.

---

## 3. Link parents who must edit the diary (`parent_accounts`)

After **`save_my_diary`** hardening, **anonymous** calls no longer work. Each parent editor needs:

1. A **Supabase Auth** user (email magic link, phone OTP, or email/password — match your school process).
2. A row in **`parent_accounts`** tying `auth.users.id` → `parent_guardians.id` for a guardian who is already in **`student_guardians`** for that child.

**Steps**

1. In Dashboard → **Authentication → Users**, create the user or have them sign up once; copy their **User UUID**.
2. Find **`guardian_id`** (and confirm `student_guardians` links that guardian to the student):

   ```sql
   select pg.id, pg.full_name, pg.phone
   from parent_guardians pg
   join student_guardians sg on sg.guardian_id = pg.id
   join student_profiles sp on sp.id = sg.student_id
   where sp.admission_no = 'ADM1001';
   ```

3. Insert the link:

   ```sql
   insert into public.parent_accounts (user_id, guardian_id)
   values (
     '<AUTH_USER_UUID>'::uuid,
     '<GUARDIAN_UUID>'::uuid
   )
   on conflict (user_id) do update set guardian_id = excluded.guardian_id;
   ```

See also [`supabase/manual/insert_parent_account.sql`](../supabase/manual/insert_parent_account.sql) and [`SMS_INTEGRATION.md`](../SMS_INTEGRATION.md) (My Diary section).

---

## 4. Legal review before publishing Privacy / Terms

The files below are **templates**, not legal advice:

- [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md)
- [`TERMS.md`](TERMS.md)

**Before publication**

1. Engage counsel qualified in your **jurisdiction** (and the school’s, if different).
2. Provide your counsel: entity name, hosting subprocessors (Supabase, Vercel, Twilio, Sentry, any analytics URL), data categories you actually process, retention periods, and whether schools are controllers vs processors.
3. Replace every `[placeholder]` and adjust **children’s data**, **SMS consent**, and **location** sections to match real practices.
4. Host the approved HTML/PDF on your **production domain** and link from the app footer when you add one.
5. Keep an internal **version history** (date + summary of changes).

Until review is complete, do **not** present these documents to schools as final policies.
