# ADR-020: Identity Separation per Environment/Audience and Local-Account Invitation Flow

**Status:** Proposed
**Date:** 2026-07-20

## Context

ADR-013 adopted Microsoft Entra External ID (CIAM) as the single identity provider. The
current implementation has converged on a topology and a provisioning mechanism that
together break the internal-user onboarding UX:

1. **One CIAM tenant serves everything** — staff and portal audiences, in both local dev
   and Azure prod. Dev experiments hit the same directory as production identities, the
   same email cannot be seeded in both environments, and a misconfigured user flow or bad
   delete affects prod.
2. **The staff app reuses the portal's app registration and user flow.** Internal users
   are therefore presented with the portal's sign-in experience, including the "Sign in
   with Google" option that is only meaningful for self-registering expat users.
3. **Internal users are provisioned via the Microsoft Graph `POST /invitations` API**
   (`EntraExternalIdIdentityProviderService.CreateUserAsync`). This is the Entra **B2B
   guest invitation** primitive. B2B redemption never offers a "set your password" step —
   it federates to the invitee's existing identity provider. Worse, redemption is a
   different mechanism from the CIAM sign-up/sign-in user flow: a Google sign-in through
   the user flow creates a *different* user object (different `oid`) than the invited
   guest object stored as `User.ExternalId`, so the staff app's `/users/me` gate rejects
   the user and bounces them back to sign-in. The observed symptom is an infinite
   redirect loop after clicking "Accept invitation" on a seeded super admin.

The desired UX (see `docs/architecture/auth-strategy.md`): provisioned internal users
receive an invitation email, set their own password, and sign in with email + password;
portal users continue to self-register with Google (ADR-015 JIT provisioning unchanged).

## Decision

1. **One Entra External ID tenant per environment** — a dedicated dev tenant and a
   dedicated prod tenant. No audience-based tenant split: External ID supports
   associating different user flows with different app registrations within one tenant,
   which provides the audience isolation we need without doubling tenant count.
2. **Separate app registrations per audience** in each tenant: one for the Herit API
   (exposes `access_as_user`; holds the Graph application permissions and client
   secret), one SPA registration for the portal app, and one SPA registration for the
   staff app. The staff app stops reusing the portal registration.
3. **Separate user flows per audience**: the portal user flow offers Google (and email)
   sign-up/sign-in; the staff user flow offers **email + password only**, with
   self-service password reset (SSPR) enabled and no social providers.
4. **Replace B2B invitations with local-account provisioning.**
   `IIdentityProviderService.CreateUserAsync` creates a **local account** via Graph
   `POST /users` (`identities` with `signInType: emailAddress`, random
   `passwordProfile`, `forceChangePasswordNextSignIn: true`) instead of
   `POST /invitations`.
5. **The application sends its own invitation email.** Entra does not email credentials
   for programmatically created local accounts. A new `IEmailService` abstraction sends
   the invitation ("your account is ready — sign in and use *Forgot password* to set
   your password"), implemented with Azure Communication Services Email in Azure and a
   log/console (or local SMTP) implementation in Development.
6. **One Google OAuth client per environment** (dev, prod), each registered against the
   corresponding tenant's federation endpoint. Google remains portal-only.

## Consequences

**Positive:**

- Internal onboarding works and matches the intended UX: invite email → set password via
  SSPR → sign in. The seeded `ExternalId` is the object id of the account that actually
  signs in, eliminating the oid-mismatch loop.
- Staff never see social-login options; portal users never see a password-first
  experience tuned for staff.
- Dev and prod identities are fully isolated: destructive testing is safe, the same
  email can exist in both environments, and a leaked dev secret cannot touch prod.
- Blast radius of user-flow or IdP misconfiguration is contained to one environment.
- Each SPA's redirect URIs, token lifetimes, and consented scopes are managed on its own
  registration.

**Negative:**

- Two tenants to provision and maintain; app registrations, user flows, Google
  federation, and secrets configured twice. Mitigated by the existing idempotent setup
  script and `azd`/Key Vault parameterisation.
- A new email-delivery dependency (ACS Email) and sender domain to manage.
- Because External ID user flows are always sign-up-and-sign-in, a stranger could create
  an idle local account through the staff flow. They gain no access — staff are never
  JIT-provisioned (ADR-015) and the DB role gate (ADR-014) denies unknown identities —
  but the directory can accumulate orphan accounts.
- Email uniqueness within a tenant means one address cannot be both a staff local
  account and a portal account in the same environment. Accepted for now; if
  "staff member who is also an expat" becomes a real requirement, revisit with a
  separate staff tenant.

## Supersedes / Amends

Amends ADR-013 (single tenant, shared registration, Entra-sent invite emails — the
claim that External ID handles "credential setup and invite emails" for
programmatically created users proved incorrect for local accounts). ADR-014 (DB role
resolution) and ADR-015 (JIT expat provisioning) are unchanged.
