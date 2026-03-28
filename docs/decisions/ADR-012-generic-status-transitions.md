# ADR-012: Generic Status Transition Pattern for Entity Lifecycles

**Status:** Accepted
**Date:** 2026-03-28

## Context

Four entities in the domain have status lifecycles: Rfp (`Draft → Approved → Published`), Proposal (`Ideation → Resourcing → Submitted → UnderReview → Approved`), Cfeoi (`Open → Closed`), and Eoi (`Pending → Approved | Rejected`). We needed to decide how status transitions are modelled in the CQRS command structure: as dedicated commands per transition (e.g., `ApproveRfpCommand`, `PublishRfpCommand`) or as a single generic command per entity (e.g., `UpdateRfpStatusCommand(Id, NewStatus)`) with transition guard logic.

## Decision

Use a single generic `Update<Entity>StatusCommand` per entity. Each domain entity exposes a `TransitionStatus(NewStatus)` method that validates the requested transition against a map of legal moves and throws `InvalidOperationException` for illegal transitions. The handler retrieves the entity, calls `TransitionStatus`, and saves. The controller exposes one `PATCH /api/v1/<Entity>/{id}/status` endpoint per entity.

## Consequences

**Positive:**
- One command, one handler, one endpoint per entity for all status changes. Adding or reordering states requires no structural changes.
- The PRD requirements are not finalised — states and transitions may evolve. A generic command means changing transition rules requires editing one method on the domain entity, not restructuring commands, handlers, controller actions, and tests.
- The state machines are simple (3–5 states each, mostly linear). A single handler with a transition map remains readable and maintainable at this scale.
- Transition guard logic belongs in the domain entity, keeping handlers thin and business rules in the domain layer per Clean Architecture (ADR-001).
- New contributors learn one pattern, not one-pattern-per-transition.

**Negative:**
- The API is less self-documenting than named endpoints like `/approve` or `/publish` — consumers must know which status values are valid targets.
- Authorization rules that differ per transition (e.g., only SuperAdmin can approve) must be handled inside the handler with a conditional check rather than via per-command attributes.
