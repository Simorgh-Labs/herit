# ADR-014: Role Resolution via Database Lookup

**Status:** Accepted
**Date:** 2026-03-29

## Context

Azure AD B2C handles authentication (who you are), but the application needs to enforce authorisation (what you can do) based on the `UserRole` assigned to each user. There are two options: (A) store the role as a custom attribute in B2C so it is included in the JWT, or (B) store the role exclusively in the Herit database and resolve it on each request by looking up the `User` record using the B2C subject ID from the token.

## Decision

Use Option B — roles are stored in the Herit database and resolved per request. The B2C token carries only standard claims (subject ID, email, name). On each authenticated request, the API extracts the subject ID from the token and looks up the corresponding `User` record to determine the caller's role and organisation.

## Consequences

**Positive:**
- Role management stays entirely within the application's control — no split between B2C configuration and the database.
- Role changes (e.g. promoting a user, revoking access) take effect immediately without touching B2C.
- The identity provider is kept responsible for identity only, consistent with Clean Architecture (ADR-001).
- Swapping the identity provider in the future requires only changing what field is used to look up the `User` record, not restructuring role management.

**Negative:**
- Every authenticated request requires a database lookup to resolve the caller's role. This can be mitigated with short-lived in-memory caching if it becomes a performance concern.

**Implementation note:** The `User` entity requires a new `ExternalId` field (the B2C object ID / subject claim) to link the Herit `User` record to the B2C identity. This requires a database migration.
