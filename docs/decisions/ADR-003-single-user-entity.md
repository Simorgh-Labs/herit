# ADR-003: Single User Entity with Role Enum

**Status:** Accepted
**Date:** 2026-03-22

## Context

Herit has four distinct user types — SuperAdmin, OrganisationAdmin, Staff, and Expat — with different permissions and workflows. A common alternative is to model each type as a separate entity (table-per-type or separate tables). We needed to decide how to represent user identity in the domain.

## Decision

All users are represented by a **single `User` entity** with a `Role` enum property (`UserRole`). There are no separate `Admin`, `Staff`, or `Expat` tables.

The four roles are:
- `SuperAdmin` — platform-wide administration
- `OrganisationAdmin` — manages a specific organisation
- `Staff` — creates and manages proposals and RFPs
- `Expat` — submits expressions of interest

Role-based behaviour is enforced in application-layer handlers and (when implemented) via authorisation policies, not via entity polymorphism.

## Consequences

**Positive:**
- A single users table simplifies queries that operate across roles (e.g., looking up any user by ID).
- Adding a new role is a one-line enum change with no schema migration beyond updating the role column.
- Authentication systems that issue a single identity token per user map naturally to a single entity.

**Negative:**
- Role-specific profile data (if any is added later) must either live in the `User` table as nullable columns or be extracted to separate profile tables with a foreign key.
- The domain model does not prevent a `User` from being assigned to workflows inappropriate for their role at compile time — this is enforced by application logic instead.
