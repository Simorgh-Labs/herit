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
| [ADR-011](ADR-011-unified-organisation-terminology.md) | Unified Organisation Terminology | Accepted | Unify on "Organisation" as the sole term in code; delete duplicate Department commands/queries; rename `DepartmentId` → `OrganisationId` and `DepartmentAdmin` → `OrganisationAdmin`. |
| [ADR-012](ADR-012-generic-status-transitions.md) | Generic Status Transitions | Accepted | Model all entity status changes as a single generic command per entity with transition guard logic in the domain. |
| [ADR-013](ADR-013-azure-ad-b2c-identity-provider.md) | Azure AD B2C as Identity Provider | Accepted | Use Azure AD B2C as the single identity provider for both expat (social login) and internal (admin-provisioned) user populations. |
| [ADR-014](ADR-014-role-resolution-via-database-lookup.md) | Role Resolution via Database Lookup | Accepted | Resolve the caller's role on each authenticated request by looking up the `User` record using the B2C subject ID; roles are not stored in the JWT. |
| [ADR-015](ADR-015-jit-provisioning-expat-users.md) | Just-In-Time Provisioning for Expat Users | Accepted | Create an expat `User` record automatically on first authenticated request, deriving identity from JWT claims; no separate registration endpoint. |
| [ADR-016](ADR-016-frontend-tech-stack.md) | Frontend Tech Stack | Accepted | Both SPAs use Vite, React Router v6, TanStack Query, Tailwind CSS, shadcn/ui, MSAL React, Axios, and Vitest. |
