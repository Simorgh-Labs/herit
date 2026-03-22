# ADR-007: Enums Stored as Integers

**Status:** Accepted
**Date:** 2026-03-22

## Context

EF Core can store enum values as either their underlying integer or as a string representation. Options were:
- **Integer** — compact, fast for comparisons, but opaque when reading the database directly.
- **String** — human-readable in the database, but larger storage and case-sensitive equality issues.

## Decision

All enums are stored as **integers** using `HasConversion<int>()` in each entity's Fluent API configuration.

Affected enums:
- `UserRole` (SuperAdmin, DepartmentAdmin, Staff, Expat)
- `ProposalStatus` (Ideation, Resourcing, Submitted, UnderReview, Approved)
- `ProposalVisibility` (Private, Shared, Public)
- `RfpStatus` (Draft, Approved, Published)
- `CfeoiStatus` (Open, Closed)
- `CfeoiResourceType` (Human, NonHuman)
- `EoiStatus` (Pending, Approved, Rejected)
- `EoiVisibility` (Private, Shared)

## Consequences

**Positive:**
- Smaller storage footprint and faster indexed lookups than string columns.
- Consistent across all enum types in the project.
- Default .NET enum-to-int mapping means the database values are predictable.

**Negative:**
- Reading the database directly (e.g., in a migration dry-run or ad-hoc query) requires knowing the mapping.
- Inserting integer values between existing members will silently shift semantics — enum members must never be reordered or renumbered once data exists.

**Mitigation:** New enum members must always be appended at the end. Removing or reordering existing members requires a data migration.
