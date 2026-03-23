# ADR-011: Unified Organisation Terminology

**Status:** Accepted
**Date:** 2026-03-23

## Context

The codebase used "Organisation" and "Department" interchangeably to refer to the same underlying entity. There was one domain entity (`Organisation`), one database table (`Organisations`), and one repository (`IOrganisationRepository`) — yet the Application layer contained duplicate, parallel sets of commands and queries (one set prefixed "Organisation", one prefixed "Department") that operated on the exact same entity. The API controller split routes between `/api/v1/Organisation` (no POST) and `/api/v1/Organisation/departments` for what was structurally the same operation.

The PRD defined three overlapping terms (Root Organisation, Department, Organisation) for what is a single entity in the domain model, and the `UserRole` enum used `DepartmentAdmin` while the entity it managed was called `Organisation`.

## Decision

Unify on **"Organisation"** as the sole term in all code identifiers:

- Delete the duplicate Department command/query/handler set from the Application layer.
- Replace the split API controller with a single, flat set of CRUD endpoints under `api/v1/Organisations`.
- Rename the `DepartmentId` property on `Proposal` and `Rfp` to `OrganisationId` (with a corresponding database column rename migration).
- Rename `DepartmentAdmin` to `OrganisationAdmin` in the `UserRole` enum.

The word "department" is reserved for user-facing UI labels and prose documentation describing real-world government structure, not for code identifiers.

Every node in the hierarchy tree is an `Organisation`. The root is an `Organisation` with `ParentId = null`. A child is an `Organisation` with a non-null `ParentId`.

## Consequences

**Positive:**
- One code path per operation. No ambiguity about which command/query to use.
- Simpler API surface — all organisation operations go through the same route prefix.
- New contributors do not need to learn an artificial distinction between "Organisation" and "Department".
- `UserRole` enum values now consistently match the entity they relate to.

**Negative:**
- Requires a database migration (`UnifyOrganisationTerminology`) to rename the `DepartmentId` columns to `OrganisationId` in the `Proposals` and `Rfps` tables. The migration uses `RenameColumn` to preserve existing data.
- External consumers of the API (if any) will see route and field name changes. This is acceptable since the API is not yet public.
