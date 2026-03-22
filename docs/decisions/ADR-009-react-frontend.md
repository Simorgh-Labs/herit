# ADR-009: React Frontend

**Status:** Accepted
**Date:** 2026-03-22

## Context

Herit requires a web-based UI for government staff, department admins, and expats to interact with proposals, RFPs, CFEOIs, and EOIs. The backend exposes a REST API via ASP.NET Core. We needed to select a frontend framework.

Alternatives considered:
- **Razor Pages / Blazor Server** — tighter integration with .NET, but couples the frontend deployment to the ASP.NET Core host and limits JavaScript ecosystem options.
- **Blazor WebAssembly** — .NET in the browser; smaller ecosystem than JavaScript frameworks for UI components.
- **Vue / Angular** — viable alternatives; React chosen for ecosystem breadth and team familiarity.

## Decision

The frontend is built with **React**.

- React communicates with the backend via the REST API.
- The frontend is a separate project, independently deployable.
- The split boundary makes it possible to evolve the UI without touching backend infrastructure.

## Consequences

**Positive:**
- Large ecosystem of component libraries, tooling, and community resources.
- Clear separation between frontend and backend — API contract is the sole coupling point.
- Frontend can be deployed to Azure Static Web Apps independently of the API.

**Negative:**
- Two separate codebases to maintain.
- Type safety across the API boundary requires additional tooling (e.g., OpenAPI code generation) to keep DTOs in sync.
- Not yet implemented — this ADR records the decision for when frontend work begins.
