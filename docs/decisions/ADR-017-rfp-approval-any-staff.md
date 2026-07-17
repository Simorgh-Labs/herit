# ADR-017: RFP Approval Performable by Any Staff User (MVP)

**Status:** Accepted
**Date:** 2026-07-16

## Context

The RFP entity enforces a three-step lifecycle (`Draft → Approved → Published`) via `AllowedTransitions`, and PRD §10 left open whether a separate approval actor is required before a staff user can publish. Today all RFP status transitions are gated by the same `Staff` authorization policy, so a single staff user can draft, approve, and publish an RFP alone — the two-step lifecycle exists without separation of duties. Enforcing a distinct approver would require either a four-eyes rule (approver ≠ author) or organisation-scoped admin approval; the latter depends on org-scoped authorization that is deliberately deferred (see the scoping note in the mutation-authorization work).

## Decision

For MVP, **any staff user may perform every RFP lifecycle transition**, including on RFPs they authored. The `Draft → Approved → Published` sequence is retained in the domain model as documented intent and as the extension point for future governance.

## Consequences

- No backend change; the staff app's RFP management flows can be designed against the current policy.
- Separation of duties (approver ≠ author, or org-admin approval) is a candidate follow-up once organisation-scoped staff permissions are introduced. The domain model already supports it — only a `MutationPolicy` rule would be needed.
- The staff app UI should not imply a separate approver exists (e.g. no "submit for approval" language); actions are "Approve" and "Publish" available to any staff member.
