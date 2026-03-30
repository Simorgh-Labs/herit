# Frontend Architecture

## Table of Contents

1. [Overview](#1-overview)
2. [Application Structure](#2-application-structure)
3. [Portal App (`frontend/portal`)](#3-portal-app-frontendportal)
4. [Staff App (`frontend/staff`)](#4-staff-app-frontendstaff)
5. [Authentication](#5-authentication)
6. [API Integration](#6-api-integration)
7. [Tech Stack](#7-tech-stack)
8. [Azure Infrastructure](#8-azure-infrastructure)

---

## 1. Overview

The Herit frontend consists of two separate React single-page applications deployed to distinct URLs. They share no codebase but communicate with the same backend API.

| App | Audience | URL |
|-----|----------|-----|
| Portal | Expat users and unauthenticated public visitors | TBD |
| Staff | Government staff, organisation admins, and super admin | TBD |

The two-app approach was chosen to give each audience a focused, uncluttered experience. The expat portal is a public-facing product; the staff app is an internal tool. Their navigation structures, information hierarchies, and authentication flows are distinct enough to justify separate codebases.

---

## 2. Application Structure

Both apps live under `frontend/` in the monorepo:

```
herit/
└── frontend/
    ├── portal/     ← expat-facing SPA
    └── staff/      ← staff and admin SPA
```

Each app is a self-contained project with its own `package.json`, build configuration, and deployment pipeline entry.

---

## 3. Portal App (`frontend/portal`)

### Users

- **Unauthenticated visitors** — can browse published RFPs and public proposals without logging in
- **Authenticated expats** — can create and manage proposals, publish CFEOIs, submit and manage EOIs

### Key surfaces

- Landing page — marketing/intro widget and live list of published RFPs
- RFP browser — list and detail views of published RFPs
- Proposal browser — list and detail views of public and shared proposals
- Expat dashboard — personal proposals, CFEOIs, and EOIs (authenticated only)
- Proposal creation and management flow (authenticated only)
- CFEOI browser and EOI submission (authenticated only)

### Authentication

Expats authenticate via Azure AD B2C social login (Google, with additional providers to follow). First login triggers just-in-time account provisioning (see [ADR-015](../decisions/ADR-015-jit-expat-provisioning.md)). Unauthenticated visitors can browse public content without logging in.

---

## 4. Staff App (`frontend/staff`)

### Users

- **Staff users** — manage RFPs, review proposals, manage EOIs
- **Organisation admins** — manage sub-organisations and staff users within their organisation
- **Super admin** — manages the root organisation hierarchy

### Key surfaces

- **Staff section**
  - RFP management — create, edit, approve, publish RFPs
  - Proposal review — view submitted proposals, transition status, manage EOIs
- **Admin section**
  - Organisation hierarchy management
  - Staff user and organisation admin management

All surfaces require authentication. There is no public-facing content in the staff app.

---

## 5. Authentication

_To be detailed once authentication implementation is complete. See [ADR-013](../decisions/ADR-013-azure-ad-b2c.md), [ADR-014](../decisions/ADR-014-role-resolution.md), and [ADR-015](../decisions/ADR-015-jit-expat-provisioning.md)._

---

## 6. API Integration

Both apps communicate with `Herit.Api` exclusively over HTTP. All authenticated requests include a Bearer token issued by Azure AD B2C. The API is the single source of truth — neither app holds persistent state beyond the current session.

---

## 7. Tech Stack

_To be decided. Candidates to evaluate before scaffolding:_

- Build tool
- Routing library
- Server state management
- Component/styling library
- Testing framework

---

## 8. Azure Infrastructure

Each app is deployed to its own Azure App Service (Linux, Node 20 LTS, PM2 SPA mode), both hosted on the shared App Service Plan. See the [Architecture Overview](architecture-overview.md#7-azure-infrastructure) for the full infrastructure resource list.

CORS on the API App Service is configured to permit requests from both app origins.
