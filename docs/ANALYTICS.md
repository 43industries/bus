# Product analytics (optional)

BusBuddy ships a tiny client helper [`js/analytics.js`](../js/analytics.js). Events are **no-ops** until you set a backend URL.

## Configuration

In [`js/app-config.js`](../js/app-config.js):

```js
analyticsEndpoint: 'https://your-collector.example.com/busbuddy-events',
```

## Events (initial)

| Event | When | Payload |
|-------|------|---------|
| `map_session_start` | Parent/public map bootstrapped | `busId`, `parentContext` |
| `driver_login_ok` | Driver password login succeeded | `{}` |
| `driver_sharing_start` | Driver tapped start sharing | `{}` |

## Collector contract

`POST` JSON body:

```json
{
  "event": "map_session_start",
  "props": { "busId": "bus_07", "parentContext": true },
  "ts": "2026-04-13T12:00:00.000Z"
}
```

Implement your endpoint (Cloudflare Worker, Supabase Edge Function, PostHog HTTP API, etc.). Do **not** log admission numbers or PII in `props` without consent and policy.

## Funnel (recommended)

1. School onboarded (manual flag or CRM).
2. Driver session + `driver_sharing_start` at least once per week.
3. `map_session_start` with `parentContext: true` (unique devices — hash client-side if needed).
