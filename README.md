# Sweety – Blood Glucose Tracker

A small MERN-style app (Express + PostgreSQL instead of Mongo, React frontend) for
recording up to 4 blood glucose readings a day and viewing daily / month-to-date /
monthly reports.

```
assignment/
  backend/     Express API (Sequelize + PostgreSQL, JWT auth)
  frontend/    React app (Vite)
  AI_NOTES.md  Decisions made and assumptions, written while building this
```

## Backend

```bash
cd backend
npm install
cp .env.example .env     # edit DB credentials and JWT_SECRET
npm run dev               # http://localhost:5000
```

The server creates the `users` and `readings` tables automatically on startup
(`sequelize.sync()`), so there is no separate migration step — just make sure
the database named in `.env` (default `sweety`) exists:

```bash
createdb sweety   # or: psql -U postgres -c "CREATE DATABASE sweety;"
```

### Tests

```bash
cd backend
npm test
```

Tests run against an in-memory SQLite database (no Postgres required) — see
AI_NOTES.md for why. 27 tests cover validation rules, report date-range math,
and the auth/readings/reports API end to end.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env     # defaults to http://localhost:5000/api
npm run dev                # http://localhost:5173
```

The dev server proxies `/api` to `http://localhost:5000`, so the `.env` value
only matters for a production build.

## API summary

| Method | Path | Notes |
|---|---|---|
| POST | /api/auth/register | name, email, password |
| POST | /api/auth/login | email, password |
| GET | /api/readings?page=&limit= | paginated, auth required |
| POST | /api/readings | date, slot, value |
| PUT | /api/readings/:id | date, slot, value |
| DELETE | /api/readings/:id | |
| GET | /api/reports/daily?date= | |
| GET | /api/reports/month-to-date?date= | |
| GET | /api/reports/monthly?date= | previous calendar month |

`slot` is one of `morning`, `after_breakfast`, `after_lunch`, `after_dinner`.

## Bonus tasks implemented

- **Pagination** on `GET /readings` (`?page=&limit=`), wired up in the Dashboard UI.
- **Charts**: the Reports page plots the previous month's readings with Recharts.

Redis caching and the doctor role were not implemented — see AI_NOTES.md for why.
