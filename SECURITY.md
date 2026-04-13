# BusBuddy security

## Secrets

- **Never commit** `.env*.local`, service-role keys, Twilio auth tokens, or OIDC tokens.
- If any credential was ever committed or shared, **rotate it immediately** (Vercel: see [docs/HOSTED_SETUP_FOLLOWUP.md](docs/HOSTED_SETUP_FOLLOWUP.md) §2; Supabase: rotate keys in dashboard; Twilio: rotate auth token).
- `.env.local` is gitignored; use [`.env.local.example`](.env.local.example) as a template.

## Client config (`js/app-config.js`)

The Supabase **anon** key is a public, client-safe key. Security relies on **Row Level Security (RLS)** and **restricted RPC grants**, not on hiding the anon key.

## Diary writes (`save_my_diary`)

- **Anonymous** clients cannot execute `save_my_diary` (migration `20260413_parent_accounts_diary_writes.sql`).
- **Parents** must be signed in and listed in `parent_accounts` for a guardian linked to the student via `student_guardians`. See [`supabase/manual/insert_parent_account.sql`](supabase/manual/insert_parent_account.sql).
- **Teachers** must be signed in and listed in `teacher_accounts`.

## Parent read paths

`get_my_diary` and `get_parent_profile` still allow admission-based access for the current product UX. Treat admission numbers as sensitive; use rate limiting at the edge where possible. See [docs/PRODUCT_V1_SCOPE.md](docs/PRODUCT_V1_SCOPE.md).

## CI

Pull requests run secret scanning (Gitleaks). Review findings before merging.
