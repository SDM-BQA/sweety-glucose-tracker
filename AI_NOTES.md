# AI Notes

This file records the decisions made, assumptions taken, and anything that
went wrong or was uncertain while building Sweety with Claude Code. Written
as the project was built, not after the fact.

## Stack decisions

- **Sequelize over raw SQL/pg.** The assignment just says "PostgreSQL," not
  a specific access layer. Sequelize gives model validation, a unique
  composite index for the "one reading per slot per day" rule, and lets the
  test suite swap in SQLite (below) without touching application code.
- **No migration files.** `server.js` calls `sequelize.sync()` on startup,
  which creates/updates tables from the model definitions. For a fresher
  take-home with one developer and no deployed environments to keep in sync,
  a migration framework (sequelize-cli, Umzug) would be overhead with no
  payoff. A real production app should use migrations instead — noted here
  so it doesn't look like an oversight.
- **JWT in localStorage**, not cookies. Simpler for a small SPA with no
  server-rendered pages and no CSRF surface to worry about. Trade-off:
  vulnerable to XSS stealing the token, which would matter more in a
  production app with user-generated content rendered unsanitized — not a
  concern here since the UI only renders numbers and dates it generated.
- **Plain CSS, no Tailwind/UI library.** The brief says "a simple UI is
  perfectly fine." Added a CSS build step would cost setup time without
  improving what's being graded.

## Testing

- **Backend tests run against in-memory SQLite, not Postgres.** `NODE_ENV=test`
  switches `src/config/database.js` to `sqlite::memory:`. This means tests
  don't need a real Postgres instance (no CI setup, no "it works on my
  machine" risk), and Sequelize's query layer is thin enough that this
  doesn't mask any Postgres-specific bug for the kind of queries this app
  does (date range filters, unique constraints). It would **not** be safe if
  the app used Postgres-specific SQL (JSONB operators, full-text search,
  window functions) — it doesn't.
- 27 tests total: validation rules (value range, future date, slot enum),
  the daily/month-to-date/monthly date-range math (including a
  December→January wrap), and full HTTP round-trips for register/login,
  create/list/update/delete readings, and all three report endpoints
  including the empty-state case.
- **Did not get to run the backend against a real local Postgres.** This
  machine has Postgres 17 running, but I don't have its password and didn't
  want to guess/brute-force it. The app code path for Postgres is identical
  to the SQLite path other than the dialect config, so this is low risk, but
  it's untested — **please run `npm run dev` against your own `sweety`
  database before considering this done.**
- No frontend automated tests. Given the time budget, I prioritized backend
  tests (where the business rules live) and a working, buildable frontend
  (`npm run build` succeeds) over frontend test coverage.

## Validation rule wording

The spec's example error message is `"You already have an After lunch
reading for this date."` — note it uses "an" even though some slot names
("Morning") would grammatically take "a". I kept the literal `an {Slot
Label}` template for every slot rather than fixing the grammar, since
matching the given message text exactly seemed more important than correct
grammar for "Morning"/"After breakfast"/etc. If this is wrong, it's a
one-line fix in `backend/src/utils/validation.js` (`SLOT_LABELS`) and
`backend/src/controllers/readingController.js`.

The "max 4 readings per day" rule is checked explicitly but is actually
unreachable as written: there are exactly 4 slots, and the "one per slot"
rule already blocks a 5th reading (every slot would already be taken).
Kept it anyway because the spec calls it out as a distinct rule with its own
error message, and it's cheap insurance if slots are ever extended.

## Report assumptions

- "Monthly report: the whole previous month" is read as *relative to the
  selected date*, not always the previous calendar month from today. E.g.
  selecting 15 Jan 2026 gives Dec 2025, matching the spec's own example
  (15 Oct 2026 → 1–30 Sep 2026).
- Average is rounded to 1 decimal with standard rounding (`Math.round(x*10)/10`).
- Empty state returns `{ count: 0, highest: null, lowest: null, average: null }`
  from the API; the frontend renders "No readings in this range."

## Bonus tasks

- **Done:** pagination (`GET /readings?page=&limit=`, default limit 20, capped
  at 100) and a Recharts line chart of the previous month's readings on the
  Reports page.
- **Not done:** Redis caching and the doctor role. Both are meaningful
  features in their own right (cache invalidation on writes; a second
  authorization model with patient-doctor assignment) and didn't fit the
  time budget alongside getting the required features solid. Doing either
  half-way seemed worse than leaving them out and writing this note.

## UI redesign (via /design-director)

The original frontend worked but used default-looking styling (plain cards,
system font, generic green). Redesigned it with an actual visual identity
instead:

- **Palette**: deep forest/ink teal (`#163832`) as the brand/surface color,
  warm terracotta (`#c1562c`) as the single accent/action color, and a warm
  paper background (`#f6f1e8`) instead of stark white — deliberately not
  blue/purple/pink, which the design brief calls out as the generic
  AI-generated default.
- **Typography**: Fraunces (serif, display) for headings, Inter for body
  text, IBM Plex Mono for glucose values specifically — numbers in a
  monospace face read as more "clinical/precise," which fits a health
  tracker and creates a visual distinction between a reading's value and
  surrounding text.
- **Layout**: a sidebar app shell (collapses to a top bar under 860px)
  instead of a plain top navbar; a split-screen login/register (brand copy
  left, form right) instead of a centered card; a bento grid for the three
  report cards instead of three identical stacked cards.
- **Domain-driven color use**: reading values are shown as colored chips
  based on a simple glucose band (`src/constants.js` → `glucoseStatus`:
  <70 low, 70–139 normal, 140–199 elevated, ≥200 high) using the
  success/warning/danger tokens. This is a coarse, **display-only**
  heuristic to make the reading list scannable — it is not medical
  guidance and doesn't distinguish fasting vs. post-meal targets the way a
  clinician's reference range would.
- **Icons**: `lucide-react`, one icon per time slot (sunrise/coffee/utensils/
  moon) used consistently in the form, the reading list, and the daily
  report — reinforces which slot is which without relying on color alone.
- Added `lucide-react` as the only new dependency; no new UI framework.
- **Not verified visually.** No browser/screenshot tool was available in
  this session, so this was checked by: `npm run build` succeeding, a
  classname audit (every `className` used in JSX, including template
  literals, cross-checked against `styles.css`) to catch typos/dead
  classes, and confirming the Vite dev server serves the page and entry
  module without errors. **Please open the app in a browser and look at it
  before considering the redesign done** — spacing/alignment issues that
  only show up visually wouldn't be caught by any of the above.

## Slot-picker hover bug — two attempts

The user reported the "Morning" pill showing a grey hover background while
hovering "Lunch." First attempted fix: guessed it was "sticky hover" from a
touch/trackpad pointer (no `mouseleave` event on touch) and gated every
`:hover` rule behind `@media (hover: hover) and (pointer: fine)`. **This
didn't fix it** — the user confirmed a real mouse (ruled out via hard
refresh and an Incognito window, which also ruled out a browser extension),
so a media feature query gated on "is this a real mouse" was never going
to change anything for someone using a real mouse. Wrong diagnosis, wasted
a round trip.

The actual, mundane cause: `.slot-option` (class-only, specificity 0,1,0)
and the global `button:hover` (element+pseudo-class, specificity 0,1,1)
were competing, and `button:hover`'s specificity was higher, so **any**
unselected pill's hover state fell through to the generic clay-colored
button hover — not "Morning specifically," but whichever pill wasn't
exactly matched by a more specific selector at that moment, which looked
inconsistent/random across screenshots. Fixed properly by renaming every
slot-picker rule to `button.slot-option` (element+class, 0,1,1) and
`button.slot-option.selected`/`:hover` variants (0,2,1 / 0,2,2) — each
state now has unambiguous, non-competing specificity against the base
`button` rule and against each other, with no media-query gating involved.
Also kept a small checkmark badge on the selected pill as a non-color
signal, so "selected" can't be visually confused with "hovered" regardless.

Lesson: should have re-read the actual cascade/specificity math the second
time around before reaching for a device/input-type theory the data (real
mouse, no extensions) already contradicted.

## Known rough edges

- Sequelize logs a Node deprecation warning for the `sqlite::memory:` URL
  format during tests (`DEP0170`). Harmless, doesn't fail anything, not
  worth chasing down for a test-only code path.
- The frontend bundle is ~630 KB (Vite warns above 500 KB), mostly from
  Recharts. Not worth code-splitting for a small internal tool, but flagged
  in case it matters for grading.
- Login/session has no "remember me" or auto-refresh — token is simply
  valid for `JWT_EXPIRES_IN` (7 days default) and the user is logged out
  (redirected to /login) once a request 401s. No silent refresh.
