## Overview
- This plan produces a revised set of high-level flowchart diagrams for the Expat (Herit Portal) user journeys that corrects terminology, lifecycle states, and scope to match the PRD and the backend API (source of truth).
- Diagrams explicitly show the proposal lifecycle (including the Resourcing phase), remove unsupported draft states and out-of-scope features, and mark notification/email actions as future infrastructure (placeholders, not current dependencies).

## Plan Details
- Diagram type: Flowchart (one diagram per major flow). Each diagram uses start/end nodes, numbered steps, decision diamonds, and clearly labelled placeholders for future features (notifications). No out-of-scope features are included.

### Diagram set (overview)
1. Unauthenticated Browsing — public access to RFPs and public proposals/CFEOIs
2. Authentication (Sign in with Google + JIT Registration)
3. Authenticated Expat Flows — split into five focused flowcharts:
   a. Create a Proposal (standalone or in response to an RFP)
   b. Manage Proposal Lifecycle (Ideation → Resourcing → Submitted → Under Review → Approved / Withdrawn)
   c. Publish and Manage a CFEOI under a Proposal (only creates Open CFEOIs; no drafts)
   d. Manage Incoming EOIs (review, approve, reject)
   e. Browse CFEOIs & Submit/Withdraw EOI (contributor perspective)

### 1) Unauthenticated Browsing (flow nodes & branches)
- Start: Public Landing / Home
- Node 1: RFP List (published) — filters & search
  - Note: The current `GET /api/v1/Rfps` endpoint returns all RFPs with no server-side filtering. Until query parameters are added to the backend, the frontend must filter client-side to show only `Published` RFPs.
- Node 2: RFP Detail (read-only) — RFP metadata, department, publish date, public attachments are out-of-scope (do not reference attachments)
- Branch: From landing or RFP list → Public Proposals List
  - Note: The current `GET /api/v1/Proposals` endpoint returns all proposals with no server-side visibility or status filtering. Until query parameters are added to the backend, the frontend must filter client-side to show only proposals with `Visibility = Public`.
- Node 3: Proposal Detail (public) — summary, status, visible CFEOIs
- Node 4: CFEOI Detail (public) — resource type, role title, skills required, slots, duration, location, deadline, external links
- Decision: Attempt to interact (Express Interest / Apply / Bookmark)?
  - If Yes → Prompt: Sign in with Google (link to Authentication flow)
  - If No → End (continue browsing)
- Note: Email subscription for unauthenticated users is out-of-scope and is not shown.

### 2) Authentication (Sign in with Google → JIT registration)
- Start: Sign in with Google
- Node 1: Google OAuth flow (success/failure)
  - Failure → Error / retry or Contact Support (end)
- Decision: Is this first-time sign-in (JIT registration)?
  - If Yes → Node 2: JIT Registration form (fields: full name, nationality, location, expertise tags, accept terms)
    - Action: Submit → calls `POST /api/v1/Users` (RegisterExpat) → Confirmation message (in-app) and placeholder: Future email welcome (not required now)
  - If No → Continue
- Node 3: Post-login Landing (authenticated dashboard or the page the user was attempting)
- End: Authenticated session established

### 3a) Create a Proposal (standalone or in response to an RFP)
- Start: Click "Create Proposal" or "Respond to RFP" from RFP Detail
- Decision: Create type? (Standalone / Respond to RFP)
  - If Respond to RFP → Pre-fill RFP reference (`RfpId`) and associated organisation
- Node: Proposal Editor (fields: title, short description, long description, associated organisation, visibility setting: **Public / Shared / Private**)
  - Note: Attachments are out-of-scope and are not included in the editor
- Actions:
  - Save (creates proposal via `POST /api/v1/Proposals`) → Proposal is created in `Ideation` status; in-app confirmation
  - Update content while in Ideation or Resourcing (implicit owner-only edits via `PUT /api/v1/Proposals/{id}`) → in-app confirmation
  - Preview → Open read-only preview
  - Move to Resourcing (explicit action via `PATCH /api/v1/Proposals/{id}/status` with `Resourcing`) → in-app confirmation
  - Submit to department (allowed when proposal is in `Resourcing` status, via `PATCH /api/v1/Proposals/{id}/status` with `Submitted`) → confirmation modal
- Outcome:
  - On Submit: status becomes `Submitted`; placeholder node: Future email notification to department (no current backend dependency)
  - On Move to Resourcing: status becomes `Resourcing`; CFEOI publishing becomes available
- End: Proposal created in `Ideation` status (transitions occur via subsequent actions)

### 3b) Manage Proposal Lifecycle (explicit states & transitions)
- Start: User opens My Proposals list
- Node: Proposal Card → shows **Status** (Ideation / Resourcing / Submitted / Under Review / Approved / Withdrawn) and **Visibility** (Public / Shared / Private)
- Allowed actions per status:
  - **Ideation**: Edit content (`PUT /api/v1/Proposals/{id}`), Change Visibility (`PATCH /api/v1/Proposals/{id}/visibility`), Move to Resourcing (`PATCH /api/v1/Proposals/{id}/status` → `Resourcing`), Delete (`DELETE /api/v1/Proposals/{id}`)
  - **Resourcing**: Edit content, Change Visibility, Publish CFEOI (creates Open CFEOI — see flow 3c), Move to Submitted (`PATCH /api/v1/Proposals/{id}/status` → `Submitted`), Delete
  - **Submitted**: Withdraw → confirmation modal → `PATCH /api/v1/Proposals/{id}/status` with `Withdrawn`; view submission status
  - **Under Review**: No owner edits to proposal content; owner can view current review status only
  - **Approved**: No further owner actions on proposal content; owner may change visibility (`PATCH /api/v1/Proposals/{id}/visibility`)
  - **Withdrawn**: Terminal state — no further actions available. The proposal is read-only and cannot be resubmitted or reactivated.
- Visibility behaviour:
  - **Public** = visible to everyone (unauthenticated + authenticated)
  - **Shared** = visible only to registered and authenticated expat users
  - **Private** = visible only to the proposal owner
- Deletion and withdrawal require a confirmation modal; each action shows an in-app confirmation and a placeholder for future email notification
- End: Proposal state updated accordingly

### 3c) Publish and Manage a CFEOI under a Proposal (reflects backend model)
- Precondition: Proposal must be in **Resourcing** status (or later) to publish a CFEOI
- Start: From Proposal Detail (owner) click "Publish CFEOI"
- Node: CFEOI Form
  - **Required fields**: title, description, resource type (`Human` / `Non-Human`), role title, skills required, number of slots
  - **Optional fields**: duration (weeks), location, compensation, deadline, external links
  - Note: CFEOI has no independent visibility setting — it inherits the parent proposal's visibility automatically. Do not include a visibility control in this form.
  - Note: Attachments and CFEOI drafts are out-of-scope. Publishing immediately creates an `Open` CFEOI via `POST /api/v1/Cfeoi`.
- Action: Publish CFEOI → immediate creation of an `Open` CFEOI; show in-app confirmation and placeholder: Future email notification to subscribers/department (no current backend dependency)
- Post-publish owner actions on an existing CFEOI:
  - **Edit CFEOI**: Owner may update any CFEOI field via `PUT /api/v1/Cfeoi/{id}` while the CFEOI is `Open`
  - **Close CFEOI**: Owner closes the CFEOI via `PATCH /api/v1/Cfeoi/{id}/status` → `Closed` (e.g. when enough contributors have been found or resourcing is complete); confirmation modal required. Once `Closed`, a CFEOI cannot be reopened — this is a terminal state.
- Outcome: CFEOI appears on the proposal page and in CFEOI browse lists, scoped by the parent proposal's visibility
- End: CFEOI `Open` (or `Closed` after owner closes it)

### 3d) Manage Incoming EOIs on a Proposal (owner actions within supported scope)
- Start: Owner opens Proposal → EOIs tab/Inbox
- Node: EOI List (filters: **Pending**, **Approved**, **Rejected**)
  - Note: These are the only three EOI statuses (`EoiStatus` enum: `Pending`, `Approved`, `Rejected`). There is no "reviewed" or "withdrawn" status. An EOI that has been withdrawn by its submitter is deleted from the system (`WithdrawEoi` deletes the record); it will no longer appear in this list.
- For each EOI:
  - View EOI summary (submitter name, message/cover note)
  - Actions:
    - **Approve** → `PATCH /api/v1/Eoi/{id}/status` with `Approved` → in-app confirmation and placeholder: Future email to contributor
    - **Reject** → `PATCH /api/v1/Eoi/{id}/status` with `Rejected` → in-app confirmation and placeholder: Future email to contributor
  - Note: Owner cannot assign slots, add internal notes, or download CVs — these are out-of-scope.
- End: EOIs processed and statuses updated

### 3e) Browse CFEOIs & Submit/Withdraw EOI (contributor perspective)
- Start: Browse CFEOI list or CFEOI detail page
- Node: CFEOI Detail → "Express Interest" button (only shown when CFEOI status is `Open`)
- Decision: Authenticated?
  - If No → redirect to Authentication flow (Sign in with Google)
  - If Yes → Node: EOI submission form (fields: message / cover note)
    - Note: The `SubmitEoi` command accepts `SubmittedById`, `Message`, and `CfeoiId`. Do not include an "availability" field — it is not a backend-supported field.
- Actions:
  - **Submit EOI** → `POST /api/v1/Eoi` → EOI created with `Pending` status; in-app confirmation and placeholder: Future email to contributor and proposal owner
  - **Withdraw EOI** → confirmation modal → `PATCH /api/v1/Eoi/{id}/withdraw` → the EOI record is **deleted** from the system (withdrawal is not a status change; the EOI is permanently removed); in-app confirmation and placeholder: Future email to proposal owner (if implemented in future)
  - **Manage EOI visibility** on contributor's My EOIs page: toggle between **Private** (visible to submitter only) and **Shared** (visible to submitter and the proposal owner/relevant staff) via `PATCH /api/v1/Eoi/{id}/visibility`
    - Note: `EoiVisibility` values are `Private` and `Shared`. Do not use "Public" or "Hidden" as labels.
- End: EOI submitted (status `Pending`) or deleted (if withdrawn)

### Cross-cutting rules & future-notes
- Notification/email nodes are included in the diagrams as labelled placeholders (e.g., "Future: send email to department") to show where notifications will be triggered once infrastructure exists. These placeholders are explicitly marked as not required by the current backend.
- Unsupported/out-of-scope features have been removed from all flows: bookmarks, unauthenticated email subscriptions, attachments on proposals/CFEOIs, CV download, internal messaging, EOI notes, slot assignment, and availability fields on EOIs.
- CFEOI entity model respected: CFEOIs have only `Open` and `Closed` statuses — `Open` is the initial state on publish; `Closed` is terminal. There is no CFEOI draft step. CFEOI visibility is inherited from the parent proposal and has no independent control.
- EOI entity model respected: EOI statuses are `Pending`, `Approved`, `Rejected`. Withdrawal is not a status — it permanently deletes the EOI record.
- EOI visibility values are `Private` and `Shared`. `Private` means visible to the submitter only; `Shared` means visible to the submitter and the proposal owner/relevant staff.
- Proposal statuses are `Ideation`, `Resourcing`, `Submitted`, `UnderReview`, `Approved`, `Withdrawn`. `Withdrawn` is a terminal state reachable only from `Submitted` and cannot be reversed.
- List endpoints (`GET /api/v1/Proposals`, `GET /api/v1/Rfps`, `GET /api/v1/Cfeoi`) do not yet accept filter query parameters for status or visibility. Until server-side filtering is implemented, the frontend must apply client-side filtering to respect visibility and status rules. This is a known backend gap that must be resolved before building the browse surfaces in production.

### Diagram organization & recommended next steps
- Produce separate flowcharts for: Unauthenticated Browsing; Authentication; Proposal Creation; Proposal Lifecycle; CFEOI Publishing and Management; EOI Management (owner); CFEOI Browser/EOI Submission (contributor). Provide a master index diagram that links to each flowchart and highlights the Resourcing precondition for CFEOI publishing.
- After review, expand any flow into detailed, screen-by-screen flows that include field-level validation and modal copy. When expanding, include the email/notification design only if backend notification infrastructure is confirmed.
- The staff app flows (RFP management, proposal review, EOI management, organisation hierarchy) are out of scope for this document and should be defined separately.

## Acceptance criteria
- Proposal lifecycle in the diagrams uses the explicit states: `Ideation` → `Resourcing` → `Submitted` → `UnderReview` → `Approved`. `Withdrawn` is shown as a terminal state reachable from `Submitted` only, with no path back.
- Visibility terminology for proposals uses: `Public` / `Shared` / `Private`. "Shared" means visible to authenticated expat users only.
- Visibility terminology for EOIs uses: `Private` / `Shared`. "Private" means visible to the submitter only; "Shared" means visible to the submitter and relevant staff/proposal owner.
- No "Draft" status appears for proposals; proposal-editing actions occur within `Ideation` or `Resourcing` states.
- CFEOI flows do not include draft saving; publishing creates an `Open` CFEOI immediately. CFEOI has no visibility field; it inherits visibility from its parent proposal. CFEOI `Closed` status is terminal.
- CFEOI forms include all required fields (title, description, resource type, role title, skills, slots) and all optional fields (duration in weeks, location, compensation, deadline, external links). No "visibility" control appears on the CFEOI form.
- EOI withdrawal is shown as a deletion action, not a status transition. Withdrawn EOIs do not appear in any list.
- EOI status filter options in the owner's inbox are: `Pending`, `Approved`, `Rejected` — no other values.
- Notification actions are shown only as clearly labelled placeholders (future infrastructure), not as required dependencies.
- All features listed as out-of-scope by the PRD are removed from the flows. The "availability" field does not appear in the EOI submission form.
- A note is included on list/browse surfaces flagging that server-side filtering is not yet implemented and client-side filtering is the interim approach.
