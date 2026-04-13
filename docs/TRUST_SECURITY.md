# Trust and security overview

Audience: school IT / procurement. Complement legal documents in [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) and [`TERMS.md`](TERMS.md).

## Architecture (summary)

- **Static web** (e.g. Vercel): `track.html`, `driver.html`, shared [`js/app-config.js`](../js/app-config.js).
- **Supabase**: PostgreSQL with **Row Level Security**, Auth, Realtime, Edge Functions.
- **Twilio** (optional): SMS delivery via Edge Function.

## Access control

- **Anon key** is public; protection is via RLS and restricted RPC grants ([`SECURITY.md`](../SECURITY.md)).
- **Drivers** authenticate; location updates go through a server-side function using driver linkage tables.
- **Diary writes**: teachers via `teacher_accounts`; parents via `parent_accounts` + `student_guardians`. Anonymous diary writes are not permitted.

## Data in transit / at rest

- Browser ↔ Supabase / Vercel over **HTTPS**.
- Supabase provides platform-level encryption at rest (per Supabase documentation for your plan).

## Logging and audit

- Log SMS sends and server errors; avoid logging full message bodies in production if not needed.
- Enable Sentry or equivalent per [`MONITORING.md`](MONITORING.md).

## Incident response

See [`RUNBOOK.md`](RUNBOOK.md). Notify affected schools per contract and applicable breach-notification laws.

## Vendor management

Maintain a subprocessors list (Supabase, Vercel, Twilio, Sentry, analytics collector if used).
