# ADR-002: CQRS with MediatR

**Status:** Accepted
**Date:** 2026-03-22

## Context

Controllers need to dispatch work to application logic without directly depending on service classes. As feature count grows, a flat service layer tends to accumulate unrelated methods and hidden coupling. We also want writes and reads to be independently evolvable.

## Decision

We apply **CQRS (Command Query Responsibility Segregation)** at the application layer, mediated by **MediatR**.

- **Commands** mutate state and return a minimal result (e.g., the created entity's ID).
- **Queries** are read-only and return DTOs.
- Each command/query is a `record` implementing `IRequest<T>`.
- Each handler is a class implementing `IRequestHandler<TRequest, TResponse>`.
- Controllers inject `IMediator` and call `mediator.Send(request)`, remaining ignorant of handler implementations.

## Consequences

**Positive:**
- Controllers are thin; all logic lives in focused handler classes.
- Commands and queries are self-documenting value objects.
- Adding a new feature means adding new files, not modifying existing ones.
- MediatR pipeline behaviors allow cross-cutting concerns (logging, validation) to be wired once.

**Negative:**
- Slight indirection overhead compared to direct service calls.
- Developers unfamiliar with MediatR must learn the request/handler pattern.
- Full CQRS with separate read/write stores is not implemented — the same database serves both sides. This is a simpler variant.
