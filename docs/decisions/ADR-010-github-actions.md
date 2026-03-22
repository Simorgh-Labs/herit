# ADR-010: GitHub Actions for CI/CD

**Status:** Accepted
**Date:** 2026-03-22

## Context

Herit is hosted on GitHub and deployed to Azure. We needed a CI/CD pipeline that could build, test, and deploy the application automatically on changes to `main`.

Alternatives considered:
- **Azure DevOps Pipelines** — native Azure integration, but introduces a second platform for a project already hosted on GitHub.
- **CircleCI / Jenkins** — third-party tooling with additional configuration overhead.
- **GitHub Actions** — natively integrated with GitHub, supports OpenID Connect for keyless Azure authentication.

## Decision

We use **GitHub Actions** for all CI and CD workflows, defined in `.github/workflows/azure-dev.yml`.

The pipeline has two stages:

1. **CI** (runs on every trigger):
   - Checkout code
   - Set up .NET 10.x
   - Build in Release configuration
   - Run tests in Release configuration

2. **CD** (runs only after CI passes, on pushes to `main`/`master` or manual dispatch):
   - Azure login via OpenID Connect (federated credentials); falls back to client secret
   - Infrastructure provisioning: `azd provision`
   - Application deployment: `azd deploy`

**Path ignores:** Pushes that only modify `docs/**`, `README.md`, `CONTRIBUTING.md`, or `assets/**` do not trigger the pipeline.

## Consequences

**Positive:**
- No additional platform — CI/CD lives alongside the code in the same repository.
- OpenID Connect authentication to Azure avoids long-lived secrets in GitHub.
- Path-ignore rules prevent unnecessary pipeline runs on documentation changes.
- Azure Developer CLI (`azd`) provides a consistent interface for both local and CI provisioning.

**Negative:**
- GitHub Actions has usage limits on free/team plans; large test suites may incur costs.
- `azd provision` on every CD run may cause drift issues if infrastructure is also modified manually in the Azure portal.
