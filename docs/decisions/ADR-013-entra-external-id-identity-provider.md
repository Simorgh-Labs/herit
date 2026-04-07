# ADR-013: Microsoft Entra External ID as the Identity Provider

**Status:** Accepted
**Date:** 2026-03-29

## Context

Herit has two distinct user populations with different identity flows: internal users (Super Admin, Organisation Admin, Staff) who are provisioned top-down by other admins, and expat users who self-register via social login. A single identity provider must serve both flows while issuing standard JWTs that the .NET API can validate.

Azure AD B2C was the original candidate, but Microsoft announced it is no longer available to new customers as of May 1, 2025. The designated successor for consumer-facing identity (CIAM) is **Microsoft Entra External ID**.

## Decision

Use Microsoft Entra External ID as the identity provider.

The authority URL format for Entra External ID is `https://{tenant}.ciamlogin.com/{tenant}.onmicrosoft.com/`. Unlike Azure AD B2C, the user flow / policy name is **not** embedded in the authority URL, which simplifies configuration: a single authority covers all user flows and no per-flow metadata address is required.

## Consequences

**Positive:**
- Social login providers (Google, Apple, Facebook, etc.) are supported out of the box and trivial to add or remove.
- Internal users can be created programmatically via the standard Microsoft Graph API (`https://graph.microsoft.com/v1.0/users`), with Entra External ID handling credential setup and invite emails. Unlike B2C, no separate extension app ID is required — the tenant domain is used directly as the identity issuer, reducing configuration surface.
- Issues standard JWTs validated by `AddJwtBearer` middleware in ASP.NET Core — no custom token handling required.
- Consistent with the existing Azure-hosted infrastructure (App Service, Key Vault, Azure SQL).
- A single token issuer covers all user types.
- Standard Microsoft Graph is used more consistently than in B2C, reducing the complexity of `IIdentityProviderService`.

**Negative:**
- Microsoft Entra External ID adds a cloud dependency that deployers must provision.
- Configuration is more complex than simpler providers, particularly for the internal user invite flow.
