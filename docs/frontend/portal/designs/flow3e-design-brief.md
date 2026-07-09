# Design Brief — Flow 3e: Browse CFEOIs & Submit/Withdraw EOI (Contributor)

Design the contributor-side screens for the Herit Portal. Output: static HTML/Tailwind mockups in `docs/frontend/portal/designs/flow3e/`, following the same format as the existing flow1–3d design sets.

## Authoritative spec

Section 3e of `docs/frontend/portal/user-flows-high-level.md`, plus the cross-cutting rules at the end of that document. This spec has been verified against the backend and is accurate. **Do not add any field, status, action, or feature beyond it.**

## Data model (hard constraints — verified against the backend)

EOI fields (complete list): `id`, `submittedById`, `message`, `cfeoiId`, `status`, `visibility`.

- `status`: `Pending` | `Approved` | `Rejected`. Created as `Pending`. `Approved` and `Rejected` are terminal.
- `visibility`: `Private` | `Shared`. Created as `Private`. `Private` = visible to submitter only; `Shared` = visible to submitter and the proposal owner/relevant staff. Never use "Public" or "Hidden" as labels.
- **Withdrawal permanently deletes the EOI record.** It is not a status change. The backend allows withdrawal regardless of status. A withdrawn EOI disappears from all lists.
- The submission form has exactly one input: the message/cover note (required). No availability, no experience, no attachments.

CFEOI fields (for context on the detail page): `title`, `description`, `resourceType` (`Human` | `NonHuman`), `proposalId`, `status` (`Open` | `Closed`), `tags`. Nothing else exists — no deadline, slots, location, compensation, or role title.

## Deliverables

Use this numbering (the app code already references `03-my-eois.html`):

1. **`01-cfeoi-detail-contributor-states.html`** — Contributor-facing states of the CFEOI detail page. The page itself is already designed (`flow3c/03`, `flow3c/06`) and implemented (`frontend/portal/src/pages/public/CfeoiDetailPage.tsx`, which already has a sign-in modal and an "Express Interest" card). Design the remaining states as annotated variants of that existing page — do not redesign the page:
   - Open + authenticated non-owner: "Express Interest" available.
   - Open + unauthenticated: prompt to sign in with Google (the existing sign-in modal pattern from flow1).
   - Open + already submitted by this user: show that an EOI exists, with a link to it in My EOIs; decide how/whether Express Interest remains available (see open question 2).
   - Closed: no Express Interest.
2. **`02-eoi-submission-form.html`** — EOI submission form: message/cover note field, submit, cancel back to the CFEOI. Include the post-submit in-app confirmation as an inline state (banner/toast on return to the CFEOI detail — no separate success page; see the pattern in `flow3c/02-cfeoi-publish-confirmation.html`). A modest form — consider whether it warrants a page or a modal/panel on the CFEOI detail; either is acceptable, pick one and note the rationale.
3. **`03-my-eois.html`** — My EOIs page (route exists: authenticated area). One entry per EOI showing: the parent CFEOI (title, link) and proposal, status badge (`Pending`/`Approved`/`Rejected`), the Private/Shared visibility toggle, and a Withdraw action. Include an empty state.
4. **`04-withdraw-eoi-modal.html`** — Withdraw confirmation modal. Copy must state the EOI will be **permanently deleted** (not archived, not reversible). Reuse the destructive-confirmation modal pattern from `flow3b/07-withdraw-confirmation-modal.html` exactly — same layout, radii, shadows.

## Visual system (must match, not approximate)

- Style references, in priority order: the corrected `flow3c/` set, `flow3b/07` (canonical destructive modal), `flow3b/01` (list page patterns), and the implemented app.
- Palette: use the app's actual tokens from `frontend/portal/tailwind.config.ts` — `brand: #1D4ED8` (light `#EFF6FF`, dark `#1e40af`), Inter, light theme. Copy the tailwind token block and shared header markup from a corrected flow3c mockup verbatim.
- Light theme only. No glow/neon box-shadows, no `prose-invert`, no `[color-scheme:dark]`.
- Status badge colors: follow `frontend/portal/src/components/StatusBadge.tsx` and the flow3b status conventions.

## Out of scope — do not include

Attachments or CV upload/download, availability or experience fields, bookmarks, human-friendly reference IDs (backend uses GUIDs; show no IDs), messaging between users, notifications (email may appear only as a clearly labelled "Future:" placeholder), any server-side search/filtering UI beyond simple client-side filters.

## Open questions — flag with a recommendation, don't silently decide

1. **Withdraw after decision:** the backend permits withdrawing an `Approved` or `Rejected` EOI (deletion). Should the UI offer Withdraw in those states, or only while `Pending`? Recommend one and design that; note the alternative.
2. **Duplicate EOIs:** the backend does not prevent multiple EOIs from the same user on one CFEOI. Should the UI discourage/hide Express Interest after a first submission? Recommend and design one behaviour.
