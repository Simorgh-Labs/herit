# Staff E2E testing (Playwright)

The Playwright suite in `frontend/staff/e2e/` exercises the staff app against the real
stack — API, SQL Server, and the Vite-served SPA — and, because several behaviours span
both apps, it serves the **expat portal alongside the staff app** so the cross-app
scenarios can drive an expat or anonymous portal session against the same database.

## What is covered

| Spec | Scenario |
|---|---|
| `auth-gate.spec.ts` | Role gate (ADR-015): a provisioned staff member reaches the dashboard; admin-only nav and pages are hidden/blocked from plain staff; an org admin sees them; an expat and an unprovisioned identity are both turned away at the access gate. |
| `rfp-lifecycle.spec.ts` | RFP create → Draft → Approve (bare confirm) → Publish (confirm-with-summary) driven in the staff UI, then asserted on the portal: the published RFP appears, an edit-after-publish reaches the portal without re-approval, and a delete removes it. |
| `proposal-review.spec.ts` | Submitted → Under Review → Approved through the staff UI, the expat's portal "My Proposals" reflecting Approved, and no reject affordance anywhere in the flow. |
| `takedown-cascade.spec.ts` | Deleting a proposal cascades to its CFEOI and EOI — the contributor's portal "My EOIs" no longer lists it, and the API confirms both are gone. |
| `eoi-management.spec.ts` | Staff approve/reject Pending EOIs, see `Private` submissions with the email column, and delete an EOI through the checkbox-gated modal. |
| `administration.spec.ts` | Organisation-tree CRUD (incl. the bootstrap empty state and the 409 refusal on deleting a non-empty organisation), and user management with the client-side delete guards plus their server backstops (self-delete 403, last-org-admin 409). |
| `visibility-integrity.spec.ts` | A `Private` proposal is visible in the staff "All proposals" tab by design while staying invisible to an anonymous portal session — one assertion pair proving the staff bypass and public filtering coexist. |

## Authentication strategy

The staff app reuses the portal's test-auth approach: the `e2e` Vite mode
(`.env.e2e`, `VITE_E2E_AUTH=true`) swaps `PublicClientApplication` for the fake in
`src/auth/testAuth.ts`, which reads a pre-minted API token from localStorage
(`herit.e2e.auth`, written via Playwright `storageState`). The two SPAs share the same
localStorage token contract, so the one token-minting harness (`e2e/support/tokens.ts`,
using `jose`) signs an identity into either origin — storage-state files are
origin-scoped (`staff` → :5198, `portal` → :5199). On the API side, the checked-in
HS256 key from `appsettings.E2E.json` is accepted only outside Production
(`TestAuthentication.IsEnabled`), and the Graph-backed identity provider is replaced by
a deterministic local fake so the seeder and staff-creation endpoints work offline
(`externalId = "e2e-" + email`). See `docs/frontend/portal/e2e-testing.md` for the full
rationale.

## Test data lifecycle

`e2e/global.setup.ts` builds the baseline through the same paths production uses (never
direct DB writes):

1. Super admin via the CLI seeder (`--seed-super-admin`) — idempotent.
2. Organisation hierarchy (root ministry + child agency) as the super admin.
3. An **org admin** and a plain **staff** user (Graph replaced by the local fake).
4. Expat users (owner + contributors), JIT-registered via `GET /Users/me` and
   terms-accepted, so they can drive the portal in the cross-app steps. A further
   identity is minted but deliberately **not** provisioned — it hits the 404 access gate.

Every record's title carries a per-run `runId`, so runs never depend on data left by
previous runs. `e2e/global.teardown.ts` deletes what the API allows and logs what it
leaves behind (records with no delete path, and the last-remaining org admin, are left
in place — a fresh `runId` keeps future runs unaffected).

## Ports

| Service | Port | Env |
|---|---|---|
| API | 5299 | `ASPNETCORE_ENVIRONMENT=E2E` |
| Staff app (under test) | 5198 | Vite `e2e` mode |
| Portal (cross-app) | 5199 | Vite `e2e` mode |

Because the two SPAs run on different ports, specs navigate with an absolute URL via
`session.url(path)`.

## Running locally

1. Start a disposable SQL Server (once):

   ```bash
   docker run -d --name herit-e2e-sql -e ACCEPT_EULA=Y \
     -e MSSQL_SA_PASSWORD='HeritE2e!Passw0rd' -p 14330:1433 \
     --platform linux/amd64 mcr.microsoft.com/mssql/server:2022-latest
   ```

2. Install both frontends' dependencies (the staff suite serves the portal too):

   ```bash
   (cd frontend/portal && npm ci)
   (cd frontend/staff && npm ci)
   ```

3. Run the suite from `frontend/staff`:

   ```bash
   npm run e2e        # or: npm run e2e:ui
   ```

Playwright starts the API (:5299, `E2E` environment), the staff app (:5198) and the
portal (:5199) itself, reusing them if already running. To reset local E2E data, drop
the database:

```bash
docker exec herit-e2e-sql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa \
  -P 'HeritE2e!Passw0rd' -C -Q "DROP DATABASE IF EXISTS HeritE2E"
```

## CI

The `e2e-staff` job in `.github/workflows/azure-dev.yml` runs the suite against a SQL
Server service container (same port 14330 the config expects), installing both frontends'
dependencies and uploading the Playwright report and traces on failure. The `cd` deploy
job requires `ci`, `e2e`, and `e2e-staff` to pass.

## Conventions

- Selectors prefer roles, labels, and visible text; no `data-testid`s were needed.
- Specs run serially (one worker) because they share a database.
- Fixture titles embed the `runId` plus the Playwright `workerIndex`, so a worker
  restart after a failure re-seeds under fresh names instead of colliding.
- Assert server-enforced behaviour (visibility, role gating, delete guards) on **both**
  the UI and the API where it matters.
