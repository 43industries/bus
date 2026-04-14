# BusBuddy v1 — product scope (market package)

## In scope (v1)

- **Live map** (`track.html`): bus position from `bus_state`, optional parent context from session storage.
- **Driver sharing** (`driver.html`): authenticated driver posts location via Edge Function.
- **Trip lifecycle** (`trip-events` Edge Function + `trips`/`trip_events` tables):
  - Full **school → home → school** loop with 6 statuses: `LEFT_SCHOOL`, `EN_ROUTE_TO_HOME`, `ARRIVED_HOME_STOP`, `LEFT_HOME_AREA`, `RETURNING_TO_SCHOOL`, `ARRIVED_SCHOOL`.
  - Driver controls trip progression from `driver.html`.
  - **Automatic SMS + app push** to all parents on `LEFT_SCHOOL` and `ARRIVED_HOME_STOP`.
  - Forward-only status progression with duplicate prevention (`UNIQUE` constraint).
  - Full audit trail via `notification_log` (channel, delivery status, provider SID).
- **Live tracking visibility**:
  - Parents see live bus from `LEFT_SCHOOL` to `ARRIVED_HOME_STOP` via Realtime on `track.html` and `index.html`.
  - Fleet manager / school admin see live bus for the **full loop** (school → home → school).
- **Parent profile RPC**: `get_parent_profile(admission)` for bundled student + bus + guardian display.
- **School diary (shared)**: read active `school_diary_entries` (events, timetable, academic).
- **My diary**: read via `get_my_diary(admission)`; **writes** via `save_my_diary` for **authenticated** teachers (`teacher_accounts`) or **authenticated** guardians linked via `parent_accounts` + `student_guardians`.
- **SMS**: `send-parent-sms` Edge Function (Twilio) per `SMS_INTEGRATION.md`; trip-triggered SMS via `trip-events` Edge Function.

## Explicitly out of scope for v1 (defer)

- Native mobile apps (wrap PWA later if needed).
- Multi-tenant self-serve school signup UI.
- Fine-grained admin RBAC UI (use SQL / dashboard initially).
- Admission-based **write** APIs without auth (removed for security).
- Automatic geofence-based trip status detection (manual driver progression for v1).

## Privacy / UX notes

- Positioning: **approximate** bus location for safety/transparency, not home surveillance.
- Admission numbers are sensitive identifiers; prefer school communication to parents about safe storage of links and codes.
- GPS stale handling: if bus location is older than 2 minutes, UI shows "last seen" with orange indicator instead of false "Live" status.

## Success metrics (pilot)

- Time-to-first-live-bus &lt; 1 school day after credentials issued.
- % of scheduled runs with ≥1 successful driver heartbeat during window.
- Parent map loads without error; SMS delivery rate &gt; 95% for opted-in guardians.
- Parents receive exactly 2 SMS per trip (left school + arrived home) with zero duplicates.
- Trip status progresses through all events in order with no gaps or repeats.
