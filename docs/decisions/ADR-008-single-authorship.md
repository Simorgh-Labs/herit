# ADR-008: Single Author per Proposal and RFP

**Status:** Accepted
**Date:** 2026-03-22

## Context

Proposals and RFPs need an ownership model. The options were:
- **Single author** — one `AuthorId` (User Guid) on the entity.
- **Multi-author / team** — a join table linking multiple users to a proposal as contributors or owners.

## Decision

Both `Proposal` and `Rfp` carry a single `AuthorId` property (a `Guid` referencing a `User`). There is no join table for co-authorship.

Authorship represents the creating user and primary owner of the document. Collaboration on a proposal is expected to occur via the CFEOI/EOI workflow, where contributors are recruited through explicit calls — not via shared authorship on the Proposal entity itself.

## Consequences

**Positive:**
- Simple ownership model; no join table or permission matrix to maintain.
- Queries for "proposals owned by user X" are a single column filter.
- Aligns with the domain intent: a Proposal or RFP has one accountable author.

**Negative:**
- If co-authorship is required in future, this will need a schema change and migration.
- Transferring authorship (e.g., when staff changes roles) requires an update to `AuthorId`.
