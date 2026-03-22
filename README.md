# Herit

A web platform that connects diaspora members with their home country's government — enabling expats to submit proposals, recruit volunteers, and contribute their skills and expertise to public sector initiatives.

---

## Overview

Herit is a two-sided platform serving two primary user groups:

- **Expat Users** — diaspora members who submit project proposals to government departments, either independently or in response to a published Request For Proposal (RFP), and recruit fellow expats as contributors via Calls for Expression of Interest (CFEOIs).
- **Government Staff** — public sector employees who publish RFPs, review and manage incoming proposals, and oversee Expressions of Interest (EOIs).

The platform supports a hierarchical organisational structure reflecting real-world government department hierarchies, and is managed by Super Admins and Department Admins who control access and structure.

---

## Status

| | |
|---|---|
| **Version** | 1.0 (Draft) |
| **Stage** | Pre-development |
| **Last updated** | March 2026 |

---

## Documentation

| Document | Description |
|---|---|
| [`docs/prd/Herit_PRD.md`](docs/prd/Herit_PRD.md) | Full Product Requirements Document |
| `docs/architecture/` | Architecture design documents *(coming soon)* |
| `docs/decisions/` | Architecture Decision Records (ADRs) *(coming soon)* |

---

## Core Entities

| Entity | Description |
|---|---|
| **RFP** | A Request For Proposal published by a staff user to solicit proposals from the expat community |
| **Proposal** | A volunteer project proposal submitted by an expat, independently or in response to an RFP |
| **CFEOI** | A Call For Expression Of Interest published under a proposal to recruit contributors |
| **EOI** | An Expression of Interest submitted by an expat in response to a CFEOI |
| **Organisation** | A node in the government department hierarchy, from root organisation down to sub-departments |

---

## User Roles

| Role | Description |
|---|---|
| **Super Admin** | System owner — manages the root organisation and the full department hierarchy |
| **Department Admin** | Manages a specific department, its sub-departments, and its staff |
| **Staff User** | Government employee — publishes RFPs, reviews proposals, and manages EOIs |
| **Expat User** | Diaspora member — submits proposals, publishes CFEOIs, and responds to opportunities |

---

## Key Features

**For Expat Users**
- Submit a project proposal from scratch or in response to a published RFP
- Manage proposal visibility (private, shared, or public)
- Publish a CFEOI under a proposal to recruit contributors
- Submit or withdraw an EOI in response to a CFEOI
- Browse published RFPs, proposals, and CFEOIs

**For Government Staff**
- Publish and manage RFPs
- Review, approve, and manage incoming proposals
- Manage EOIs submitted to CFEOIs

**For Admins**
- Manage the government department hierarchy
- Manage staff accounts and access permissions

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | .NET 10 / ASP.NET Core |
| **Architecture** | Clean Architecture with CQRS (MediatR) |
| **Frontend** | TBD |
| **Database** | Azure SQL |
| **Cloud** | Microsoft Azure |
| **IaC** | Bicep |
| **CI/CD** | GitHub Actions |

---

## Repository Structure

```
/.devcontainer              ← Dev container config for consistent local environments
/.github
  /workflows                ← GitHub Actions CI/CD pipelines
/.vscode                    ← Shared VS Code workspace settings
/docs
  /prd                      ← Product Requirements Documents
  /architecture             ← Architecture design documents (coming soon)
  /decisions                ← Architecture Decision Records - ADRs (coming soon)
/infra                      ← Azure infrastructure as code (Bicep)
/src
  /Herit.Domain             ← Core entities, enums, and domain interfaces
  /Herit.Application        ← Use cases, MediatR handlers, DTOs
  /Herit.Infrastructure     ← EF Core, repositories, external services
  /Herit.Api                ← ASP.NET Core controllers and middleware
/tests
  /Herit.Domain.Tests
  /Herit.Application.Tests
  /Herit.Infrastructure.Tests
  /Herit.Api.Tests
azure.yaml                  ← Azure Developer CLI configuration
Herit.slnx                  ← .NET solution file
CONTRIBUTING.md
LICENSE
README.md
```

---

## Getting Started

> Setup instructions will be added once the development environment is established.

---

## Contributing

This is an open-source project. Contribution guidelines are available in [`CONTRIBUTING.md`](CONTRIBUTING.md).

To report a bug or request a feature, please [open an issue](../../issues/new/choose).

---

## Open Questions

Several key decisions are still under discussion — see [Section 10 of the PRD](docs/prd/Herit_PRD.md#10-open-questions) for the full list. These include:

- Which identity provider will be used for expat and staff authentication
- Whether social login (e.g. Google, LinkedIn) will be supported
- Whether a notification system (email or in-app) is required
- Whether content moderation is needed before proposals become visible

---

## License

TBD
