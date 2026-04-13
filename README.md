# BusBuddy

School transport transparency: live bus map for parents, driver location sharing, SMS notifications, and school diary features. Static web app (Vercel) + [Supabase](https://supabase.com) (Postgres, Auth, Edge Functions).

## Quick start

1. Clone the repo.
2. Configure [`js/app-config.js`](js/app-config.js) with your Supabase URL, anon key, and Edge Function URLs.
   You can optionally inject deployment-specific overrides with `window.BUSBUDDY_RUNTIME_CONFIG` before loading `app-config.js`.
3. Open `track.html` or `driver.html` via a local static server (or deploy to Vercel).

```bash
npx --yes serve .
```

## Database

```bash
supabase link   # once per project
supabase db reset   # local: migrations + seed
```

Deploy migrations to hosted Supabase:

```bash
./scripts/deploy-supabase.ps1   # Windows
# or: supabase db push
```

**After cloning:** hosted migration push, Vercel token rotation, parent diary linking, and legal steps are in [docs/HOSTED_SETUP_FOLLOWUP.md](docs/HOSTED_SETUP_FOLLOWUP.md).

See [`SMS_INTEGRATION.md`](SMS_INTEGRATION.md) for SMS function and RLS overview.

## Security

See [`SECURITY.md`](SECURITY.md). Run `npm test` and CI Gitleaks before release.

## Docs index

| Doc | Purpose |
|-----|---------|
| [docs/PRODUCT_V1_SCOPE.md](docs/PRODUCT_V1_SCOPE.md) | Market v1 scope |
| [docs/ONBOARDING_SCHOOL.md](docs/ONBOARDING_SCHOOL.md) | School / driver / parent onboarding |
| [docs/PARENT_QUICKSTART.md](docs/PARENT_QUICKSTART.md) | Parent-facing one-pager |
| [docs/DRIVER_QUICKSTART.md](docs/DRIVER_QUICKSTART.md) | Driver-facing one-pager |
| [docs/ANALYTICS.md](docs/ANALYTICS.md) | Optional analytics endpoint |
| [docs/MONITORING.md](docs/MONITORING.md) | Errors / Sentry |
| [docs/BACKUP_RESTORE.md](docs/BACKUP_RESTORE.md) | Backups & RPO/RTO |
| [docs/RUNBOOK.md](docs/RUNBOOK.md) | Incidents, rollback, deploy |
| [docs/PRICING.md](docs/PRICING.md) | Packaging & pricing draft |
| [docs/SLA_SUPPORT.md](docs/SLA_SUPPORT.md) | Support tiers & SLA draft |
| [docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md) | Privacy (template — legal review) |
| [docs/TERMS.md](docs/TERMS.md) | Terms (template — legal review) |
| [docs/TRUST_SECURITY.md](docs/TRUST_SECURITY.md) | Trust / security overview |
| [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md) | Go / no-go |
| [docs/HOSTED_SETUP_FOLLOWUP.md](docs/HOSTED_SETUP_FOLLOWUP.md) | Push migration, Vercel rotation, parents, legal |

## Scripts

- `npm run lint` — static asset checks  
- `npm test` — migration / security assertions  

## License

Proprietary unless otherwise stated.
