# Product Requirements Document: Herit

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** March 2026

---

## 1. Overview

### 1.1 Purpose

This document defines the product requirements for **Herit**, a web application that connects diaspora members (expats) with their home country's government departments. It enables expats to submit voluntary proposals for government consideration and to find co-contributors from the wider diaspora community.

### 1.2 Problem Statement

Thousands of expats around the world possess valuable skills, expertise, and assets they are willing to offer their home country pro bono, out of patriotism. Some have concrete proposals and ideas; others simply want to contribute and are open to being matched with existing efforts. Currently, there is no structured mechanism for the diaspora to offer their services to their home government.

### 1.3 Proposed Solution

A web application that allows expats to:
- Submit project proposals to government departments, either in response to a published Request For Proposal (RFP) or as an original idea.
- Recruit other expat volunteers to support their proposals.

And allows government staff to:
- Publish RFPs and manage incoming proposals and Expressions of Interest (EOIs).

---

## 2. Goals and Non-Goals

### 2.1 Goals

- Provide a structured channel for the diaspora to submit proposals to government departments.
- Enable proposal owners to recruit volunteer contributors via Calls for Expression of Interest (CFEOIs).
- Allow government staff to manage RFPs, proposals, and EOIs efficiently.
- Support a hierarchical organisational structure reflecting real-world government department hierarchies.

### 2.2 Non-Goals

- Project management and execution tracking (out of scope for the Herit platform).
- Financial transactions or payment processing.
- Real-time collaboration or document co-editing.

---

## 3. Users and Roles

### 3.1 Super Admin

The system owner. Responsible for initial setup of the organisational structure. Can:
- Create, read, update, and delete (CRUD) the root organisation and any organisation hierarchy beneath it.
- CRUD organisation admins for any organisation in the system.

### 3.2 Organisation Admin

Manages a specific organisation and its sub-organisations. Can:
- CRUD a hierarchy of sub-organisations within their organisation.
- CRUD admins for their sub-organisations.
- CRUD staff users and manage their access within their organisation.

### 3.3 Staff User

Government department employees. Can:
- CRUD Requests For Proposals (RFPs).
- Manage proposals: review, change status, and delete.
- Manage EOIs: review, approve, and delete.
- Publish CFEOIs under proposals.

### 3.4 Expat User

Diaspora members registering on the platform. Can:
- Create a proposal from scratch or in response to an RFP.
- Manage their proposal's visibility, content, and lifecycle (update, submit, withdraw, delete).
- Publish a CFEOI under their own proposal to recruit contributors.
- Manage EOIs received under their proposals (review, approve, reject).
- Browse and review published RFPs, proposals, and CFEOIs.
- Submit or withdraw an EOI in response to a CFEOI.
- Manage the visibility of their submitted EOIs.

---

## 4. Organisational Structure

The entire system is organised as a tree:

- **Organisation:** Any node in the hierarchy tree, including the root. The root organisation has no parent (`ParentId` is null). All other organisations have a non-null `ParentId`.
- **Root Organisation:** The single top-level organisation representing the home-country government body. Distinguished by having `ParentId = null`. Created once during system bootstrap.

The super admin bootstraps the system with the root organisation. Admins at each level can create and manage sub-organisations and staff beneath them, allowing the hierarchy to reflect any real-world government structure.

---

## 5. Core Entities

### 5.1 RFP (Request For Proposal)

Published by a staff user to solicit proposals from the expat community on a specific topic or need.

| Attribute | Type | Notes |
|---|---|---|
| Title | Short text | Required |
| Short Description | Plain text | Required |
| Authors | User reference(s) | Required |
| Associated Organisation | Organisation reference | Required |
| Long Description | Formatted (rich) text | Required |
| Status | Enum | `draft` / `approved` / `published` |

### 5.2 Proposal

A volunteer project proposal submitted by an expat user. May be submitted independently or in response to an RFP.

| Attribute | Type | Notes |
|---|---|---|
| Title | Short text | Required |
| Short Description | Plain text | Required |
| Authors | User reference(s) | Required |
| Associated Organisation | Organisation reference | Required |
| Long Description | Formatted (rich) text | Required |
| Status | Enum | See §5.2.1 |
| Visibility | Enum | `private` / `shared` / `public` |
| RFP Reference | RFP reference | Optional; populated if submitted in response to an RFP |

#### 5.2.1 Proposal Statuses

| Status | Description |
|---|---|
| **Ideation** | The owner publishes a high-level idea and shares it with others to gather feedback and shape the proposal. |
| **Resourcing** | The core aspects of the proposal (problem statement, solution, required resources) are defined. The owner calls for volunteers to provide human resources (via CFEOI) and/or non-human resources (infrastructure, real estate, equipment, financial support). |
| **Submitted** | Required resources have been identified and the proposal is submitted to the department for review. |
| **Under Review** | Department staff are reviewing the proposal internally. |
| **Approved** | The department has approved the proposal and is ready to convert it into an active project. |

### 5.3 CFEOI (Call For Expression Of Interest)

Published by a proposal owner under a specific proposal to recruit contributors.

| Attribute | Type | Notes |
|---|---|---|
| Title | Short text | Required |
| Description | Formatted text | Required |
| Resource Type | Enum | `human` (skills/expertise) / `non-human` (infrastructure, real estate, assets, equipment, financial) |
| Associated Proposal | Proposal reference | Required |
| Status | Enum | `open` / `closed` |

### 5.4 EOI (Expression Of Interest)

A response submitted by an expat user to a CFEOI.

| Attribute | Type | Notes |
|---|---|---|
| Submitted By | User reference | Required |
| Message / Cover Note | Plain or formatted text | Required |
| Associated CFEOI | CFEOI reference | Required |
| Status | Enum | `pending` / `approved` / `rejected` |

---

## 6. Use Cases

### 6.1 Staff User Use Cases

| # | Use Case | Description |
|---|---|---|
| S1 | Create RFP | Staff user creates a new RFP (initially in `draft` status). |
| S2 | Edit RFP | Staff user updates the content of an existing RFP. |
| S3 | Publish RFP | Staff user changes an approved RFP to `published`, making it visible to expats. |
| S4 | Delete RFP | Staff user removes an RFP from the system. |
| S5 | Review Proposal | Staff user reviews a submitted proposal and transitions it to `under review`. |
| S6 | Approve Proposal | Staff user approves a proposal. |
| S7 | Delete Proposal | Staff user removes a proposal. |
| S8 | Publish CFEOI | Staff user publishes a CFEOI under a proposal. |
| S9 | Manage EOIs | Staff user reviews, approves, or deletes EOIs submitted to CFEOIs. |

### 6.2 Expat User Use Cases

#### Manage Proposals

| # | Use Case | Description |
|---|---|---|
| E1 | Create Proposal (from scratch) | Expat creates a new proposal not tied to any RFP. |
| E2 | Create Proposal (under RFP) | Expat creates a proposal in response to a published RFP. |
| E3 | Manage Proposal Visibility | Expat sets or updates the visibility of their proposal (`private` / `shared` / `public`). |
| E4 | Publish CFEOI under Proposal | Expat publishes a Call For Expression Of Interest under one of their proposals to recruit contributors. |
| E5 | Update / Delete Proposal | Expat edits the content of or deletes one of their proposals. |
| E6 | Manage EOIs on Proposal | Expat reviews, approves, or rejects EOIs received under their proposals. |
| E7 | Submit / Withdraw Proposal | Expat submits a ready proposal to the department for review, or withdraws a previously submitted proposal. |

#### Review Content

| # | Use Case | Description |
|---|---|---|
| E8 | Review RFPs | Expat browses and reads published RFPs. |
| E9 | Review Proposals | Expat browses and reads proposals visible to them. |
| E10 | Review CFEOIs | Expat browses and reads published CFEOIs. |

#### Manage EOIs

| # | Use Case | Description |
|---|---|---|
| E11 | Submit / Withdraw EOI (under CFEOI) | Expat submits an expression of interest in response to a CFEOI, or withdraws a previously submitted EOI. |
| E12 | Manage EOI Visibility | Expat sets or updates the visibility of their submitted EOI. |

### 6.3 Admin Use Cases

| # | Use Case | Description |
|---|---|---|
| A1 | CRUD Organisations | Admin manages the hierarchy of organisations within their organisation. |
| A2 | CRUD Sub-Admins | Admin manages administrators for their sub-organisations. |
| A3 | CRUD Staff Users | Admin manages staff accounts and access permissions within their organisation. |

---

## 7. Entity Relationships

```
Root Organisation
└── Organisation(s) [tree structure]
    ├── Admin (manages organisation)
    ├── Staff User(s)
    │   ├── RFP (published by Staff)
    │   └── Manages Proposals → Manages EOIs
    └── ...

Expat User
├── Proposal (submitted under an Organisation, optionally linked to RFP)
│   └── CFEOI (published by proposal owner)
│       └── EOI (submitted by Expat in response to CFEOI)
```

---

## 8. Visibility and Access Rules

| Entity | Private | Shared | Public |
|---|---|---|---|
| Proposal (Ideation) | Visible to owner only | Visible to registered expat users | Visible to all (including unauthenticated) |
| Proposal (Resourcing+) | — | Visible to registered expat users | Visible to all |
| RFP (Published) | — | — | Visible to all registered users |
| CFEOI | Follows parent proposal visibility | — | — |
| EOI | Visible to submitter and relevant staff | — | — |

> Note: Detailed access control rules per role and per proposal status should be refined during the design phase.

---

## 9. Out of Scope

The following are explicitly out of scope for the Herit platform:

- **Project management:** Once a proposal is approved, its conversion into a managed project is handled outside this platform.
- **Payment or financial transactions:** Herit facilitates the expression of financial support but does not process funds.
- **Real-time collaboration tools:** Document co-authoring, chat, or video features are not included.

---

## 10. Open Questions

1. **Authentication:** What identity provider will be used for expat and staff user authentication? Will social login (e.g. Google, LinkedIn) be supported?
2. **Notification system:** Should users receive email or in-app notifications on status changes (e.g., proposal approved, EOI received)?
3. **Proposal co-authorship:** Can multiple expat users be listed as co-authors on a single proposal from the outset, or only via the EOI/CFEOI process?
4. **Visibility defaults:** What is the default visibility for a newly created proposal?
5. **RFP approval workflow:** Is a separate RFP approval step required before a staff user can publish, or can any staff user publish directly?
6. **Localisation:** Does the platform need to support multiple languages?
7. **Moderation:** Is there a content moderation step for proposals and EOIs before they are visible to other users?

---

*End of Document*
