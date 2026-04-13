# Operations runbook

## Deploy frontend (Vercel)

1. Merge to `main`.
2. Vercel auto-builds static output (`vercel.json` uses repo root as output).
3. Verify `track.html` and `driver.html` over HTTPS.

## Deploy database / functions

- Windows: [`scripts/deploy-supabase.ps1`](../scripts/deploy-supabase.ps1)
- Or: `supabase db push` and `supabase functions deploy <name>`

After migration deploy, run smoke tests from [`docs/ONBOARDING_SCHOOL.md`](ONBOARDING_SCHOOL.md).

## Rollback

### Frontend

- Vercel: **Promote previous deployment** or revert Git commit and redeploy.

### Database

- Migrations are forward-only in production; plan **compensating migrations** instead of `db reset` on prod.
- For catastrophic failure, use Supabase backup restore to a new project and repoint `js/app-config.js` (emergency only).

### Edge Functions

- Redeploy previous Git revision: `supabase functions deploy send-parent-sms --project-ref ...` from the known-good tag.

## Incidents

### SMS spam / abuse

1. Disable or rate-limit `send-parent-sms` at API gateway if present.
2. Rotate Twilio credentials if compromise suspected.
3. Review logs for abnormal `recipients` patterns.

### Location spoofing / bad data

1. Disable affected driver account in `driver_accounts`.
2. Audit recent `bus_state` rows for the bus_id.

### Supabase outage

1. Post status to school contacts (template in `docs/SLA_SUPPORT.md`).
2. Follow Supabase status page; enable maintenance page on CDN if extended.

## Known workspace issues

Some paths under `supabase/functions/` have reported filesystem corruption on certain machines. If TypeScript sources are unreadable, restore from Git or re-clone before deploying functions.
