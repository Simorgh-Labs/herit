# ADR-005: Azure SQL as the Primary Database

**Status:** Accepted
**Date:** 2026-03-22

## Context

Herit is deployed on Microsoft Azure. We needed a relational database that integrates well with the Azure ecosystem, supports the EF Core SQL Server provider, and can scale appropriately for a government-facing platform.

Alternatives considered:
- **PostgreSQL (Azure Database for PostgreSQL)** — strong open-source option, but requires switching EF Core provider and diverges from the Microsoft-native stack.
- **SQLite** — suitable only for development/testing; not viable for production.
- **Cosmos DB** — document model is a poor fit for the relational domain model.

## Decision

We use **Azure SQL** (SQL Server) as the production database.

- The EF Core SQL Server provider (`Microsoft.EntityFrameworkCore.SqlServer`) is used.
- Connection strings are managed via environment variables and Azure Key Vault in production.
- Infrastructure is provisioned via Bicep templates in `/infra/`.

## Consequences

**Positive:**
- First-class EF Core support with SQL Server dialect.
- Native Azure integration: managed identity, private endpoints, automatic backups.
- Familiar tooling (SSMS, Azure Data Studio) for the team.
- Strong ACID guarantees for the relational domain model.

**Negative:**
- Tied to SQL Server syntax and Azure pricing model.
- Switching to another database in future would require a provider swap and migration review.
