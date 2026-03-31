# Proposal Issues

---

## Issue 7: Add `Withdrawn` as a formal `ProposalStatus`

The PRD (use case E7) describes the ability for an expat to withdraw a submitted proposal. A withdrawn proposal transitions from `Submitted` to `Withdrawn` — a distinct terminal state. A withdrawn proposal cannot be resubmitted.

**Target transition:** `Submitted → Withdrawn`

**Resolved by:** Adding `Withdrawn` to the `ProposalStatus` enum, updating `AllowedTransitions` in the `Proposal` domain model, and implementing `WithdrawProposalCommandHandler`.
