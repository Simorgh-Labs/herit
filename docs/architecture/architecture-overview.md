# Architecture Overview

## Table of Contents

1. [Introduction](#1-introduction)
2. [Solution Structure](#2-solution-structure)
3. [Layer Responsibilities](#3-layer-responsibilities)
   - 3.1 [Domain Layer](#31-domain-layer)
   - 3.2 [Application Layer](#32-application-layer)
   - 3.3 [Infrastructure Layer](#33-infrastructure-layer)
   - 3.4 [API Layer](#34-api-layer)
4. [Domain Model](#4-domain-model)
5. [Request Flow](#5-request-flow)
6. [Persistence](#6-persistence)
7. [Azure Infrastructure](#7-azure-infrastructure)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Cross-Cutting Concerns](#9-cross-cutting-concerns)
10. [Architecture Decision Records](#10-architecture-decision-records)

---

## 1. Introduction

Herit is a two-sided government platform connecting Australian expats with government departments. Expats submit proposals and express interest in contributing; government staff publish Requests For Proposals (RFPs) and manage contributor intake via Calls For Expression Of Interest (CFEOIs).

The backend is a .NET 10 REST API backed by Azure SQL. The frontend (React, not yet implemented) will communicate with the API exclusively over HTTP. Infrastructure is provisioned on Microsoft Azure using Bicep and deployed via the Azure Developer CLI.

This document describes how the system is structured, how its layers interact, and how it is built and deployed.

---

## 2. Solution Structure

The repository is a single .NET solution (`Herit.slnx`) with four source projects, a test suite, and supporting infrastructure and documentation directories.

```
herit/
├── src/
│   ├── Herit.Domain/           # Core entities and enums; no external dependencies
│   ├── Herit.Application/      # Use cases, MediatR handlers, repository interfaces, DTOs
│   ├── Herit.Infrastructure/   # EF Core persistence, repository implementations
│   └── Herit.Api/              # ASP.NET Core controllers, middleware, entry point
├── tests/
│   ├── Herit.Domain.Tests/
│   ├── Herit.Application.Tests/
│   ├── Herit.Infrastructure.Tests/
│   └── Herit.Api.Tests/
├── infra/                      # Bicep templates for Azure infrastructure
├── docs/
│   ├── architecture/           # ERD, this document
│   ├── decisions/              # Architecture Decision Records (ADRs)
│   └── prd/                    # Product Requirements Document
└── .github/workflows/          # GitHub Actions CI/CD pipeline
```

### Project Dependencies

Dependencies flow strictly inward — outer layers may depend on inner layers, but inner layers have no knowledge of outer layers.

```
Herit.Api
  └── Herit.Application
  │     └── Herit.Domain
  └── Herit.Infrastructure
        └── Herit.Application
              └── Herit.Domain
```

`Herit.Api` references both `Herit.Application` and `Herit.Infrastructure`, but only to wire up dependency injection at startup. At runtime, controllers interact exclusively with the application layer through `IMediator`.

---

## 3. Layer Responsibilities

### 3.1 Domain Layer

**Project:** `Herit.Domain`
**Dependencies:** None

The domain layer contains the core business concepts and nothing else. It has no NuGet package references and no knowledge of databases, HTTP, or infrastructure.

**Contents:**
- **Entities** — `User`, `Organisation`, `Rfp`, `Proposal`, `Cfeoi`, `Eoi`. Each entity is a class with a private constructor and a static `Create` factory method that enforces invariants at construction time.
- **Enums** — `UserRole`, `RfpStatus`, `ProposalStatus`, `ProposalVisibility`, `CfeoiStatus`, `CfeoiResourceType`, `EoiStatus`, `EoiVisibility`.

Domain entities are plain C# objects. EF Core is not referenced; persistence concerns are entirely absent from this layer.

### 3.2 Application Layer

**Project:** `Herit.Application`
**Dependencies:** `Herit.Domain`, `MediatR`

The application layer orchestrates use cases. It knows what needs to happen but delegates how to the infrastructure layer via repository interfaces.

**Contents:**

- **Features** — Organised by aggregate (`Proposal`, `Eoi`, `Cfeoi`, `Rfp`, `User`, `Organisation`). Each feature contains:
  - `Commands/` — write operations (create, update, delete, status transitions). Each command is a `record` implementing `IRequest<T>`.
  - `Queries/` — read operations. Each query is a `record` implementing `IRequest<T>`.
  - A `Handler` class per command/query implementing `IRequestHandler<TRequest, TResponse>`.

- **Interfaces** — Repository contracts (`IProposalRepository`, `IEoiRepository`, etc.) that the infrastructure layer implements.

**Example — creating a Proposal:**
```
CreateProposalCommand (record)
  → CreateProposalCommandHandler
      → IProposalRepository.AddAsync(proposal)
      → returns Guid
```

### 3.3 Infrastructure Layer

**Project:** `Herit.Infrastructure`
**Dependencies:** `Herit.Application`, EF Core, EF Core SQL Server provider

The infrastructure layer is responsible for all I/O. It implements the repository interfaces defined in the application layer and provides the EF Core `DbContext`.

**Contents:**

- **`HeritDbContext`** — The EF Core database context. Exposes `DbSet<T>` properties for each aggregate root and discovers all `IEntityTypeConfiguration<T>` implementations automatically via `ApplyConfigurationsFromAssembly`.

- **Configurations** (`Persistence/Configurations/`) — One `IEntityTypeConfiguration<T>` class per entity. These define column types, required constraints, max lengths, enum conversions, and foreign key behaviours using the Fluent API. No data annotations are used on domain entities.

- **Repositories** (`Persistence/Repositories/`) — Concrete implementations of application layer interfaces, backed by `HeritDbContext`.

- **Migrations** (`Persistence/Migrations/`) — EF Core code-first migrations. The initial migration (`InitialCreate`) creates tables for all six aggregates.

- **Dependency Injection** (`DependencyInjection.cs`) — Extension method that registers `HeritDbContext` (with the SQL Server connection string) and all repository implementations as scoped services.

### 3.4 API Layer

**Project:** `Herit.Api`
**Dependencies:** `Herit.Application`, `Herit.Infrastructure` (for DI wiring only)

The API layer is the delivery mechanism. Controllers are thin — they receive HTTP requests, construct a MediatR request object, dispatch it, and return the result.

**Contents:**

- **Controllers** — One controller per aggregate, all under `api/v1/` routes. Each action method maps directly to a command or query:

  | Controller | Route prefix | Key actions |
  |---|---|---|
  | `ProposalsController` | `api/v1/Proposals` | CRUD + submit, approve, review, withdraw, set visibility |
  | `RfpController` | `api/v1/Rfp` | CRUD + approve, publish |
  | `CfeoiController` | `api/v1/Cfeoi` | List by proposal, get, publish, close |
  | `EoiController` | `api/v1/Eoi` | List by CFEOI, get, submit, approve, reject, withdraw, set visibility |
  | `UsersController` | `api/v1/Users` | CRUD |
  | `OrganisationsController` | `api/v1/Organisations` | POST (create), GET (list), GET /{id}, PUT /{id}, DELETE /{id} |

- **`Program.cs`** — Minimal hosting model entry point. Registers MediatR (scanning the Application assembly), infrastructure services, Swagger (feature-flagged), HTTPS redirection, and controller routing.

---

## 4. Domain Model

See [`erd.md`](erd.md) for the full Entity Relationship Diagram. The key entities and relationships are:

### Entities

| Entity | Purpose |
|--------|---------|
| `User` | Platform participant. Has a `Role` (SuperAdmin, OrganisationAdmin, Staff, Expat). |
| `Organisation` | A node in the government organisational hierarchy. The root organisation has no parent; all others reference a parent organisation via nullable `ParentId`. |
| `Rfp` | A Request For Proposal published by Staff to invite proposal submissions. References an `Organisation` and an author (`User`). |
| `Proposal` | A project proposal created by Staff or Expat. Optionally responds to an `Rfp`. Has a lifecycle status and a visibility level. |
| `Cfeoi` | A Call For Expression Of Interest published under a `Proposal` to recruit contributors. Specifies `ResourceType` (Human or NonHuman). |
| `Eoi` | An Expression Of Interest submitted by a `User` in response to a `Cfeoi`. Has a status (Pending → Approved/Rejected) and a visibility. |

### Key Relationships

- **Organisation hierarchy** — An `Organisation` may have a `ParentId` referencing another `Organisation`. Delete is restricted; a parent cannot be deleted while children exist.
- **Rfp → Proposal** — A `Proposal` may optionally reference an `Rfp` it was created in response to.
- **Proposal → Cfeoi** — A `Cfeoi` belongs to exactly one `Proposal`. Deleting a `Proposal` cascades to its `Cfeoi` records.
- **Cfeoi → Eoi** — An `Eoi` references exactly one `Cfeoi`. Deleting a `Cfeoi` cascades to its `Eoi` records.
- **No direct Eoi → Proposal link** — An EOI's owning Proposal is reached by traversing `Eoi → Cfeoi → Proposal`. See [ADR-004](../decisions/ADR-004-eoi-requires-cfeoi.md).

### Entity Lifecycles

**Rfp status:** `Draft → Approved → Published`

**Proposal status:** `Ideation → Resourcing → Submitted → UnderReview → Approved`

**Proposal visibility:** `Private → Shared → Public`

**Cfeoi status:** `Open → Closed`

**Eoi status:** `Pending → Approved | Rejected`

---

## 5. Request Flow

Below is the end-to-end flow for a write operation (command). Reads follow the same path but bypass the command/repository mutation step and return a DTO.

```
HTTP Client
    │
    │  POST /api/v1/Proposals   { title, shortDescription, ... }
    ▼
Herit.Api — ProposalsController.Create(CreateProposalCommand)
    │
    │  mediator.Send(command)
    ▼
Herit.Application — CreateProposalCommandHandler.Handle(command, ct)
    │
    │  1. Validate inputs
    │  2. Construct domain entity via Proposal.Create(...)
    │  3. repository.AddAsync(proposal)
    │
    ▼
Herit.Infrastructure — ProposalRepository.AddAsync(proposal)
    │
    │  _dbContext.Proposals.Add(proposal)
    │  _dbContext.SaveChangesAsync()
    │
    ▼
Azure SQL — INSERT INTO Proposals (...)
    │
    │  returns
    ▼
Herit.Application — handler returns proposal.Id (Guid)
    │
    ▼
Herit.Api — controller returns 201 Created with Location header
    │
    ▼
HTTP Client
```

**Key observations:**
- The controller constructs the MediatR request from the HTTP body and dispatches it — it does not call repositories or touch the domain directly.
- The handler owns all orchestration logic. It is the only place where business rules are enforced.
- The domain entity is constructed via a factory method (`Proposal.Create`), ensuring invariants are always checked in one place.
- The repository abstracts persistence; the handler never references `HeritDbContext` or EF Core.

---

## 6. Persistence

### Database

Azure SQL (SQL Server) is the production database. The EF Core SQL Server provider is used throughout. See [ADR-005](../decisions/ADR-005-azure-sql.md).

### Schema Conventions

All tables are defined via Fluent API `IEntityTypeConfiguration<T>` classes in `Herit.Infrastructure/Persistence/Configurations/`. See [ADR-006](../decisions/ADR-006-ef-core-fluent-api.md).

| Convention | Detail |
|---|---|
| Primary keys | `Guid`, generated by the application (not the database) |
| String columns | All `IsRequired()` unless optional; `HasMaxLength()` on bounded strings |
| Enum columns | Stored as `int` via `HasConversion<int>()`. See [ADR-007](../decisions/ADR-007-enums-as-int.md). |
| Cascade delete | Cfeoi cascades from Proposal; Eoi cascades from Cfeoi |
| Restrict delete | Organisation parent-child (prevents orphaned hierarchy) |

### String Length Constraints

| Column | Max Length |
|---|---|
| Title (Proposal, Rfp, Cfeoi) | 256 |
| Short description (Proposal, Rfp) | 512 |
| Long description | `nvarchar(max)` |
| Email, FullName (User) | 256 |
| Organisation Name | 256 |

### Repository Pattern

Each aggregate root has an interface in `Herit.Application/Interfaces/` and a concrete implementation in `Herit.Infrastructure/Persistence/Repositories/`. Handlers depend on interfaces; EF Core is only referenced in the Infrastructure project. See [ADR-002](../decisions/ADR-002-cqrs-mediatr.md).

### Migrations

Code-first migrations are stored in `Herit.Infrastructure/Persistence/Migrations/`. The `InitialCreate` migration creates all six tables. Migrations are applied to the target database as part of the deployment process.

---

## 7. Azure Infrastructure

Infrastructure is defined as code using **Bicep** templates under `/infra/` and managed via the **Azure Developer CLI (`azd`)**. The main template (`infra/main.bicep`) deploys at subscription scope and creates a resource group named after the environment.

### Resources

| Resource | Purpose |
|---|---|
| **App Service Plan** | Shared compute host for the API and web app services |
| **API App Service** | Hosts the .NET 10 ASP.NET Core API (`Herit.Api`). Linux, .NET Core 10.0. System-assigned managed identity for Key Vault access. |
| **Web App Service** | Hosts the React frontend. Linux, Node 20 LTS, served via PM2 in SPA mode. |
| **Azure SQL Server + Database** | Production database (`Herit`). A deployment script provisions a dedicated app user with `db_owner`. Azure Services firewall rule enabled. |
| **Azure Key Vault** | Stores secrets: SQL connection string, SQL admin password, app user password. Accessed by the API App Service via managed identity. |
| **Application Insights** | Telemetry and monitoring for both the API and web app. Connection string surfaced as an environment variable. |
| **API Management (optional)** | Optional APIM resource for gateway-level rate limiting, versioning, and developer portal. Provisioned only when enabled. |

### Networking & Security

- The API App Service authenticates to Key Vault using its **system-assigned managed identity** — no long-lived credentials are embedded in application settings.
- CORS on the API App Service is configured to permit the web app's origin and `portal.azure.com` (for testing).
- The SQL Server has a firewall rule allowing Azure-internal traffic; connections from the API use the managed identity where possible.

### Environment Configuration

`azd` injects the following environment variables at provision/deploy time:

| Variable | Purpose |
|---|---|
| `AZURE_CLIENT_ID` | Managed identity / service principal client ID |
| `AZURE_TENANT_ID` | Azure AD tenant |
| `AZURE_SUBSCRIPTION_ID` | Target subscription |
| `AZURE_ENV_NAME` | Environment name (used in resource naming) |
| `AZURE_LOCATION` | Azure region for deployment |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Application Insights telemetry |
| `KEY_VAULT_URI` | Key Vault endpoint for secret retrieval |

---

## 8. CI/CD Pipeline

The pipeline is defined in `.github/workflows/azure-dev.yml` and runs on GitHub Actions. See [ADR-010](../decisions/ADR-010-github-actions.md).

### Triggers

| Trigger | Stages run |
|---|---|
| Push to `main` or `master` | CI + CD |
| Manual workflow dispatch | CI + CD |
| Push touching only `docs/**`, `README.md`, `CONTRIBUTING.md`, `assets/**` | Skipped entirely |

### Stage 1 — CI

Runs on every non-ignored push.

```
1. Checkout repository
2. Set up .NET 10.x SDK
3. dotnet build --configuration Release
4. dotnet test --configuration Release
```

The CD stage is gated on CI passing.

### Stage 2 — CD

Runs on `ubuntu-latest` after CI succeeds.

```
1. Azure login
   └── Primary:  OpenID Connect (federated credentials — no long-lived secret)
   └── Fallback: Client secret credentials
2. azd provision   ← creates/updates Azure resources via Bicep
3. azd deploy      ← packages and deploys the application to App Service
```

### Authentication to Azure

The pipeline uses **OpenID Connect with federated credentials** as the primary auth method. This means no Azure credentials are stored as long-lived GitHub secrets — GitHub issues a short-lived OIDC token that Azure trusts based on the configured federation. A client secret fallback is configured for environments where federated credentials are not available.

---

## 9. Cross-Cutting Concerns

### Authentication & Authorisation

Authentication is **not yet implemented**. The domain has a `UserRole` enum and the `User` entity is defined, but no authentication middleware, identity provider, or `[Authorize]` attributes are currently in place. This is an open architectural decision. Candidates include Azure AD, Azure AD B2C, and third-party OAuth providers.

### Validation

Input validation is **not yet implemented**. The planned approach is to use MediatR pipeline behaviours to run validation before handlers execute. FluentValidation is the preferred library for defining validation rules in the Application layer.

### Error Handling

Centralised error handling is **not yet implemented**. The recommended approach is a MediatR pipeline behaviour or ASP.NET Core exception middleware that maps domain exceptions to appropriate HTTP status codes.

### Logging & Observability

- **Application Insights** is provisioned as part of the Azure infrastructure and its connection string is injected at runtime.
- App Service verbose logging is enabled (application logs, detailed errors, failed request tracing, HTTP logs).
- Structured logging via `ILogger<T>` is the standard approach within .NET; specific log sinks beyond Application Insights are not yet configured.

### Swagger / OpenAPI

Swagger is enabled via a feature flag (`Features:EnableSwagger` in configuration). It is intended to be enabled in development/staging and disabled in production.

---

## 10. Architecture Decision Records

All significant architectural decisions are documented in [`docs/decisions/`](../decisions/README.md).

| ADR | Decision summary |
|-----|-----------------|
| [ADR-001](../decisions/ADR-001-clean-architecture.md) | Four-layer Clean Architecture with inward dependency flow |
| [ADR-002](../decisions/ADR-002-cqrs-mediatr.md) | CQRS with MediatR — thin controllers, focused handlers |
| [ADR-003](../decisions/ADR-003-single-user-entity.md) | Single `User` entity with `UserRole` enum |
| [ADR-004](../decisions/ADR-004-eoi-requires-cfeoi.md) | EOI must always reference a CFEOI; no direct EOI → Proposal link |
| [ADR-005](../decisions/ADR-005-azure-sql.md) | Azure SQL as the production database |
| [ADR-006](../decisions/ADR-006-ef-core-fluent-api.md) | EF Core Fluent API configuration; no data annotations on domain entities |
| [ADR-007](../decisions/ADR-007-enums-as-int.md) | All enums stored as integers |
| [ADR-008](../decisions/ADR-008-single-authorship.md) | Single `AuthorId` per Proposal and RFP |
| [ADR-009](../decisions/ADR-009-react-frontend.md) | React frontend, separately deployed, communicates via REST API |
| [ADR-010](../decisions/ADR-010-github-actions.md) | GitHub Actions CI/CD with two-stage pipeline and federated Azure auth |
| [ADR-011](../decisions/ADR-011-unified-organisation-terminology.md) | Unified Organisation terminology — delete duplicate Department handlers, rename `DepartmentId` → `OrganisationId`, `DepartmentAdmin` → `OrganisationAdmin` |
