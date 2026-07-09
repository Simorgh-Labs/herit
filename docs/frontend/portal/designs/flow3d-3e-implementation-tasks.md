# Flow3d & Flow3e Implementation — Task List for GitHub Issues

Implementation tasks for flow 3d (Manage Incoming EOIs, owner) and flow 3e (Browse CFEOIs & Submit/Withdraw EOI, contributor) in the Herit Portal React app (`frontend/portal/src/`). Each task is intended to become one GitHub issue. These are the last unbuilt expat-portal flows.

Shared context for all tasks:

- Spec: sections 3d and 3e of `docs/frontend/portal/user-flows-high-level.md` — verified against the backend and updated with two decided behaviours: (a) the withdraw action appears on all EOI statuses, labelled "Withdraw" on `Pending`/`Approved` and "Delete" on `Rejected`, both invoking the same endpoint and confirmation modal; (b) the UI discourages duplicate EOIs — if the current user already has an EOI on a CFEOI, "Express Interest" is replaced by an already-submitted state.
- Designs: `docs/frontend/portal/designs/flow3d/` and `docs/frontend/portal/designs/flow3e/`. The flow3e files use annotated multi-state blocks (STATE/BLOCK/DECISION banners are annotations, not UI). Ignore any leftover designer-note copy inside the mockups; the spec is authoritative where they differ.
- EOI model (complete): `id`, `submittedById`, `message`, `cfeoiId`, `status` (`Pending`/`Approved`/`Rejected`; created `Pending`; `Approved`/`Rejected` terminal), `visibility` (`Private`/`Shared`; created `Private`). Withdrawal permanently deletes the record.
- API functions already exist in `frontend/portal/src/api/eois.ts`: `listEoisByCfeoi`, `listMyEois`, `getEoiById`, `submitEoi`, `withdrawEoi`, `updateEoiStatus`, `setEoiVisibility`.
- Stubs and routes already exist: `pages/app/CfeoiEoiInboxPage.tsx` at `/cfeois/:cfeoiId/eois`, `pages/app/MyEoisPage.tsx`. Status badge styles: `components/StatusBadge.tsx`.
- Follow the conventions of the implemented flows (1, 2, 3a, 3b, 3c) for layout, forms, confirmations, guards, and routing (`routes/router.tsx`).

---

## 1. Implement the owner EOI inbox (flow 3d)

Implement the EOI inbox per mockup `flow3d/01-eoi-inbox-owner.html` and spec section 3d, replacing the stub `CfeoiEoiInboxPage.tsx` at `/cfeois/:cfeoiId/eois`.

The inbox lists EOIs for the CFEOI via `listEoisByCfeoi`, filtered client-side by status (`Pending`/`Approved`/`Rejected` — the only three values; withdrawn EOIs are deleted and simply don't appear). Each entry shows submitter and message/cover note, with Approve and Reject actions calling `updateEoiStatus`; both are terminal, so approved/rejected entries show no further actions. Reachable from the owner CFEOI detail page's "View All EOIs" link (already implemented in flow3c). Guard the route to the proposal owner. Respect EOI visibility: only `Shared` EOIs are visible to the owner per the spec's visibility rules — confirm the backend's behaviour for this endpoint and match it. The inbox must remain accessible when the CFEOI is `Closed` (with the closed-state banner from the mockup).

## 2. Implement contributor states on the CFEOI detail page (flow 3e)

Implement the contributor-facing states per mockup `flow3e/01-cfeoi-detail-contributor-states.html` and spec section 3e, extending the existing `pages/public/CfeoiDetailPage.tsx` (which already has owner states and a sign-in modal).

Four states for non-owners: Open + authenticated → "Express Interest" CTA linking to the submission form; Open + unauthenticated → sign-in prompt (reuse the existing modal); Open + already submitted by this user → replace the CTA with the "You've expressed interest" card showing the EOI's status and linking to My EOIs (detect via `listMyEois`); Closed → closed notice, no CTA. Include the parent-proposal link in the sidebar for all states.

## 3. Implement the EOI submission form (flow 3e)

Implement the Express Interest form per mockup `flow3e/02-eoi-submission-form.html` and spec section 3e.

A dedicated page reached from the CFEOI detail CTA, showing the target CFEOI context and a single required field: the message/cover note (no other fields exist on the EOI model). Include the note that the EOI starts as `Private` and can be switched to `Shared` from My EOIs. Submit via `submitEoi`, then redirect back to the CFEOI detail page showing the inline success banner and the already-submitted sidebar state (mockup BLOCK B) — no separate success page. Guard against unauthenticated users, `Closed` CFEOIs, and direct navigation when the user already has an EOI on this CFEOI.

## 4. Implement the My EOIs page (flow 3e)

Implement the My EOIs page per mockup `flow3e/03-my-eois.html` and spec section 3e, replacing the stub `MyEoisPage.tsx`.

List the user's EOIs via `listMyEois`, each showing the parent CFEOI (linked) and proposal, a status badge (reuse `StatusBadge`), the Private/Shared visibility segmented toggle calling `setEoiVisibility`, and the withdraw action — labelled "Withdraw" on `Pending`/`Approved` rows and "Delete" on `Rejected` rows per the decided behaviour (both open the same confirmation modal from task 5). Include client-side status filter tabs with the interim-filtering note, and the empty state with a link to the CFEOI directory.

## 5. Implement the withdraw/delete EOI confirmation modal (flow 3e)

Implement the confirmation modal per mockup `flow3e/04-withdraw-eoi-modal.html` and spec section 3e.

Triggered from My EOIs (both the Withdraw and Delete labels). Copy must state the EOI is permanently deleted — not archived, not reversible, removed from the owner's inbox — and the confirm button stays disabled until the acknowledgement checkbox is ticked, matching the flow3b/07 destructive-modal pattern (reuse the shared component if one was extracted during flow3c; otherwise extract it now rather than duplicating). On confirm, call `withdrawEoi`, remove the row, and show an in-app confirmation.
