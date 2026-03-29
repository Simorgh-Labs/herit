# ADR-013: Azure AD B2C as the Identity Provider

**Status:** Accepted
**Date:** 2026-03-29

## Context

Herit has two distinct user populations with different identity flows: internal users (Super Admin, Organisation Admin, Staff) who are provisioned top-down by other admins, and expat users who self-register via social login. A single identity provider must serve both flows while issuing standard JWTs that the .NET API can validate.

## Decision

Use Azure AD B2C as the identity provider.

## Consequences

**Positive:**
- Social login providers (Google, Apple, Facebook, etc.) are supported out of the box and trivial to add or remove.
- Internal users can be created programmatically via the Microsoft Graph API, with B2C handling credential setup and invite emails.
- Issues standard JWTs validated by `AddJwtBearer` middleware in ASP.NET Core — no custom token handling required.
- Consistent with the existing Azure-hosted infrastructure (App Service, Key Vault, Azure SQL).
- A single token issuer covers all user types.

**Negative:**
- Azure AD B2C adds a cloud dependency that deployers must provision.
- Configuration is more complex than simpler providers, particularly for the internal user invite flow.
