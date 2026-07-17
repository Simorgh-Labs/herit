# Staff App Flows 1 & 2a Implementation — Task List for GitHub Issues

Implementation tasks for the Herit Staff app's flow 1 (Auth & App Shell) and flow 2a (RFP Management). Each task is intended to become one GitHub issue. **The staff app does not exist yet** — `frontend/` contains only `portal`; task 1 creates it.

Shared context for all tasks:

- Spec: sections 1 and 2a of `docs/frontend/staff/user-flows-high-level.md` (verified against the backend; authoritative).
- Designs: `docs/frontend/staff/designs/flow1/` and `designs/flow2a/` — **Design Component (`.dc.html`) format**: open the file in a browser to view (bundled `support.js` renders it); read the source directly for markup. `<sc-if>` blocks are conditional states (map them to React conditionals), `<x-import>` references design-system components in `_ds/`, the top bar with screen/state tabs is reviewer chrome (not product UI), and DECISION/annotation banners are design notes, not UI. Implement **every** screen and state behind the switchers: flow1 = sign-in, access-denied, dashboard×(staff, admin); flow2a = list, editor×(create, edit), detail×(Draft, Approved, Published), delete modal.
- Decisions already made (encode, don't re-decide): dark slate shell + "Staff" wordmark on every screen; dashboard is a thin launcher (client-side counts + links, no embedded previews, no invented metrics); **Publish uses a confirm-with-summary modal** (it's the one transition with public effect) while **Approve uses a lightweight bare confirm**; ADR-017 — any staff user performs every RFP transition, no separate-approver language anywhere.
- Stack (ADR-016): Vite + React + React Router v6 + TanStack Query + Tailwind + shadcn/ui + MSAL React + Axios + Vitest — mirror the portal's structure (`frontend/portal/src/` layout: `api/`, `auth/`, `components/`, `pages/`, `routes/`) unless there's a reason to diverge. English-only, inline strings (ADR-019, revised — no i18n framework).
- The `_ds` token package (`designs/flow1/_ds/.../tokens/`) is the palette source — translate its custom properties into the staff app's Tailwind config once, at scaffold time; don't hand-copy hex values per component.
- Backend facts: roles resolved from the DB via `GET /api/v1/Users/me`; RFP model is `id`, `title`, `shortDescription`, `authorId` (single), `organisationId`, `longDescription`, `status` (`Draft → Approved → Published`, sequential, terminal at Published, enforced server-side), `tags?`. Endpoints: `GET/POST /api/v1/Rfps`, `GET/PUT/DELETE /{id}`, `PATCH /{id}/status`. Staff see all statuses on the list endpoint; non-staff get Published only (server-enforced).
- No organisation scoping exists — do not build UI that implies it (spec has the details and required footnotes).

---

## 1. Scaffold the Herit Staff app with authentication and the role gate (flow 1, screens 01–02)

Create `frontend/staff/` per the shared stack and implement sign-in and the access gate per `designs/flow1/` (screens 01 and 02) and spec section 1.

Scaffold: Vite app, Tailwind config seeded from the `_ds` tokens, MSAL against the same Entra tenant as the portal (reuse the portal's `msalConfig`/`authScopes` patterns), Axios client attaching the Bearer token, React Router shell, CI wiring (build + unit tests alongside the portal's jobs). Auth flow: sign-in page (dark, "Staff" wordmark, "Continue with Google", provisioning note, portal link, **no self-registration affordance**) → on authentication call `GET /Users/me` → role `Staff`/`OrganisationAdmin`/`SuperAdmin` proceeds; anything else (including no user record) renders the access-denied screen (screen 02: explanation, portal link, sign-out, no retry loop). Note: for the no-record case the API will error rather than JIT-register (JIT is expat-only, ADR-015) — handle that error as access-denied, not as a failure state. Include the E2E hooks from the start: the API's TestAuth scheme and the portal's fake-MSAL `e2e` Vite mode pattern already exist — mirror them so staff E2E tests are possible from day one.

## 2. Implement the app shell and dashboard (flow 1, screen 03)

Implement the persistent shell and dashboard per `designs/flow1/` screen 03 (both role states) and spec section 1.

Shell: dark header with logo + "Staff" tag, nav (Dashboard, RFPs, Proposals — plus Organisations and Users **rendered only for admin roles**, absent not disabled), user identity + role label + sign-out. Dashboard (thin launcher per the decided behaviour): RFP counts by status and proposals-awaiting-review counts computed client-side from the list endpoints, each card linking into the corresponding queue route (routes may be stubs until flows 2a/2b land); admin roles additionally see organisation/user counts with the platform-wide footnote from the mockup. No trends, charts, or time-windowed figures — the mockup's honesty notes about counts are design annotations to respect, not UI to copy.

## 3. Implement the RFP list (flow 2a, screen 01)

Implement the RFP list per `designs/flow2a/` screen 01 and spec section 2a, at the shell's RFPs route.

All RFPs from `GET /api/v1/Rfps` with client-side status tabs (Draft/Approved/Published) and search; status badges follow the portal's `StatusBadge` class conventions (new RFP badge set); rows link to the detail; "Create RFP" action into the editor; empty state. No reference IDs, no author-plural display.

## 4. Implement the RFP editor (flow 2a, screen 02)

Implement create and edit states per `designs/flow2a/` screen 02 and spec section 2a.

Fields: title, short description, long description (rich-text consistent with portal editors), organisation selector fed by `GET /api/v1/Organisation`, tags. Create → `POST /api/v1/Rfps` (lands in `Draft`) → redirect to detail with in-app confirmation; Edit → `PUT /api/v1/Rfps/{id}` from any status — the Published-edit state must carry the mockup's note that changes go live immediately with no re-approval. Client-side validation of required fields per the backend validator.

## 5. Implement the RFP detail with lifecycle actions and modals (flow 2a, screens 03–04)

Implement the staff detail view in its three status states plus the transition/delete modals per `designs/flow2a/` screens 03–04 and spec section 2a.

States and actions (ADR-017 — available to every staff user): **Draft** → Edit / Approve / Delete; **Approved** → Edit / Publish / Delete; **Published** → Edit / Delete + "live on the portal" indicator linking to the public RFP page. Approve = lightweight bare confirm; **Publish = confirm-with-summary modal** (shows what expats will see) per the decided behaviour; both call `PATCH /api/v1/Rfps/{id}/status`. Delete = destructive confirmation per the shared pattern, with the published-RFP copy from the mockup ("removes it from the portal immediately; proposals that already reference this RFP keep their reference") → `DELETE /api/v1/Rfps/{id}` → return to list with confirmation. Surface backend 403/validation errors rather than generic failures.
