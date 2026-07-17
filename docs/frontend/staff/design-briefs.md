# Design Briefs — Herit Staff App

Briefs for all Herit Staff flows, in the format that produced the flow3e designs.

**Output format (decided after the Brief 1 delivery): the Design Component (`.dc.html`) format**, exported as a self-contained folder into `docs/frontend/staff/designs/<flow>/`. Requirements on every export:
- Readable annotated source (state switcher + inline DECISION banners), never a compiled/minified bundle — the flow1 export is the reference standard.
- All colors/typography/spacing come from the shared `_ds` design-system token package (`--brand-500: #1D4ED8` etc.); no per-file palette declarations. The `_ds` package shipped with flow1 is canonical — reuse it, don't fork tokens.
- The folder must render by opening the `.dc.html` in a browser (bundle `support.js` and `_ds` with it).

Note: this intentionally diverges from the portal's plain-HTML mockup convention — the staff app's screens are state-heavy (role × status matrices), and the switcher-plus-shared-tokens format eliminates both the duplicated-render and token-drift failure modes seen in the portal design cycles. Portal designs remain plain HTML.

## Shared context (applies to every brief)

- **Authoritative spec:** `docs/frontend/staff/user-flows-high-level.md` — verified against the backend. **Do not add any field, status, action, or feature beyond it.** Where a mockup and the spec disagree, the spec wins.
- **Roles:** `SuperAdmin`, `OrganisationAdmin`, `Staff` (the app rejects `Expat` and unprovisioned users). Roles are database facts, resolved per request.
- **No organisation scoping (known gap):** all staff/admin capabilities are platform-wide. No screen may imply organisation boundaries; where the gap is user-visible (e.g. an admin seeing all organisations), footnote it rather than hiding it.
- **Visual system:** same design system as the portal — copy the tailwind token block and typography (`brand: #1D4ED8`, light `#EFF6FF`, Inter) from a corrected portal mockup (`docs/frontend/portal/designs/flow3e/`), light theme only, no glow shadows, no dark-theme artifacts. Status badge classes must match `frontend/portal/src/components/StatusBadge.tsx` conventions (new badge sets for RFP statuses follow the same class pattern). Destructive confirmations reuse the `flow3b/07` modal pattern (checkbox-gated where consequences are severe).
- **Header/navigation:** reuse the shell delivered in the flow1 export (`designs/flow1/`). Decided there (Brief 1 open questions): the staff app is differentiated by a **dark slate shell + "Staff" wordmark tag** carried on every screen, and the dashboard is a **thin launcher** (client-side counts + links into queues, no embedded previews). Subsequent mockups must use that header verbatim.
- **Language (ADR-019):** English, inline strings, same conventions as the portal.
- **Out of scope — blacklist for all briefs:** notifications (labelled "Future:" placeholders only), human-friendly reference IDs (backend uses GUIDs; show none), attachments/file upload, bulk actions (no bulk APIs), audit logs, analytics dashboards, org-scoped permission UI, project-conversion features for approved proposals (PRD §9), password fields of any kind (identity lives in Entra; the app never handles credentials).
- **Errors:** 403s and validation problems come back as structured problem details — include an error/forbidden state where a screen can hit one.

---

## Brief 1 — Authentication & App Shell (flow 1)

**Spec:** section 1 of the staff flows doc.

Deliverables (`designs/flow1/`):

1. **`01-sign-in.html`** — staff sign-in page. Same Entra sign-in as the portal but visually distinct enough that staff know they're in the right place (see open question 1). No self-registration affordance of any kind.
2. **`02-access-denied.html`** — the state for a signed-in user without a staff role (no record, or `Expat`): plain explanation ("This application is for Herit staff…"), a link to the public portal, a sign-out action. No retry loop.
3. **`03-dashboard-and-shell.html`** — the app shell (header, navigation, user menu with sign-out) plus the dashboard, in two annotated states: **Staff** (work-queue orientation: RFPs by status, proposals awaiting review — counts link into flows 2a/2b) and **OrganisationAdmin/SuperAdmin** (adds organisation and user management sections to the nav and dashboard). Navigation renders only what the role can act on; do not show disabled admin items to staff.

Data available for the dashboard: list endpoints only (`GET /Rfps`, `/Proposals`, `/Organisation`, `/Users`) — counts are computed client-side; there are no aggregate/stats endpoints, so no invented metrics (no trends, charts, or "this week" figures).

Open questions (recommend, don't silently decide):
1. **Visual differentiation from the portal:** same brand but a distinguishing cue (e.g. a "Staff" wordmark suffix, darker header). Recommend one treatment.
2. **Dashboard depth:** a thin launcher (counts + links) vs. embedded queue previews. Recommend one; note the cost of the other.

---

## Brief 2a — RFP Management (flow 2a)

**Spec:** section 2a of the staff flows doc. Governing decision: **ADR-017 — any staff user performs every transition, including on their own RFPs.** No "submit for approval" language, no separate-approver UI.

**Data model (complete):** `id`, `title`, `shortDescription`, `authorId` (**single author**), `organisationId`, `longDescription`, `status` (`Draft → Approved → Published`, strictly sequential, `Published` terminal, no backward transitions), `tags` (optional string). Endpoints: `GET /api/v1/Rfps` (staff see all statuses), `POST`, `PUT /{id}`, `DELETE /{id}`, `PATCH /{id}/status`.

Deliverables (`designs/flow2a/`):

1. **`01-rfp-list.html`** — all RFPs with client-side status tabs (Draft/Approved/Published) and search; status badges; row actions appropriate to status; empty state.
2. **`02-rfp-editor.html`** — create/edit form: title, short description, long description (rich-text toolbar consistent with portal editors), organisation selector (from `GET /Organisation`), tags. Two annotated states: create (new `Draft`) and edit. Note: editing remains possible in every status — including `Published`, where changes take effect immediately with no re-approval; the Published edit state should say so.
3. **`03-rfp-detail-lifecycle.html`** — staff detail view in three annotated status states: **Draft** (Edit / Approve / Delete), **Approved** (Edit / Publish / Delete), **Published** (Edit / Delete + "live on the portal" indicator with a link to the public RFP page). Approve and Publish get lightweight confirmations (not the destructive pattern); Delete gets the destructive modal.
4. **`04-delete-rfp-modal.html`** — destructive confirmation per the `flow3b/07` pattern; copy must cover deleting a `Published` RFP (it disappears from the portal; proposals already referencing it keep their `rfpId` — do not claim they are affected).

Open question: should Publish include a confirm-with-summary step (what expats will see) rather than a bare confirm? Recommend one.

---

## Brief 2b — Proposal Review (flow 2b)

**Spec:** section 2b of the staff flows doc. Governing decisions: ADR-018 (deletion is the moderation safety valve), `MutationPolicy` (staff drive `Submitted → UnderReview → Approved` only).

**Hard constraints:** staff never edit proposal content; there is **no reject transition** for proposals — do not design one (the only negative outcome is deletion); staff see all proposals regardless of visibility; `Approved` is terminal in-app (project conversion is out of scope).

Deliverables (`designs/flow2b/`):

1. **`01-review-queue.html`** — primary queue filtered to `Submitted` + `UnderReview` (client-side tabs), showing title, author, organisation, submitted-state visibility badge; a secondary "all proposals" tab covering every status/visibility (footnote that staff read-access spans all visibilities). Empty states for both.
2. **`02-proposal-review-detail.html`** — read-only proposal detail (content, author, organisation, linked RFP if any, CFEOIs with their EOI counts) in three annotated states: **Submitted** (action: Start Review), **UnderReview** (action: Approve), **Approved** (no actions; terminal notice). Include the Delete (takedown) action in all states, visually separated from the review actions.
3. **`03-takedown-modal.html`** — deletion confirmation, checkbox-gated (severe: permanently removes the proposal and everything under it — verify and state the cascade behaviour for CFEOIs/EOIs in the copy honestly; if the backend errors instead of cascading, the modal copy and error state must reflect that).

Open question: after Approve, should the UI prompt any follow-on (e.g. a "notify owner" future-placeholder note), or end silently? Recommend one consistent with the notification-placeholder convention.

---

## Brief 2c — EOI Management, staff view (flow 2c)

**Spec:** section 2c of the staff flows doc. Secondary surface — design after 2a/2b.

**Hard constraints:** EOI fields are `submittedById`, `message`, `status` (`Pending`/`Approved`/`Rejected`, terminal once decided), `visibility`; staff see all EOIs including `Private` (footnote this — the submitter chose Private and staff access is by design, per the visibility rules); staff actions are Approve/Reject (`PATCH /Eoi/{id}/status`) and Delete (`DELETE /Eoi/{id}`, staff-only).

Deliverables (`designs/flow2c/`):

1. **`01-eoi-list-staff.html`** — EOIs in the context of a CFEOI (reached from the proposal review detail), reusing the portal's flow3d inbox layout with staff additions: visibility column (Private/Shared), Delete action, and Approve/Reject on `Pending` rows. Closed-CFEOI banner state included.
2. **`02-delete-eoi-modal.html`** — destructive confirmation (permanent removal; the submitter loses their record — copy must be honest that this deletes another person's submission).

Note: staff CFEOI publish/edit/close under any proposal is supported by the backend (PRD S8) but reuses the portal's flow3c designs as-is — no new mockups unless the shell requires layout changes; state this in an annotation rather than redesigning.

---

## Brief 3 — Administration: Organisations & Users (flows 3a–3c, 4)

**Spec:** sections 3a–3c and 4 of the staff flows doc. Admin-only (`AdminOrSuperAdmin`); these screens appear in the nav only for admin roles.

**Data model (complete):** Organisation — `id`, `name`, `parentId` (null = root; single root). User — `id`, `email`, `fullName`, `role`, `organisationId` (nullable), plus expat-only profile fields not shown on staff surfaces. Creation commands: staff user = email + fullName + organisationId; org admin = email + fullName + organisationId. Staff update = email + fullName only. **Org admins have no update endpoint** — create/delete only. Provisioning note for the create forms: the email must match the identity the person will use through Entra; the form should say so.

Deliverables (`designs/flow3/`):

1. **`01-organisation-tree.html`** — hierarchy tree view with create-sub-organisation, rename, delete per node; two annotated states: populated, and the super-admin **bootstrap empty state** ("No organisations yet — create the root organisation") which doubles as flow 4.
2. **`02-organisation-modals.html`** — create/rename modal (single `name` field + parent context) and the delete confirmation. Delete copy must warn about attached records: the application layer performs **no child/attached-record checks** (the handler deletes blindly), but the database **will refuse** — organisation foreign keys are configured `Restrict` (verified in the EF migrations) — so deleting an organisation with attached users/RFPs/proposals returns an error rather than cascading. Design the warning copy and the refusal error state as the expected path for non-empty organisations. Annotate the raw-DB-error-surfacing as a flagged backend-hardening candidate (a friendly 409 would be better than a 500).
3. **`03-user-management.html`** — user list (`GET /Users`) with role filter tabs (client-side), showing name, email, role badge, organisation; actions per row: staff → edit/delete; org admin → delete only (no update endpoint — annotate why the edit action is absent); expats are listed read-only (they are managed by no one; visible because the endpoint returns all users).
4. **`04-user-forms-and-modals.html`** — create staff user form, create organisation admin form (both: email, full name, organisation selector, provisioning note), edit staff user form (email, full name), and the delete-user destructive modal (copy: removes platform access; their authored content remains — verify and state honestly what happens to records referencing the deleted user).

Open questions:
1. **Tree depth handling:** the hierarchy is unbounded — recommend a presentation (indentation vs. collapsible levels) that survives deep trees.
2. **Deleting yourself / the last admin:** the backend does not prevent an admin deleting their own account or the last admin (verify) — recommend a UI guard.

---

## Suggested order

Brief 1 → 2a → 2b → 3 → 2c. Brief 1 first because every other brief reuses its shell; 2b before 3 because it completes the platform's proposal loop; 2c last because it mostly reuses portal patterns.
