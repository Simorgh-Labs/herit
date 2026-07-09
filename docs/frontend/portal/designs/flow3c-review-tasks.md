# Flow3c Design Review — Task List for GitHub Issues

Tasks arising from the design review of `docs/frontend/portal/designs/flow3c/` against `docs/frontend/portal/user-flows-high-level.md` (section 3c) and the implemented flow1–3b designs. Each task is intended to become one GitHub issue.

---

## 1. Remove the invented "Category" field from all flow3c screens

The CFEOI publish form (01), edit form (04), success screen (02), and detail page (03) all include a "Category" dropdown (e.g. "Technology & IT"). Category is not a field on the CFEOI entity and has no backend/API support. Remove it from all four screens. See the CFEOI field list in section 3c of `docs/frontend/portal/user-flows-high-level.md` and the CFEOI entity in the PRD (§5.3).

## 2. Add the missing required "Title" field to CFEOI forms and displays

The spec requires both a CFEOI **title** and a **role title** as separate required fields, but the flow3c designs only have Role Title. Add a Title field to the publish form (01) and edit form (04), and display it appropriately on the success screen (02) and detail page (03). Consider how title and role title relate visually (e.g. which is the page heading).

## 3. Fix Resource Type options to Human / Non-Human

The resource type radio options in the publish form (01: "Individual Expert" / "Advisory Firm") and edit form (04: "Individual Consultant" / "Firm / Organization") do not match the backend enum, which is `Human` / `Non-Human`. Both current options are variants of Human, making it impossible to publish a Non-Human CFEOI (infrastructure, real estate, equipment, financial support). Fix the options and their labels/help text. Also consider that the form's current framing ("Role Identity", "Role Requirements", "Role Title") only makes sense for Human resources — decide how the form should adapt when Non-Human is selected.

## 4. Fix the EOI status model in the EOI inbox

The EOI inbox (06) uses statuses that don't exist: filter options include "Pending Review", "Reviewed", and "Shortlisted", and the detail drawer's actions are "Shortlist" and "Reject". The backend `EoiStatus` enum has exactly three values: `Pending`, `Approved`, `Rejected`, and the only owner actions are Approve and Reject. Update the filters, status badges, summary tiles, and drawer actions accordingly. See section 3d of `docs/frontend/portal/user-flows-high-level.md`.

## 5. Remove out-of-scope features from the EOI inbox

The EOI inbox (06) includes several features that are explicitly out of scope or unsupported by the backend: CV/attachment downloads (the "Attachments" section with a resume PDF), Export CSV, bulk-select checkboxes (no bulk API exists), an "Experience" field (not on the EOI model), and search by applicant email/ID. Strip these out. Per spec, an EOI shows submitter name and message/cover note, with Approve/Reject actions only.

## 6. Rename "Reference Documents" to "External Links" on the CFEOI detail page

The CFEOI detail page (03) labels external links as "Reference Documents" with entries styled like file attachments (e.g. "(PDF)"). Attachments are out of scope; the backend field is external links. Relabel the section and present the entries as plain links, not documents.

## 7. Remove human-friendly reference IDs from flow3c screens

Screens 02, 03, and 06 display invented reference numbers (`CFE-2026-089`, `EOI-25678`, `PRJ-2026-04`). The backend uses GUIDs and has no reference-number scheme. Either remove the IDs from the designs or replace them with something the backend can actually provide.

## 8. Rescope the EOI inbox against flow 3d and decide the entry point

Screen 06 (EOI inbox) belongs to flow 3d (Manage Incoming EOIs), not 3c, and it diverges from the 3d spec on entry point: the spec defines the inbox at the proposal level (Proposal → EOIs tab), while the design scopes it per-CFEOI. Decide which scoping to adopt (per-CFEOI arguably has better UX, but the spec says proposal-level), update the spec or the design to match, and move/rename the file so it lives with flow 3d designs.

## 9. Design the Closed-state owner view of the CFEOI detail page

Flow3c only designs the owner detail view for an `Open` CFEOI (03). `Closed` is a terminal state: the Edit and Close actions must not be available, and the page should clearly indicate closure (06 already demonstrates a closed-state info banner that can be reused). Add a Closed-state variant of the CFEOI detail page.

## 10. Replace the full-page publish success screen with an inline confirmation

Screen 02 is a dedicated full-page success screen after publishing a CFEOI. No other flow (1–3b) uses this pattern — the spec calls for "in-app confirmation", and flow3b handles state changes with inline confirmations/modals. Replace the success page with a redirect to the CFEOI detail page (03) showing a success toast or banner, consistent with the rest of the portal.

## 11. Normalize flow3c theme tokens to the app's brand palette

Flow3c defines `primary: #3B82F6`, while flow1 uses `#1E40AF`, flow3b uses `#111827`, and the implemented app (`frontend/portal/tailwind.config.ts`) uses `brand: #1D4ED8`. Flow3c buttons render a noticeably lighter blue than the implemented flows. Align flow3c's tailwind token block with the app's brand palette (and with the shared tokens used in flow3b). Also fix the header logo's `bg-brand-500` class, which is undefined in flow3c's config and renders transparent.

## 12. Remove dark-theme leftovers from flow3c screens

All five styled flow3c screens contain artifacts from a dark theme: neon glow box-shadows on buttons and icons (e.g. `shadow-[0_0_15px_rgba(59,130,246,0.3)]`), `[color-scheme:dark]` on date inputs (renders a dark native date picker on a light page), and `prose-invert` on the description in 03 (near-invisible text on white). Replace these with the standard elevation shadows and light-theme styles used in flows 1–3b.

## 13. Align the Close CFEOI modal with the flow3b confirmation modal pattern

The Close CFEOI modal (05) diverges from flow3b's withdraw confirmation modal (flow3b/07): centered-icon layout, `rounded-[14px]`, `max-w-md`, and red glow shadows vs flow3b's `rounded-xl`, `max-w-lg`, and standard shadows. These are the portal's only two destructive-confirmation modals and should share one visual pattern. Restyle 05 to match flow3b/07 (or extract a common pattern both follow).
