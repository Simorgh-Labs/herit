# ADR-006: EF Core with Fluent API Configuration

**Status:** Accepted
**Date:** 2026-03-22

## Context

Entity Framework Core supports two approaches for mapping domain entities to database tables: **data annotations** (attributes on entity classes) and the **Fluent API** (configuration in `IEntityTypeConfiguration<T>` classes). We needed to choose one.

Data annotations couple infrastructure concerns (column types, lengths, indexes) to the Domain layer entities, which contradicts Clean Architecture's rule that the Domain has no external dependencies.

## Decision

We use **EF Core's Fluent API** exclusively, via dedicated `IEntityTypeConfiguration<T>` classes in `Herit.Infrastructure/Persistence/Configurations/`.

- Each entity has its own configuration class (e.g., `ProposalConfiguration`, `EoiConfiguration`).
- `HeritDbContext.OnModelCreating` discovers and applies all configurations from the assembly automatically via `modelBuilder.ApplyConfigurationsFromAssembly(...)`.
- Domain entities carry no EF Core attributes.

## Consequences

**Positive:**
- Domain entities remain pure — no EF Core package references in `Herit.Domain`.
- Configuration is co-located and explicit; nothing is inferred silently from conventions.
- Large or complex configurations can be split without cluttering entity files.

**Negative:**
- Configuration must be maintained in a separate file rather than inline on the property.
- Developers must know to look in `/Configurations/` for mapping details rather than the entity itself.
