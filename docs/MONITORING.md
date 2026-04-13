# Monitoring and alerting

## Client errors (Sentry)

1. Create a **Browser** project in Sentry and copy the DSN.
2. Set in [`js/app-config.js`](../js/app-config.js):

```js
sentryDsn: 'https://xxxx@xxxx.ingest.sentry.io/xxxx',
environment: 'production',
release: 'busbuddy-web@2026.04.13',
```

3. [`js/observability.js`](../js/observability.js) loads the Sentry bundle only when `sentryDsn` is non-empty.

Tune sample rates in `observability.js` as traffic grows.

## Supabase

- Use Supabase Dashboard **Logs** for Auth, Postgres, and Edge Functions.
- Set **log drains** or export to your SIEM if required by the school district.

## Edge Functions

- Alert on **5xx rate**, latency p95, and **Twilio error** spikes.
- Log structured fields: `studentAdmission` (hash if needed), `bus`, `sent`, `failed` (see `SMS_INTEGRATION.md`).

## Uptime

- Synthetic check: HTTPS `GET` on `track.html` and `driver.html` (200, &lt; 3s).
- Optional: ping `get_parent_profile` with a disabled test admission → expect null (does not prove DB health but catches gross outages).

## Dashboards

Minimum panels: function invocations, DB CPU, realtime connections, SMS success ratio.
