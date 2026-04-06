# ADR-016: Frontend Tech Stack

**Status:** Accepted
**Date:** 2026-04-06

## Context

ADR-009 established React as the frontend framework and defined two separate SPAs — `frontend/portal` (expat-facing) and `frontend/staff` (internal staff and admin). This ADR records the library and tooling decisions made for both applications before scaffolding begins.

The following decisions were needed:

- **Build tool** — how to compile, bundle, and serve the React apps.
- **Routing** — how client-side navigation is handled.
- **Server state management** — how API data is fetched, cached, and kept fresh.
- **Component and styling library** — how UI components are built and styled.
- **Authentication client** — how the frontend integrates with Azure AD B2C.
- **API client** — how HTTP requests are made to `Herit.Api`.
- **Testing** — how unit and integration tests are written and run.

## Decision

Both `frontend/portal` and `frontend/staff` use the following stack:

| Concern | Library / Tool | Version |
|---|---|---|
| Build tool | Vite | Latest |
| Routing | React Router | v6 |
| Server state | TanStack Query (React Query) | v5 |
| Styling | Tailwind CSS | v3 |
| Component library | shadcn/ui | Latest |
| Auth client | MSAL React (`@azure/msal-react`) | Latest |
| API client | Axios | Latest |
| Testing | Vitest + React Testing Library | Latest |

The two apps are scaffolded as independent Vite projects with no shared codebase. They share the same stack and visual design language but are developed, built, and deployed independently.

### Key rationale

**Vite over Create React App or Next.js** — CRA is deprecated. Next.js is a full-stack framework optimised for server-side rendering, which is unnecessary for two SPAs that communicate exclusively with a REST API. Vite provides fast builds and instant HMR with minimal configuration.

**React Router v6 over TanStack Router** — React Router v6 with `createBrowserRouter` is the established standard with broad ecosystem support. TanStack Router offers stronger type safety but is less mature. The route structure for both apps is well understood from the user flows documents and does not require TanStack Router's advanced features.

**TanStack Query over Redux Toolkit Query or SWR** — The API is a REST interface with standard CRUD and status-transition operations. TanStack Query handles loading, error, caching, and background-refresh states with minimal boilerplate. Its `select` option enables client-side filtering of list responses, which is needed as an interim measure until server-side filtering query parameters are added to the list endpoints (`GET /api/v1/Proposals`, `GET /api/v1/Rfps`, `GET /api/v1/Cfeoi`).

**Tailwind CSS + shadcn/ui over MUI or Ant Design** — MUI and Ant Design impose opinionated design systems that would require significant overriding to match the intended UI. shadcn/ui provides accessible, unstyled components that are copied directly into the project and styled with Tailwind, giving full control over appearance. Tailwind is also the styling system used in the UX Pilot HTML design exports, which are the source designs for the portal, making design-to-code translation direct.

**MSAL React** — The official Microsoft library for Azure AD B2C integration in React. Required for the Google OAuth redirect flow, silent token refresh, and Bearer token retrieval. See ADR-013.

**Axios over fetch** — Axios enables a single centrally configured instance with a request interceptor that attaches the Bearer token from MSAL to every outbound request, eliminating per-request auth boilerplate when used with TanStack Query.

**Vitest over Jest** — Vitest shares Vite's configuration and transform pipeline, eliminating the need for a separate Jest config. It runs significantly faster than Jest for the same test suite.

## Consequences

**Positive:**
- Vite's dev server and HMR significantly reduce the inner development loop compared to CRA or Webpack-based setups.
- TanStack Query eliminates manual loading/error state management, which would otherwise be repeated across every screen that fetches API data.
- Tailwind + shadcn/ui makes design-to-code translation straightforward, particularly given that the source HTML designs are already written in Tailwind.
- MSAL React integrates cleanly with the Azure AD B2C flows defined in ADR-013, ADR-014, and ADR-015.
- A shared stack across both apps reduces context-switching and means tooling knowledge transfers directly.

**Negative:**
- shadcn/ui components are copied into the project rather than installed as a versioned package dependency. Keeping components up to date with upstream changes requires manual effort.
- Tailwind's utility-class approach produces verbose JSX; this is a readability tradeoff accepted in exchange for styling flexibility and AI-assisted development compatibility.
- Two separate Vite projects means duplicated config and dependency management. A monorepo tool (e.g. Turborepo) could reduce this overhead if the number of shared concerns grows, but is deferred until there is clear justification.
- MSAL React adds complexity to the authentication flow for the Portal, which also needs to support unauthenticated browsing. This requires careful use of MSAL's `MsalAuthenticationTemplate` and unprotected route patterns to avoid forcing login on public pages.
