# ADR-001: Clean Architecture

**Status:** Accepted
**Date:** 2026-03-22

## Context

Herit is a multi-stakeholder platform connecting government departments with external contributors via proposals, calls for expression of interest, and EOIs. The domain logic is non-trivial and spans multiple bounded contexts. We needed an architectural style that would keep business rules independent of infrastructure concerns, make the codebase testable, and allow the tech stack to evolve without forcing rewrites of core logic.

## Decision

We adopt **Clean Architecture** with four explicit layers:

1. **Domain** (`Herit.Domain`) — Core entities, enums, and domain rules. No dependencies on any other project.
2. **Application** (`Herit.Application`) — Use cases, MediatR request handlers, repository interfaces, and DTOs. Depends only on Domain.
3. **Infrastructure** (`Herit.Infrastructure`) — EF Core persistence, repository implementations, and external service adapters. Depends on Application and Domain.
4. **API** (`Herit.Api`) — ASP.NET Core controllers, middleware, and HTTP concerns. Depends on Application and Infrastructure (for DI wiring only).

Dependency direction is always inward: outer layers depend on inner layers, never the reverse.

## Consequences

**Positive:**
- Domain and Application logic can be unit-tested without a database or HTTP stack.
- Infrastructure and delivery mechanisms are replaceable without touching business rules.
- Onboarding is straightforward — the layer a concept belongs to is unambiguous.

**Negative:**
- More projects and files than a flat structure; simple CRUD operations require traversing multiple layers.
- DTOs and mapping between layers add boilerplate.
