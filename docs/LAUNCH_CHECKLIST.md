# Launch go / no-go checklist

Use before marketing launch or first paid school.

## Technical gate

- [ ] CI green: Gitleaks + `npm run lint` + `npm test` on `main`.
- [ ] `npm run preflight` passes (function names, required files, config keys).
- [ ] Production migrations applied; `save_my_diary` **not** granted to `anon`.
- [ ] Smoke test: driver share → map updates; SMS test send OK.
- [ ] Backup / restore drill completed this quarter ([`BACKUP_RESTORE.md`](BACKUP_RESTORE.md)).
- [ ] Monitoring: Sentry DSN or equivalent error visibility ([`MONITORING.md`](MONITORING.md)).

## Product gate

- [ ] [`ONBOARDING_SCHOOL.md`](ONBOARDING_SCHOOL.md) completed for at least one pilot.
- [ ] Parents can open map; drivers trained on start/stop sharing.
- [ ] Diary flows validated for teacher + linked parent.

## Commercial gate

- [ ] [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) and [`TERMS.md`](TERMS.md) **lawyer-approved** and published.
- [ ] Pricing and SMS economics agreed ([`PRICING.md`](PRICING.md)).
- [ ] Support channel live; SLA text agreed with customer ([`SLA_SUPPORT.md`](SLA_SUPPORT.md)).

## Sign-off

| Role | Name | Date | Go / No-go |
|------|------|------|------------|
| Engineering | | | |
| Product | | | |
| Legal | | | |

**Go** only if all sections are satisfied or explicitly waived in writing.
