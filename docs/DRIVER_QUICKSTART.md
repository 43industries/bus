# Driver quickstart

1. Open the **driver** page URL from your school (usually `driver.html`).
2. Sign in with the **email and password** the school issued.
3. Tap **Start sharing** and allow **location** when the browser prompts.
4. **Trip controls** appear once sharing starts. Use them to update your trip status:
   - **Left school** — starts the trip and notifies all parents via SMS + push.
   - **En route home** / **Arrived home stop** — mark progress; "Arrived home stop" sends a second SMS + push to parents.
   - **Left home area** / **Returning to school** / **Arrived at school** — complete the loop.
5. Status can only move **forward** (school → home → school); you cannot skip or go back.
6. Keep the page open (or the browser tab active) while on the route; tap **Stop** when finished.
7. If updates fail, check signal and re-login; contact school transport if the bus still does not appear on the parent map.

Schools: ensure each driver has a row in `driver_accounts` matching their Supabase Auth user (see migration `20260328_driver_accounts.sql` and manual SQL under `supabase/manual/`).
