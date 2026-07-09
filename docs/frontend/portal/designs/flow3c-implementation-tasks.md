# Flow3c Implementation — Task List for GitHub Issues

Implementation tasks for flow 3c (Publish and Manage a CFEOI) in the Herit Portal React app (`frontend/portal/src/`). Each task is intended to become one GitHub issue.

Shared context for all tasks:

- Spec: section 3c of `docs/frontend/portal/user-flows-high-level.md` (now reconciled with the backend — treat it as authoritative).
- Designs: `docs/frontend/portal/designs/flow3c/` (corrected mockups; treat as the visual spec).
- The CFEOI model has exactly six fields: `title`, `description`, `resourceType` (`Human` / `NonHuman`), `proposalId`, `status` (`Open` / `Closed`), `tags`. Types are in `frontend/portal/src/types/index.ts`; API functions already exist in `frontend/portal/src/api/cfeois.ts` (`publishCfeoi`, `updateCfeoi`, `updateCfeoiStatus`, `getCfeoiById`, `listCfeois`).
- Follow the conventions of the already-implemented flows (1, 2, 3a, 3b) for layout, form handling, validation, confirmations, and routing (`frontend/portal/src/routes/router.tsx`).

---

## 1. Implement the CFEOI publish form

Implement the "Publish CFEOI" screen per mockups `flow3c/01-cfeoi-publish-form.html` and `flow3c/02-cfeoi-publish-confirmation.html`, and spec section 3c.

Entry point: the "Publish CFEOI" action on the owner's proposal detail page, available only when the proposal is in `Resourcing` status (the button already exists in the flow3b-implemented proposal detail; wire it to the new route). The form collects the CFEOI fields, and submitting calls `publishCfeoi`, which immediately creates an `Open` CFEOI — there is no draft state. On success, redirect to the CFEOI detail page with the in-app confirmation shown in mockup 02 (no separate success page). Include the route, client-side validation of required fields, and guard the page against proposals not owned by the user or not in `Resourcing`/later status.

## 2. Implement the CFEOI edit form

Implement the "Edit CFEOI" screen per mockup `flow3c/04-cfeoi-edit-form.html` and spec section 3c.

Entry point: the "Edit" action on the owner's CFEOI detail page. Editing is allowed only while the CFEOI is `Open`; the form pre-fills current values and saves via `updateCfeoi`. On success, return to the CFEOI detail page with an in-app confirmation. Guard the route against non-owners and `Closed` CFEOIs.

## 3. Implement the owner CFEOI detail view (Open and Closed states)

Implement the owner's view of the CFEOI detail page per mockups `flow3c/03-cfeoi-detail-open-owner.html` (Open) and `flow3c/06-cfeoi-detail-closed-owner.html` (Closed), and spec section 3c.

A public CFEOI detail page already exists at `/cfeois/:cfeoiId` (`pages/public/CfeoiDetailPage.tsx`, from flow 1). Decide whether to extend it with owner-conditional sections or add an owner-specific view — follow whatever pattern flow 3b used for owner vs public proposal detail. Owner view when `Open`: Edit and Close actions, EOI summary with a link to the EOI inbox (`/cfeois/:cfeoiId/eois`), and a link to the parent proposal. Owner view when `Closed`: closed-state banner, no Edit/Close actions, EOI list still reachable for reviewing already-submitted EOIs. Non-owners must never see the management actions.

## 4. Implement the Close CFEOI confirmation modal

Implement the close-CFEOI flow per mockup `flow3c/05-close-cfeoi-modal.html` and spec section 3c.

Triggered from the Close action on the owner's CFEOI detail page. The modal must make clear that closing is irreversible (`Closed` is a terminal state — the backend rejects any transition out of it). On confirm, call `updateCfeoiStatus` with `Closed`, dismiss the modal, and show the detail page in its Closed state with an in-app confirmation. Reuse the shared destructive-confirmation modal pattern established by flow3b's withdraw modal rather than building a new one.
