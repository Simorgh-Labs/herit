# Herit Staff — High-Level User Flows

## Overview
- This document defines the high-level flows for **Herit Staff**, the second frontend application, used by government staff, organisation admins, and the super admin. It is the staff-side counterpart of `docs/frontend/portal/user-flows-high-level.md`.
- Every field, status, endpoint, and actor rule below has been **verified against the backend** (entities, controllers, `VisibilityPolicy`, `MutationPolicy`) — the backend is the source of truth. Where the PRD and backend disagree, the backend's model is used and the divergence is noted.
- Governing decisions: ADR-013/014/015 (Entra identity, DB-resolved roles), ADR-016 (frontend stack), ADR-017 (any staff may drive the full RFP lifecycle), ADR-018 (no pre-moderation; staff deletion is the safety valve), ADR-019 (English-only, no i18n investment — same string conventions as the portal).

## Roles and access
- Roles (resolved from the application database per ADR-014): `SuperAdmin`, `OrganisationAdmin`, `Staff`, `Expat`. The staff app serves the first three; expat users have no reason to access it.
- **Known gap — no organisation scoping.** The PRD (§3.2–3.3, A1–A3) describes admins and staff acting "within their organisation," but the backend enforces role only: any `OrganisationAdmin` can CRUD any organisation and any user; any `Staff` user can act on any RFP/proposal/EOI platform-wide. The staff app MUST be designed to this actual behaviour (no fake org boundaries in the UI), and this gap is the top candidate backend enhancement once the staff app's needs make the right scoping model concrete.
- Staff/admin users are **provisioned, not self-registered** (created via `POST /api/v1/Users/staff` and `/organisation-admins`; the super admin via the CLI seeder). There is no JIT registration in the staff app — JIT provisioning (ADR-015) applies to expats only.

### Diagram set (overview)
1. Authentication & app shell (sign-in, role gate, unprovisioned-user handling)
2. Staff flows:
   a. Manage RFPs (create → draft → approve → publish; edit; delete)
   b. Review Proposals (queue → detail → Under Review → Approved; takedown)
   c. Manage EOIs (view, approve/reject, delete)
3. Admin flows:
   a. Manage Organisation hierarchy (CRUD)
   b. Manage Organisation Admins (create/delete)
   c. Manage Staff Users (create/update/delete)
4. Super admin bootstrap (CLI seed → root organisation → delegate)

### 1) Authentication & app shell
- Start: Sign in (same Entra External ID tenant and MSAL setup as the portal; see the note in the portal flows doc §2)
- Node 1: Entra sign-in (success/failure) → Failure: error/retry (end)
- Decision: Does a `User` record exist with role `SuperAdmin` / `OrganisationAdmin` / `Staff`?
  - If No (no record, or role is `Expat`) → **Access denied screen**: "This application is for Herit staff. Contact your administrator." with a link to the public portal. Do NOT JIT-register; do not offer self-signup.
  - If Yes → Node 2: Staff dashboard (role-appropriate: staff see RFP/proposal/EOI work queues; admins additionally see organisation/user management; navigation renders only the sections the role can act on)
- End: Authenticated staff session
- Note: `GET /api/v1/Users/me` returns the current user (with role) for the role gate; roles are database facts, so a role change takes effect on next request without re-login.

### 2a) Manage RFPs (staff)
- Backend model (complete): `id`, `title`, `shortDescription`, `authorId`, `organisationId`, `longDescription`, `status` (`Draft` → `Approved` → `Published`, strictly sequential, `Published` terminal), `tags` (optional string). **Note: single author** — the PRD's "Authors" (plural) does not match the backend; design for one author.
- Start: RFP list — staff see all RFPs in all statuses (`GET /api/v1/Rfps` returns everything to staff callers; `VisibilityPolicy.CanViewRfp` hides non-Published from non-staff). Status filter tabs (Draft / Approved / Published) are client-side.
- Node: RFP editor (create via `POST /api/v1/Rfps` → created in `Draft`; edit via `PUT /api/v1/Rfps/{id}`; fields: title, short description, long description, associated organisation, tags)
- Actions per status (per ADR-017, **any staff user may perform every transition, including on their own RFPs** — do not design "submit for approval" language or a separate-approver UI):
  - **Draft**: Edit, Approve (`PATCH /api/v1/Rfps/{id}/status` → `Approved`), Delete (`DELETE /api/v1/Rfps/{id}`)
  - **Approved**: Edit, Publish (`PATCH .../status` → `Published`), Delete
  - **Published**: terminal status — visible to all users on the portal; Edit and Delete remain available (verify desired copy: editing a published RFP takes effect immediately with no re-approval step, because the backend imposes none)
- Deletion requires a confirmation modal (destructive-modal pattern shared with the portal)
- End: RFP in target state; placeholder: Future email notification to subscribed expats on publish (no current infrastructure)

### 2b) Review Proposals (staff)
- Start: Proposal review queue — staff see all proposals regardless of visibility (`VisibilityPolicy` grants staff full read). Primary queue view filters to `Submitted` and `UnderReview`; a secondary all-proposals view covers the rest. Status filtering is client-side until list filter params are extended.
- Node: Proposal detail (read-only content; staff do not edit proposal content — no backend path exists for it)
- Actions (per `MutationPolicy.CanTransitionProposalStatus`: staff drive `Submitted → UnderReview → Approved`; staff CANNOT withdraw a proposal, and owners cannot perform staff transitions):
  - **Submitted**: Start Review → `PATCH /api/v1/Proposals/{id}/status` with `UnderReview`
  - **UnderReview**: Approve → `PATCH .../status` with `Approved`; placeholder: Future email to proposal owner
  - Note: there is **no Reject transition** for proposals in the backend. The lifecycle has no rejected state; the only staff-side negative outcome is deletion (below). If review-rejection is wanted, that is a backend enhancement — do not fake it in the UI.
  - **Any status**: Delete (takedown per ADR-018 / PRD S7) → confirmation modal → `DELETE /api/v1/Proposals/{id}`. This is the moderation safety valve; make it discoverable but clearly destructive.
    - Verified (EF migrations): deleting a proposal **cascades** — its CFEOIs and their EOIs are deleted with it. Takedown copy must state this.
- **Approved**: terminal for staff purposes (conversion to a project is out of scope per PRD §9)
- End: proposal transitioned or removed

### 2c) Manage EOIs (staff)
- Start: EOIs are reached through their parent context (proposal → CFEOI → EOIs); staff see all EOIs including `Private` ones (`VisibilityPolicy.CanViewEoi` grants staff full read; `GET /api/v1/Eoi?cfeoiId=`)
- Actions:
  - **Approve / Reject** (`PATCH /api/v1/Eoi/{id}/status`, `Pending` → `Approved`/`Rejected`, terminal) — staff share this capability with the proposal owner
  - **Delete** (`DELETE /api/v1/Eoi/{id}`, staff-only per PRD S9) → confirmation modal
- Note: staff may also publish/update/close CFEOIs under any proposal (`MutationPolicy.CanMutateCfeoi` permits staff, per PRD S8). Reuse the portal's CFEOI form/close designs if this surface is included; it is secondary and may be deferred within the staff app.
- End: EOIs processed

### 3a) Manage Organisation hierarchy (admin)
- Backend model: `Organisation` — `id`, `name`, `parentId` (null for the single root). Tree structure per PRD §4.
- Start: Organisation tree view (`GET /api/v1/Organisation` is public — the same data renders portal org names)
- Actions (all `AdminOrSuperAdmin`; **not scoped to the admin's own subtree** — see the known gap above):
  - Create sub-organisation → `POST /api/v1/Organisation` (name, parentId)
  - Rename/update → `PUT /api/v1/Organisation/{id}`
  - Delete → `DELETE /api/v1/Organisation/{id}` → confirmation modal; surface the backend's behaviour for organisations with children or attached RFPs/proposals/users (verify: likely a conflict error — the UI should explain, not swallow it)
- End: hierarchy updated

### 3b/3c) Manage Organisation Admins and Staff Users (admin)
- Start: User management list — `GET /api/v1/Users` (AdminOrSuperAdmin) with detail at `GET /api/v1/Users/{id}`
- Actions (all `AdminOrSuperAdmin`):
  - Create staff user → `POST /api/v1/Users/staff` (provisioning: the created record's email must match the identity the person will sign in with through Entra)
  - Update staff user → `PUT /api/v1/Users/staff/{id}`
  - Delete staff user → `DELETE /api/v1/Users/staff/{id}` → confirmation modal
  - Create organisation admin → `POST /api/v1/Users/organisation-admins`; Delete → `DELETE /api/v1/Users/organisation-admins/{id}`
  - Note: there is no "update organisation admin" endpoint — create/delete only; design accordingly
- End: user roster updated

### 4) Super admin bootstrap
- Out-of-app precondition: super admin seeded via CLI (`dotnet run --project Herit.Api -- --seed-super-admin --email <email> --display-name <name>`), documented in ops material — the staff app does not need a bootstrap wizard.
- In-app: the super admin signs in, creates the root organisation (first `POST /api/v1/Organisation` with null parent), then creates organisation admins and delegates. This is the same UI as 3a/3b — no dedicated screens needed beyond a sensible empty state ("No organisations yet — create the root organisation").

### Cross-cutting rules & notes
- **i18n (ADR-019, revised):** English-only with inline strings, same conventions as the portal. No externalization framework; a future second language would be handled by a retrofit pass across both apps.
- **Notifications:** placeholders only, labelled "Future:", at publish/approve/reject touchpoints — same convention as the portal flows.
- **Destructive actions** (delete RFP/proposal/EOI/organisation/user): confirmation modal using the shared destructive-modal pattern (checkbox-gated where consequences are severe, e.g. proposal takedown).
- **Client-side filtering:** list endpoints currently expose limited filter params; status tabs and search on staff queues are client-side. If staff data volumes make this untenable, extending the server-side filter params (the pattern exists from the portal filtering work) is the fix — do not add fake pagination.
- **No org scoping (repeat, because it will surprise reviewers):** all admin and staff capabilities are platform-wide today. UI copy must not claim organisation boundaries that the backend does not enforce.
- **Errors:** the API returns 403 via `ForbiddenException` for authenticated-but-forbidden actions and structured problem details elsewhere; surface these rather than generic failures.

### Acceptance criteria
- RFP flows use exactly the statuses `Draft` / `Approved` / `Published` with strictly sequential transitions; no reject/return-to-draft paths appear; any staff user can perform every transition (ADR-017); RFPs display a single author.
- Proposal review offers exactly two staff transitions (`Submitted → UnderReview`, `UnderReview → Approved`) plus delete; no reject/withdraw actions appear on staff surfaces; staff never edit proposal content.
- EOI staff surfaces use only `Pending` / `Approved` / `Rejected` plus staff delete; staff see `Private` EOIs.
- No screen implies organisation-scoped permissions; the known gap is footnoted where relevant instead.
- Org admin management is create/delete only (no update); staff user management is full CRUD.
- The app has an explicit access-denied state for signed-in users without a staff role, and no self-registration path.
- Every field shown maps to a real backend field (`Rfp`, `Proposal`, `Cfeoi`, `Eoi`, `Organisation`, `User` entities); nothing is invented.

### Recommended next steps
1. Review this document, then produce design briefs per flow (the flow3e brief format — authoritative spec section, hard data-model card, deliverable list with states, visual-system constraints, out-of-scope blacklist, open questions with recommendations).
2. Suggested design/build order: 1 (auth & shell) → 2a (RFPs) → 2b (proposal review — completes the platform loop) → 3a–3c (admin) → 2c (EOI surfaces, reusing portal patterns).
3. Before designing 3a, verify the backend's behaviour when deleting an organisation with children/attached records (marked "verify" above). Note: `PATCH /api/v1/Users/{id}/profile` no longer exists — it was an unauthorized, unused duplicate of `/me/profile` and was removed; staff/admin user edits go through `PUT /api/v1/Users/staff/{id}` (staff) with no equivalent for organisation admins (create/delete only).
