# Contributing to Herit

Thank you for your interest in contributing to DiasporaConnect. This document outlines how to get involved, report issues, and submit changes.

---

## Code of Conduct

We are committed to maintaining a welcoming and respectful environment for everyone. By participating in this project, you agree to the following:

- Be respectful and constructive in all interactions
- Welcome differing viewpoints and experiences
- Accept feedback graciously and offer it kindly
- Focus on what is best for the project and its users

Behaviour that is harassing, discriminatory, or otherwise harmful will not be tolerated. If you experience or witness unacceptable behaviour, please raise it with the project maintainers.

---

## How to Report a Bug

1. Check the [existing issues](../../issues) to see if it has already been reported.
2. If not, [open a new issue](../../issues/new) and include:
   - A clear, descriptive title
   - Steps to reproduce the problem
   - What you expected to happen vs. what actually happened
   - Your browser, OS, and any relevant environment details

---

## How to Request a Feature

1. Check the [existing issues](../../issues) to see if it has already been proposed.
2. If not, [open a new issue](../../issues/new) and describe:
   - The problem you are trying to solve
   - Your proposed solution or idea
   - Any alternatives you have considered

Feature requests are reviewed by the maintainers and prioritised against the product roadmap.

---

## How to Submit a Code Change

We use **GitHub Flow**. All changes are made on a feature branch and submitted via pull request against `main`.

### 1. Branch

Create a branch from `main` using a short, descriptive name:

```
git checkout main
git pull
git checkout -b feature/your-feature-name
```

Use the following prefixes to indicate the type of change:

| Prefix | Use for |
|---|---|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `docs/` | Documentation updates |
| `chore/` | Maintenance, dependencies, tooling |

### 2. Make Your Changes

- Keep changes focused — one concern per PR where possible
- Write or update tests to cover your changes
- Run the test suite locally before pushing (`dotnet test`)
- Follow the existing code style (the project uses `dotnet format`)

### 3. Commit

Write clear, descriptive commit messages in the imperative mood:

```
Add search filter for language proficiency
Fix pagination bug on recruiter dashboard
Update README with setup instructions
```

### 4. Open a Pull Request

- Push your branch and open a PR against `main`
- Fill in the PR template (title, description, linked issue if applicable)
- A maintainer will review your PR and may request changes before merging
- Do not merge your own PR without a review from at least one other team member

---

## Development Setup

> Detailed local setup instructions will be added once the development environment is established. Check back here or watch the repository for updates.

---

## Questions?

If you are unsure about anything, open an issue and ask. We would rather you ask upfront than spend time on something that does not align with the project direction.
