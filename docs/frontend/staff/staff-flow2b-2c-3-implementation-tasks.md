# Staff App Flows 2b, 2c & 3 Implementation — Task List for GitHub Issues

Implementation tasks for the Herit Staff app's flow 2b (Proposal Review), flow 2c (EOI Management), and flow 3 (Administration). Each task is intended to become one GitHub issue. **Prerequisite:** the flow 1 & 2a issues (see `staff-flow1-2a-implementation-tasks.md`) must be delivered first — every screen below lives in the shell and app scaffold they create.

Shared context for all tasks:

- Spec: sections 2b, 2c, 3a–3c, and 4 of `docs/frontend/staff/user-flows-high-level.md` (verified against the backend; authoritative).
- Designs: `docs/frontend/staff/designs/flow2b/`, `designs/flow2c/`, `designs/flow3/` — Design Component format; same reading rules as the flow 1/2a task list (`<sc-if>` = conditional states, reviewer chrome and DECISION banners are annotations, implement every state behind the switchers).
- Decisions from design review (encode, don't re-decide): post-approve is a **silent terminal state** with a "Future:" notification placeholder (no confirmation modal on Approve); organisation tree uses **flat indentation** (no collapse/expand); the UI **proactively guards** self-deletion and last-admin deletion in addition to the server-side guards below.
- Recent backend changes these flows consume (both merged):
  - **PR #287:** EOI queries return `EoiResponseDto` — submitter `name` always, `email` **staff-only**. The staff EOI list can bind both directly.
  - **PR #288:** `ConflictException` → **409** problem details; deleting a non-empty organisation (users, child orgs, RFPs, or proposals attached) returns 409 with a message; deleting your own account returns **403**; deleting the last remaining `OrganisationAdmin` returns **409**. Note: the server guard targets `OrganisationAdmin` (no SuperAdmin delete endpoint exists) — align any guard copy with that, not the mockup's SuperAdmin example.
- Proposal facts: staff read all proposals regardless of visibility; staff transitions are exactly `Submitted → UnderReview` and `UnderReview → Approved` (`MutationPolicy` rejects everything else, including owner-side transitions by staff); there is **no reject transition**; staff never edit proposal content; **deleting a proposal cascades** to its CFEOIs and their EOIs (verified in EF migrations) — takedown copy must say so, and the design's hedged "delete error" state can be dropped for this path.
- Admin facts: org model is `id`, `name`, `parentId` (single root, null parent); user management commands are create staff (email, fullName, organisationId), update staff (email, fullName only), delete staff, create/delete org admin (**no org-admin update endpoint**); `GET /Users` returns all users including expats (display read-only); all admin routes/pages are `AdminOrSuperAdmin`-gated and hidden from staff-role navigation.
- No organisation scoping — keep the mockups' footnotes; never imply org boundaries.
- Surface structured API errors (403/409 problem details) with their messages; no generic "something went wrong" for guard/conflict paths.

---

## 1. Implement the proposal review queue (flow 2b, screen 01)

Implement the queue per `designs/flow2b/` screen 01 and spec section 2b, at the shell's Proposals route.

Primary tabs filter client-side to `Submitted` and `UnderReview`; a third "All proposals" tab shows every status and visibility, with the mockup's footnote that staff read-access spans all visibilities by design. Columns: title, author, organisation, status badge, visibility badge. Rows link to the review detail. Empty states for the queue tabs. Data: `GET /api/v1/Proposals` (staff receive everything; create the staff app's `api/proposals.ts`).

## 2. Implement the proposal review detail with takedown (flow 2b, screens 02–03)

Implement the review detail in its three status states plus the takedown modal per `designs/flow2b/` screens 02–03 and spec section 2b.

Read-only proposal content (staff never edit), author, organisation, linked RFP if any, and the proposal's CFEOIs with EOI counts (each linking to the flow 2c list). Actions per state: **Submitted** → Start Review (`PATCH /api/v1/Proposals/{id}/status` → `UnderReview`, bare confirm); **UnderReview** → Approve (→ `Approved`, bare confirm; then the silent terminal state with the "Future: notify owner" placeholder per the decided behaviour); **Approved** → no transitions, terminal notice. Delete (takedown) is available in every state, visually separated from review actions, using the shared destructive modal with checkbox gate; copy must state the cascade fact: the proposal **and its CFEOIs and their EOIs are permanently deleted**. `DELETE /api/v1/Proposals/{id}` → return to queue with confirmation.

## 3. Implement the staff EOI list and delete modal (flow 2c, screens 1–2)

Implement the staff EOI view per `designs/flow2c/` and spec section 2c, reached from the CFEOI entries on the proposal review detail.

The list reuses the portal inbox layout with staff additions: a Visibility column (Private/Shared), submitter name **and email** (both provided by `EoiResponseDto` — email arrives for staff callers only), Approve/Reject inline on `Pending` rows (`PATCH /api/v1/Eoi/{id}/status`; terminal — decided rows show no actions), and a staff-only Delete on every row. Include the Private-EOI footnote from the mockup ("visibility rules restrict other expats, not staff review, by design") and the closed-CFEOI banner state. Delete opens a destructive confirmation whose copy is honest that this permanently removes **another person's submission** → `DELETE /api/v1/Eoi/{id}`. Staff CFEOI publish/edit/close surfaces are out of scope for this issue (backend supports them; defer until wanted).

## 4. Implement the organisation tree and modals (flow 3, screens 01–02)

Implement the hierarchy view and its modals per `designs/flow3/` screens 01–02 and spec sections 3a/4, on the admin-only Organisations route.

Flat-indented tree (28px/level per the decided behaviour) from `GET /api/v1/Organisation`, with per-node create-sub-organisation, rename, and delete. Include the super-admin **bootstrap empty state** ("No organisations yet — create the root organisation" → first `POST` with null parent). Create/rename modal: single name field + parent context (`POST` / `PUT /api/v1/Organisation/{id}`). Delete: warning copy about attached records, and on `DELETE` handle the **409** from PR #288 by showing the server's conflict message (the mockup's "Delete refused" state) — this is the expected path for non-empty organisations, not an edge case.

## 5. Implement the user management list (flow 3, screen 03)

Implement the user list per `designs/flow3/` screen 03 and spec sections 3b/3c, on the admin-only Users route.

`GET /api/v1/Users` with client-side role filter tabs; columns: name, email, role badge, organisation. Row actions by role: staff → Edit + Delete; organisation admin → Delete only (annotated in the mockup — no update endpoint exists); expats → read-only with the mockup's explanatory note; the current user's own row is marked "(you)" with delete disabled (see task 6's guards). "Create staff user" and "Create organisation admin" actions open the forms from task 6.

## 6. Implement the user forms and delete guards (flow 3, screen 04)

Implement the create/edit forms and the delete-user modal per `designs/flow3/` screen 04 and spec sections 3b/3c.

Create staff user and create organisation admin forms (email, full name, organisation selector from `GET /api/v1/Organisation`, plus the provisioning note that the email must match the person's Entra sign-in identity) → `POST /api/v1/Users/staff` / `POST /api/v1/Users/organisation-admins`. Edit staff user form (email, full name only) → `PUT /api/v1/Users/staff/{id}`. Delete: destructive confirmation stating the account loses platform access; client-side guards block deleting yourself and the last organisation admin *before* any request (per the design's decided behaviour), and the handlers' server responses (403 self-delete, 409 last-admin from PR #288) are surfaced with their messages as the backstop — align guard copy with the server's `OrganisationAdmin` semantics rather than the mockup's SuperAdmin example.
