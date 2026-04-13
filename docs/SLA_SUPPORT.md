# Support and SLA (draft)

**Draft for pilots — adjust per contract and region.**

## Channels

- **Email**: support@yourdomain (configure before launch).
- **Escalation**: engineering on-call for P1 (see below).

## Severity levels

| Severity | Definition | Target first response |
|----------|------------|------------------------|
| **P1** | Complete outage: map down, no location updates school-wide | 4 business hours (pilot) |
| **P2** | Major degradation: SMS failing, partial buses | 1 business day |
| **P3** | Minor bug / feature question | 2 business days |

Business hours: define per territory (e.g. Mon–Fri 08:00–18:00 local).

## SLA (uptime)

- Pilot: **best effort**, no financial SLA.
- Paid: target **99.5%** monthly excluding Supabase/Vercel/Twilio scheduled maintenance and third-party outages.

## Customer responsibilities

- Accurate roster and guardian phone data.
- Timely creation of driver/teacher/parent Auth links.
- Compliance with [`docs/PRIVACY_POLICY.md`](PRIVACY_POLICY.md) and school policies.

## Status communication template (outage)

> We are investigating reduced availability of BusBuddy (live map / notifications). Updates every 60 minutes. ETA: TBD.
