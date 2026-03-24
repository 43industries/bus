# SMS + School Diary Integration

This project now supports:
- multi-guardian SMS fanout from the parent app
- school diary sections (events, timetable, academic days)
- trip notifications to guardians

## 1) Frontend webhook setting

Supabase project URL and anon key live in **`js/app-config.js`** (shared with `track.html` / `driver.html`).

`index.html` picks the SMS function URL automatically:

- **localhost / 127.0.0.1** → `http://127.0.0.1:54321/functions/v1/send-parent-sms`
- **Any other host** → `{SUPABASE_URL}/functions/v1/send-parent-sms` (hosted project)

To force a URL, replace `resolveSmsWebhookUrl()` / `SMS_WEBHOOK_URL` in the script block.

## 2) Deploy the edge function

Function path:

`supabase/functions/send-parent-sms/index.ts`

Deploy:

```bash
supabase functions deploy send-parent-sms
```

## 3) Configure secrets (Twilio)

Set these secrets in Supabase:

```bash
supabase secrets set TWILIO_ACCOUNT_SID=xxx
supabase secrets set TWILIO_AUTH_TOKEN=xxx
supabase secrets set TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxx
# OR use sender phone:
# supabase secrets set TWILIO_FROM_PHONE=+1xxxxxxxxxx
```

## 4) Request contract (frontend -> function)

`POST /functions/v1/send-parent-sms`

```json
{
  "studentAdmission": "ADM1001",
  "studentName": "Mercy Jebet",
  "bus": "bus_07",
  "recipients": ["+254712345001", "+254712345002"],
  "message": "Bus left school compound for Westlands Shopping Mall."
}
```

## 5) Response shape

```json
{
  "studentAdmission": "ADM1001",
  "studentName": "Mercy Jebet",
  "bus": "bus_07",
  "sent": 2,
  "failed": 0,
  "results": [
    { "to": "+254712345001", "ok": true, "status": 201, "sid": "SM...", "error": null }
  ]
}
```

## 6) Database RLS + parent profile

Migration `20260324_rls_parent_profile_rpc.sql` enables RLS on student/guardian tables (no direct `anon` reads), exposes **`get_parent_profile(p_admission text)`** for one-row parent login payloads, and allows `anon` to read **`school_diary_entries`** (active rows) and **`bus_state`** (live map). Apply it with `supabase db push` or `supabase db reset`. If realtime updates stop for the map, add **`bus_state`** to the `supabase_realtime` publication in the dashboard.

## 7) Security notes

- Prefer calling this function with authenticated parent/session context.
- Validate recipients against guardian records server-side (not only frontend).
- Add rate limits per student and per guardian to prevent SMS abuse.
- Log all sends (`student`, `bus`, `message`, `recipients`, `status`) for audit.

