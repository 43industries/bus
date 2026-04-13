# School onboarding checklist

## 1. Supabase project

- [ ] Create or use dedicated Supabase project (prod).
- [ ] Run all migrations (`supabase db push` or `scripts/deploy-supabase.ps1`).
- [ ] Configure Auth (email/password for drivers/teachers; phone/email for parents if used).
- [ ] Set Edge Function secrets (Twilio, etc.) per `SMS_INTEGRATION.md`.

## 2. Data setup

- [ ] Import or enter `student_profiles` (admission numbers, active flag).
- [ ] Enter `parent_guardians` and `student_guardians` (SMS recipients).
- [ ] Configure `student_bus_assignments` (bus IDs / labels / run types).
- [ ] Optional: `school_diary_entries`, seed `my_diary` via teachers/parents after go-live.

## 3. Accounts

- [ ] **Drivers**: create Auth users; link to `driver_accounts` (see `supabase/migrations/20260328_driver_accounts.sql` and manual SQL).
- [ ] **Teachers** (diary editors): create Auth users; insert `teacher_accounts` (`supabase/manual/insert_teacher_account.sql`).
- [ ] **Parents** (diary writes): create Auth users; insert `parent_accounts` mapping to the correct `guardian_id` (`supabase/manual/insert_parent_account.sql`).

## 4. Frontend config

- [ ] Update `js/app-config.js` with production Supabase URL, anon key, `driverLocationFunctionUrl`, optional `analyticsEndpoint` / `sentryDsn` (`docs/ANALYTICS.md`, `docs/MONITORING.md`).
- [ ] Deploy to Vercel (or host static files behind HTTPS).

## 5. Validation

- [ ] Driver can log in, start sharing, see updates on `track.html`.
- [ ] Map shows correct bus; realtime subscription works (Realtime publication includes `bus_state`).
- [ ] Test SMS to one guardian number.
- [ ] Teacher can save diary; linked parent can save diary; unlinked user cannot.

## 6. Handover

- [ ] Share driver quickstart (login URL, bus assignment expectation).
- [ ] Share parent quickstart (map URL, how admission / session works).
- [ ] Document school IT contact and escalation path (`docs/SLA_SUPPORT.md`).
