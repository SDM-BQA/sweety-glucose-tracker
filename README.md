# Sweety – Blood Glucose Tracker

A small MERN-style app (Express + PostgreSQL instead of Mongo, React frontend) for
recording up to 4 blood glucose readings a day and viewing daily / month-to-date /
monthly reports. Includes the pagination, chart, and doctor-role bonus tasks.

```
assignment/
  backend/     Express API (Sequelize + PostgreSQL, JWT auth)
  frontend/    React app (Vite)
  AI_NOTES.md  Decisions, assumptions and dead ends, written while building this
```

## 1. Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 2. Set up the database

You need a PostgreSQL database — either a local install or a free hosted one
(e.g. [Neon](https://neon.tech)). Either way, copy the backend's env file:

```bash
cd backend
cp .env.example .env
```

Then edit `.env` with **one** of these two connection styles:

- **Hosted / single connection string** (Neon, Supabase, Render, …):

  ```env
  DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
  ```

- **Local Postgres** (separate fields):

  ```env
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=sweety
  DB_USER=postgres
  DB_PASSWORD=postgres
  ```

  Create the database first: `createdb sweety` (or `psql -U postgres -c "CREATE DATABASE sweety;"`).

Also set `JWT_SECRET` to any long random string, and `JWT_EXPIRES_IN` (defaults to `7d`).

There's no separate migration step — the server creates/updates tables itself
on startup via `sequelize.sync({ alter: true })` (see AI_NOTES.md for the
tradeoff this makes vs. a real migration tool).

## 3. Run the server

```bash
cd backend
npm run dev      # http://localhost:5000, auto-restarts on change
# or: npm start  # plain node, no auto-restart
```

## 4. Seed demo data (optional but recommended)

```bash
cd backend
npm run seed
```

Creates two accounts against whatever database your `.env` points at:

| Role | Email | Password | Notes |
|---|---|---|---|
| Patient | `demo@sweety.app` | `demo1234` | ~45 days of randomized readings |
| Doctor | `doctor@sweety.app` | `demo1234` | already assigned the demo patient |

Safe to re-run — it replaces the demo patient's readings each time instead of
duplicating them, and won't create a second copy of either account.

## 5. Run the frontend

```bash
cd frontend
cp .env.example .env    # defaults to http://localhost:5000/api
npm run dev               # http://localhost:5173
```

The dev server proxies `/api` to `http://localhost:5000`, so the `.env` value
only matters for a production build (`npm run build`).

## 6. Run the tests

```bash
cd backend
npm test
```

38 tests, run against an in-memory SQLite database so no Postgres instance is
needed to run them (see AI_NOTES.md for why that's safe here). Covers
validation rules, report date-range math, and full HTTP round-trips for
auth, readings, reports, and the doctor-role endpoints — including
authorization checks (a doctor can't see another doctor's patients, a
patient can't hit doctor-only routes).

There are no frontend automated tests — see Notes below.

## API summary

| Method | Path | Notes |
|---|---|---|
| POST | /api/auth/register | name, email, password, optional role (`patient`\|`doctor`) |
| POST | /api/auth/login | email, password |
| GET | /api/readings?page=&limit= | paginated, auth required |
| POST | /api/readings | date, slot, value |
| PUT | /api/readings/:id | date, slot, value |
| DELETE | /api/readings/:id | |
| GET | /api/reports/daily?date= | |
| GET | /api/reports/month-to-date?date= | |
| GET | /api/reports/monthly?date= | previous calendar month |
| GET | /api/patients/me/doctor | patient's currently assigned doctor, or null |
| PUT | /api/patients/me/doctor | `{ doctorEmail }` — assign a doctor |
| DELETE | /api/patients/me/doctor | stop sharing with your doctor |
| GET | /api/doctor/patients | doctor-only: list of assigned patients |
| GET | /api/doctor/patients/:id/reports/{daily,month-to-date,monthly} | doctor-only, same shape as `/api/reports/*` |

`slot` is one of `morning`, `after_breakfast`, `after_lunch`, `after_dinner`.

## Bonus tasks implemented

- **Pagination** on `GET /readings` (`?page=&limit=`), wired up in the Dashboard UI.
- **Charts**: the Reports page plots the current month's readings with Recharts.
- **Doctor role**: a user can register as a doctor; a patient can share their
  readings with one doctor by email from their dashboard; the doctor gets a
  patient list and can view (read-only) any of their patients' daily /
  month-to-date / monthly reports.

Redis caching of reports was not implemented — see Notes below.

## Notes

**Assumptions made along the way** (fuller reasoning for each is in
`AI_NOTES.md`, written as the project was built):

- "Monthly report" means the whole calendar month before the *selected*
  date's month, not always last month relative to today.
- The spec's own example error message uses "an" before every slot name
  (`"You already have an After lunch reading..."`) — kept that literal
  wording for all four slots rather than fixing the grammar for e.g.
  "Morning," since matching the given text exactly seemed more important.
- A patient has at most **one** assigned doctor at a time (not a
  many-to-many relationship) — the bonus task describes a doctor viewing
  "patients assigned to them," and a single `doctorId` column is the
  simplest schema that satisfies that without inventing an invite/admin
  flow the brief doesn't ask for.
- A patient shares their own readings by entering their doctor's email
  (self-service), rather than a doctor adding patients by ID — there's no
  admin role or email system in this app, so this is the lowest-friction
  flow that still requires the doctor's account to already exist.

**What I'd improve with more time:**

- **Redis caching** for report endpoints, invalidated on reading
  create/update/delete. Skipped because reports are a couple of indexed
  date-range queries — cheap enough that caching would add complexity
  without a real performance problem to justify it at this scale, but it's
  the obvious next step if read traffic grew.
- **Real migrations** (e.g. `sequelize-cli` or Umzug) instead of
  `sequelize.sync({ alter: true })`. Fine for a single-developer take-home
  against one database, but `alter: true` does more invasive schema
  diffing than I'd want unreviewed against a production table.
- **Many-to-many doctor assignment**, if a patient needed to share with
  more than one provider.
- **Frontend test coverage.** Backend tests cover the business rules;
  the frontend was instead verified by `npm run build` succeeding and
  manual review, which doesn't catch everything a real test would.
- I did not have a browser automation tool available while building this,
  so the UI was verified through API-level testing, build checks, and the
  user's own manual review/screenshots rather than an automated visual
  check — worth a thorough manual pass before considering it fully done.
