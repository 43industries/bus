# AGENTS.md

## Cursor Cloud specific instructions

BusBuddy is a **static web app** (plain HTML/CSS/JS, no build step, no bundler) with a
[Supabase](https://supabase.com) backend (Postgres + Auth + Edge Functions). The Node scripts
in `package.json` use only Node's built-in modules, so there are **no npm dependencies to
install** — the app runs by serving the repository root as static files.

### Services

- **Static front-end** — the product. Pages: `index.html` (landing/parent dashboard),
  `track.html` (live map), `driver.html` (driver location sharing), `my-diary.html`.
  Serve the repo root with any static server, e.g. `npx --yes serve . -l 3000`
  (`serve` rewrites `/foo.html` → `/foo`, so open `http://localhost:3000/` , `/track`, `/driver`).
  The landing page has a self-contained **demo mode** ("Skip for demo") that exercises the
  parent/teacher/admin views and arrival-alert notifications without any live backend data.
- **Supabase backend** — optional for local front-end work. `js/app-config.js` points at a
  hosted Supabase project with a public anon key, so the client loads without a local backend.
  Running Supabase locally (`supabase db reset`, edge functions) requires the Supabase CLI +
  Docker and is only needed when changing migrations/functions.

### Lint / test / build / run

Standard commands are defined in `package.json` and mirrored by `.github/workflows/ci.yml`:

- `npm run lint` — static asset existence checks (`scripts/lint-static.mjs`)
- `npm test` — migration/security assertions (`node --test`)
- `npm run preflight` — required-file + config checks (`scripts/preflight.mjs`)
- No build step (`vercel.json` has empty `buildCommand`/`installCommand`).
- Run: `npx --yes serve . -l 3000` (or any static server).
