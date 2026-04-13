# BusBuddy v1 — product scope (market package)

## In scope (v1)

- **Live map** (`track.html`): bus position from `bus_state`, optional parent context from session storage.
- **Driver sharing** (`driver.html`): authenticated driver posts location via Edge Function.
- **Parent profile RPC**: `get_parent_profile(admission)` for bundled student + bus + guardian display.
- **School diary (shared)**: read active `school_diary_entries` (events, timetable, academic).
- **My diary**: read via `get_my_diary(admission)`; **writes** via `save_my_diary` for **authenticated** teachers (`teacher_accounts`) or **authenticated** guardians linked via `parent_accounts` + `student_guardians`.
- **SMS**: `send-parent-sms` Edge Function (Twilio) per `SMS_INTEGRATION.md`.

## Explicitly out of scope for v1 (defer)

- Native mobile apps (wrap PWA later if needed).
- Multi-tenant self-serve school signup UI.
- Fine-grained admin RBAC UI (use SQL / dashboard initially).
- Admission-based **write** APIs without auth (removed for security).

## Privacy / UX notes

- Positioning: **approximate** bus location for safety/transparency, not home surveillance.
- Admission numbers are sensitive identifiers; prefer school communication to parents about safe storage of links and codes.

## Success metrics (pilot)

- Time-to-first-live-bus &lt; 1 school day after credentials issued.
- % of scheduled runs with ≥1 successful driver heartbeat during window.
- Parent map loads without error; SMS delivery rate &gt; 95% for opted-in guardians.
