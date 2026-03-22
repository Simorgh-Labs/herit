# ADR-004: EOI Always Requires a CFEOI

**Status:** Accepted
**Date:** 2026-03-22

## Context

An Expression of Interest (EOI) represents a user's intent to contribute to a proposal. The question was whether EOIs could be submitted directly against a Proposal, or whether they must always be submitted in response to an explicit Call For Expression of Interest (CFEOI) published under that Proposal.

An earlier design allowed EOIs to reference a Proposal directly. This was revised after recognising that unstructured, unsolicited EOIs make it difficult for staff to manage contributor intake and resource matching.

## Decision

**An EOI must always reference a CFEOI.** There is no direct relationship from EOI to Proposal.

- The `Eoi` entity has a non-nullable `CfeoiId` foreign key.
- The `Cfeoi` entity has a non-nullable `ProposalId` foreign key.
- Traversing from EOI to its Proposal is done via the CFEOI: `Eoi → Cfeoi → Proposal`.
- The direct `ProposalId` column on `Eoi` that existed in an earlier schema has been removed.

This means a Proposal must have at least one published CFEOI before it can receive any EOIs.

## Consequences

**Positive:**
- Staff explicitly control when and what type of contributors they are recruiting (CFEOI specifies `ResourceType`: Human or NonHuman).
- EOIs are grouped by call, making it easy to compare candidates within the same recruitment round.
- The domain model enforces the intent at the database level — there is no ambiguous nullable FK.

**Negative:**
- Slightly more steps to submit an EOI — a CFEOI must exist first.
- Queries that aggregate EOIs across a Proposal must join through CFEOI.
