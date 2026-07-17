# GitHub Issue — Portal E2E Suite

**Title:** Add a Playwright E2E suite covering the full expat portal journey and the visibility matrix

---

## Description

All portal flows (1, 2, 3a–3e) are implemented and each was verified in isolation, but nothing exercises the seams between them end to end. With the staff app about to start churning the shared backend, we need a regression net. Add a Playwright suite for `frontend/portal` (there is currently no E2E tooling — backend has unit-test projects only).

### First, a design decision — authentication strategy

The app authenticates via MSAL/Entra with Google federation, which cannot be driven interactively in CI. Decide and document an approach before writing tests, e.g.: a test-only auth scheme in the API + a mock MSAL layer in dev builds, pre-acquired tokens injected via Playwright `storageState`, or Entra test users with a non-interactive flow. Whatever you choose must support **three browser identities per run** — an anonymous session, expat user A (proposal owner), and expat user B (contributor) — plus a **super-admin identity used in setup** (see seeding below; it only needs API access, not a browser session, which may simplify the choice). Propose the approach in the PR description before building it out. The chosen mechanism must not be reachable in production builds.

### Test data and pre-flight seeding

Each run must start from a known state, built in Playwright global setup (or a dedicated seed script) and cleaned up after — don't depend on data left by previous runs. Note the seeding has a required order, because proposals cannot be created without an associated organisation, and organisation CRUD is admin-gated:

1. **Super admin** — seed via the existing CLI path: `dotnet run --project Herit.Api -- --seed-super-admin --email <email> --display-name <name>` (`SuperAdminSeeder`). This is the only actor that can bootstrap the hierarchy.
2. **Organisation hierarchy** — as the super admin, create a root organisation and at least one child organisation via the `OrganisationController` endpoints, so proposal creation has a real organisation to associate and the hierarchy path (e.g. "Ministry of Health") renders on browse surfaces.
3. **Expat users A and B** — registered through the JIT flow where the scenario covers it (scenario 1 exercises JIT for user A deliberately); otherwise pre-created via `POST /api/v1/Users` in setup.

Don't hand-insert rows into the database; go through the CLI seeder and the API so that seeding itself exercises the same paths production uses (the admin endpoints are otherwise untested until the staff app exists).

### Scenarios to cover

1. **Full loop (the core journey):** user A signs in (first-time → JIT registration form → dashboard) → creates a standalone proposal (lands in `Ideation`) → moves it to `Resourcing` → publishes a CFEOI (immediately `Open`) → user B browses the CFEOI directory, opens the detail, expresses interest, submits an EOI (created `Pending`, `Private`) → B sets it to `Shared` from My EOIs → A opens the EOI inbox, sees B's EOI, approves it → A closes the CFEOI → A submits the proposal (`Submitted`) → A withdraws it (terminal, read-only).

2. **Visibility matrix (the recently hardened server-side rules):** for `Private`/`Shared`/`Public` proposals — anonymous sees only Public; authenticated non-owner sees Public + Shared; owner sees all three. CFEOIs follow the parent proposal's visibility in the directory. A `Private` EOI does **not** appear in owner A's inbox; the same EOI appears after B flips it to `Shared`. Assert on both UI state and (where cheap) network responses, since the point is that filtering is server-side.

3. **Seams and terminal states:** the already-submitted state replaces Express Interest for B after submission (and after withdraw-then-revisit, the CTA returns); a `Closed` CFEOI shows no Express Interest and remains accessible to A's inbox; withdraw/delete labels on My EOIs per status (`Withdraw` on Pending/Approved, `Delete` on Rejected) with the checkbox-gated confirmation modal; guards — an unauthenticated hit on an owner route redirects to sign-in, and a non-owner cannot reach the EOI inbox.

4. **Unauthenticated browsing (flow 1):** RFP list/detail and public proposal/CFEOI browsing work with no session; Express Interest prompts sign-in.

### CI and conventions

Wire the suite into CI as a separate job (it needs API + DB + frontend running; follow whatever the repo's existing CI does for integration-style setup). Prefer role/label-based selectors over test-ids where the markup allows; where not, add `data-testid` sparingly.

### Out of scope

Staff-app flows, load/perf testing, visual-regression snapshots.
