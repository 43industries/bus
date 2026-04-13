# Backup and restore

## Supabase (hosted)

- **Point-in-time recovery (PITR)** and automated backups depend on your Supabase plan. Confirm in Project Settings → Database.
- Document your **RPO** (acceptable data loss window) and **RTO** (time to restore service).

### Suggested targets (adjust per contract)

| Metric | Pilot | Paid v1 |
|--------|-------|---------|
| RPO | ≤ 24 h | ≤ 1 h (if PITR enabled) |
| RTO | ≤ 8 h | ≤ 4 h |

## Restore drill (quarterly)

1. Restore to a **staging** project or branch (Supabase branching if available).
2. Run smoke tests: driver login, map load, RPC `get_parent_profile` with test admission.
3. Record date, duration, and gaps in `docs/RUNBOOK.md` appendix or internal ticket.

## Application config

- Export Vercel / environment config (non-secret inventory) so redeploy is reproducible.
- Secrets are **not** in git; store in Supabase/Vercel secret managers only.
