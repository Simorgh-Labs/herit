# ADR-015: Just-In-Time Provisioning for Expat Users

**Status:** Accepted
**Date:** 2026-03-29

## Context

Expat users authenticate via social login (Google, and later others) through Azure AD B2C. A decision is needed on how their `User` record is created in the Herit database: either via an explicit registration endpoint that runs after the first B2C login, or automatically on the first authenticated API request.

## Decision

Use just-in-time (JIT) provisioning. There is no separate registration endpoint for expat users. On the first authenticated request from a B2C subject ID that has no corresponding `User` record in the database, the API automatically creates a `User` record with `Role = Expat`, deriving `Email` and `FullName` from the JWT claims. Subsequent requests find the existing record and proceed normally.

## Consequences

**Positive:**
- No separate registration step or endpoint required — first login is registration.
- Simpler frontend flow: social login leads directly into the application.
- No risk of orphaned B2C accounts with no corresponding `User` record.

**Negative:**
- The first request from a new expat user incurs an extra write operation (user creation) in addition to the role-resolution read. This is negligible in practice.
- Care must be taken to make the JIT creation idempotent to handle concurrent first requests from the same user (e.g. use `INSERT IF NOT EXISTS` semantics or handle unique constraint violations gracefully).
