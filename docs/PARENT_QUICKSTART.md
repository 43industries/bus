# Parent quickstart

1. Open the **live map** URL your school shared (usually `track.html` on BusBuddy).
2. If the school uses **admission-based context**, follow their instructions to open the link from the school portal or app (session storage may store `bb_parent_admission` for personalized labels).
3. **Trip notifications**: you will automatically receive **2 alerts per trip** — once when the bus leaves school, and again when it arrives at the home stop. Alerts arrive via both **SMS** and **in-app push** (a toast on the live map).
4. **Live tracking**: the map shows the bus in real time from when it leaves school until it arrives at your stop. If GPS data is older than 2 minutes, the indicator turns orange with a "last seen" timestamp.
5. **Diary**: viewing often uses your child's admission as issued by the school. **Saving** diary entries requires a **school-created login** linked to your guardian record — ask the office if you cannot save.
6. **SMS**: ensure your mobile number on file is correct; message and data rates may apply.

For schools: map `parent_accounts` after creating the parent's Auth user ([`supabase/manual/insert_parent_account.sql`](../supabase/manual/insert_parent_account.sql)).
