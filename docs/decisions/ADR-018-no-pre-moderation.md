# ADR-018: No Pre-Moderation of Expat-Submitted Content (MVP)

**Status:** Accepted
**Date:** 2026-07-16

## Context

PRD §10 left open whether expat-submitted content (proposals, CFEOIs, EOIs) requires a staff moderation step before becoming visible to other users. A pre-moderation gate would require new statuses and review queues in the backend and a review surface in the staff app. Mitigating factors already in place: proposals are created with `Visibility = Private` by default (nothing is public without the owner's deliberate choice), CFEOIs inherit the parent proposal's visibility, EOIs default to `Private`, and staff already hold a delete capability on proposals (PRD §6.1 S7) enforced server-side by `MutationPolicy`.

## Decision

**No pre-moderation for MVP.** Content becomes visible according to its visibility rules immediately, with staff deletion as the reactive safety valve.

## Consequences

- No new backend statuses, queues, or staff review surfaces are needed for launch.
- The staff app should make the existing takedown capability discoverable (staff can delete a proposal from its detail view).
- If abuse emerges, the graduated escalation path is: (1) a report/flag mechanism feeding a staff queue, then (2) a pre-publication review gate. Both are additive and do not conflict with the current model.
