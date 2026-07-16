# Portal E2E testing (Playwright)

The Playwright suite in `frontend/portal/e2e/` exercises the full expat-portal journey
against the real stack — API, SQL Server, and the Vite-served SPA — covering the seams
between flows 1, 2, and 3a–3e that unit tests cannot reach.

## What is covered

| Spec | Scenario |
|---|---|
| `full-loop.spec.ts` | The core journey: first-time sign-in (JIT registration) → create proposal → Resourcing → publish CFEOI → contributor B submits & shares an EOI → owner approves it → CFEOI closed → proposal submitted → withdrawn (terminal). |
| `visibility-matrix.spec.ts` | Server-side visibility rules for Private/Shared/Public proposals across anonymous / non-owner / owner callers, CFEOI directory inheritance, and Private→Shared EOI inbox behaviour. Asserts on both UI state and API responses. |
| `seams.spec.ts` | Already-submitted CTA swap (and its return after withdrawal), Closed-CFEOI behaviour for contributor vs owner, per-status Withdraw/Delete labels with the checkbox-gated modal, and auth/ownership guards. |
| `unauthenticated.spec.ts` | Flow 1: RFP and public proposal/CFEOI browsing with no session, no leakage of unpublished RFPs, Express Interest prompting sign-in. |

## Authentication strategy

Production auth (MSAL/Entra External ID with Google federation) cannot be driven
headlessly in CI, so E2E runs swap **both ends of the token exchange** for a test-only
equivalent while leaving everything in between — axios interceptor, JIT registration,
role resolution, visibility policies — untouched:

- **API** (`src/Herit.Api/Authentication/TestAuthentication.cs`): when
  `TestAuth:Enabled` is set **and the environment is not Production**, an additional
  JWT bearer scheme accepts HS256 tokens signed with the checked-in key from
  `appsettings.E2E.json`. A policy scheme routes tokens by issuer, so the regular
  Entra scheme stays registered and untouched. The same flag swaps
  `EntraExternalIdIdentityProviderService` (Microsoft Graph) for a deterministic
  local fake, so the super-admin seeder and staff-creation endpoints work offline
  (`externalId = "e2e-" + email`).
- **SPA** (`src/auth/testAuth.ts`): the `e2e` Vite mode (`.env.e2e`,
  `VITE_E2E_AUTH=true`) replaces `PublicClientApplication` with a fake that reads a
  pre-minted token from localStorage (`herit.e2e.auth`, written via Playwright
  `storageState`). `loginRedirect()` consumes a staged identity
  (`herit.e2e.pendingAuth`) and reloads, simulating the redirect round-trip so tests
  can drive the sign-in UI itself.
- **Tokens** are minted in-process by the test harness (`e2e/support/tokens.ts`,
  using `jose`) — no test-token endpoint is added to the API.

**Not reachable in production:** `TestAuthentication.IsEnabled` hard-fails in the
Production environment regardless of configuration, no shipped config sets the flag,
and production SPA builds statically eliminate the stub (verified: `herit.e2e` does
not appear in the default-mode bundle). The signing key only ever guards throwaway
E2E identities in a disposable database.

Three browser identities run per suite: an anonymous context, expat **user A**
(owner; plus a never-registered **A1** for the JIT scenario), and expat **user B**
(contributor). The **super admin** is API-only — it seeds via the CLI and bootstraps
data through request contexts, never a browser session.

## Test data lifecycle

`e2e/global.setup.ts` builds the baseline through the same paths production uses
(never direct DB writes), in dependency order:

1. Super admin via the existing CLI seeder (`dotnet run --project src/Herit.Api --
   --seed-super-admin …`) — idempotent.
2. Organisation hierarchy (root ministry + child agency) via `OrganisationController`
   as the super admin.
3. A staff user (Graph replaced by the local fake) and a **Published** RFP.
4. Expat users A and B, JIT-registered via `GET /api/v1/Users/me` with their test
   tokens, then terms-accepted via `PATCH /api/v1/Users/me/profile`.

Every record's title carries a per-run `runId`, so runs never depend on data left by
previous runs. `e2e/global.teardown.ts` deletes what the API allows (EOIs via
withdraw, deletable proposals, the RFP, staff user, organisations) and logs what it
leaves behind (CFEOIs and withdrawn proposals have no delete path by design).

## Running locally

1. Start a disposable SQL Server (once):

   ```bash
   docker run -d --name herit-e2e-sql -e ACCEPT_EULA=Y \
     -e MSSQL_SA_PASSWORD='HeritE2e!Passw0rd' -p 14330:1433 \
     --platform linux/amd64 mcr.microsoft.com/mssql/server:2022-latest
   ```

2. Run the suite from `frontend/portal`:

   ```bash
   npm run e2e        # or: npm run e2e:ui
   ```

Playwright starts both servers itself (API on :5299 with
`ASPNETCORE_ENVIRONMENT=E2E`, Vite on :5199 in `e2e` mode) and reuses them if
already running. Migrations apply automatically on API startup. To reset the local
E2E data entirely, drop the database:

```bash
docker exec herit-e2e-sql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa \
  -P 'HeritE2e!Passw0rd' -C -Q "DROP DATABASE IF EXISTS HeritE2E"
```

## CI

The `e2e` job in `.github/workflows/azure-dev.yml` runs the suite against a SQL
Server service container (mapped to the same port 14330 the E2E config expects) and
uploads the Playwright report and traces on failure. The `cd` deploy job requires
both `ci` and `e2e` to pass.

## Conventions

- Selectors prefer roles, labels, and visible text; no `data-testid`s were needed.
- Specs run serially (one worker) because they share a database.
- Fixture titles embed the runId plus the Playwright `workerIndex`, so a worker
  restart after a failure re-seeds under fresh names instead of colliding.
- Assert server-enforced behaviour (visibility, status filtering) on **both** the UI
  and the API response — the API side is what #267 hardened.
