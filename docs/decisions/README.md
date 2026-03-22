# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for Herit. Each ADR documents a significant architectural choice, its context, and its consequences.

| # | Title | Status | Decision |
|---|-------|--------|----------|
| [ADR-001](ADR-001-clean-architecture.md) | Clean Architecture | Accepted | Organise the codebase into four layers (Domain, Application, Infrastructure, API) with dependencies pointing inward. |
| [ADR-002](ADR-002-cqrs-mediatr.md) | CQRS with MediatR | Accepted | Separate commands and queries as MediatR requests dispatched from thin controllers to focused handler classes. |
| [ADR-003](ADR-003-single-user-entity.md) | Single User Entity with Role Enum | Accepted | Represent all user types in one `User` entity distinguished by a `UserRole` enum, rather than separate tables. |
| [ADR-004](ADR-004-eoi-requires-cfeoi.md) | EOI Always Requires a CFEOI | Accepted | An EOI must be submitted against a CFEOI; there is no direct EOI-to-Proposal relationship. |
| [ADR-005](ADR-005-azure-sql.md) | Azure SQL as the Primary Database | Accepted | Use Azure SQL (SQL Server) as the production database, integrated with the Azure deployment platform. |
| [ADR-006](ADR-006-ef-core-fluent-api.md) | EF Core with Fluent API Configuration | Accepted | Configure all EF Core mappings via `IEntityTypeConfiguration<T>` classes; no data annotations on domain entities. |
| [ADR-007](ADR-007-enums-as-int.md) | Enums Stored as Integers | Accepted | Persist all enum properties as their underlying integer value using `HasConversion<int>()`. |
| [ADR-008](ADR-008-single-authorship.md) | Single Author per Proposal and RFP | Accepted | Each Proposal and RFP has one `AuthorId`; co-authorship is not modelled in the schema. |
| [ADR-009](ADR-009-react-frontend.md) | React Frontend | Accepted | Build the frontend in React as a separately deployed application communicating with the backend via REST API. |
| [ADR-010](ADR-010-github-actions.md) | GitHub Actions for CI/CD | Accepted | Use GitHub Actions for all CI and CD with a two-stage pipeline deploying to Azure via `azd`. |
