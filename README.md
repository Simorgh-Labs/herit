# Herit

A web platform that connects diaspora talent with public sector opportunities in their home country — enabling governments to discover, engage, and mobilise skilled citizens living abroad.

---

## Overview

Herit is a two-sided platform serving two user types:

- **Diaspora Volunteers** — individuals living abroad who submit an Expression of Interest (EOI) to contribute their skills, languages, and experience to their home country's public sector, either voluntarily or on a paid basis.
- **Government Recruiters** — public sector staff who search, filter, and report on the EOI database to identify and engage suitable contributors.

The platform captures rich, structured volunteer profiles — including skills, languages, country of residence, availability, and compensation preferences — and provides recruiters with powerful search, shortlisting, and reporting tools.

---

## Status

| | |
|---|---|
| **Version** | 1.0 (Draft) |
| **Stage** | Pre-development |
| **Last updated** | February 2026 |

---

## Documentation

| Document | Description |
|---|---|
| [`docs/prd/Herit_PRD.md`](docs/prd/Herit_PRD.md) | Full Product Requirements Document |
| `docs/architecture/` | Architecture design documents *(coming soon)* |
| `docs/decisions/` | Architecture Decision Records (ADRs) *(coming soon)* |

---

## Key Features

**For Volunteers**
- Register and create a structured profile with resume, skills, and areas of expertise
- Specify languages, country of residence, availability, and compensation preferences
- Submit proposals or ideas for contribution
- Edit or withdraw EOI at any time

**For Recruiters**
- Search the EOI database by skill, sector, language, country, availability, and compensation type
- View full volunteer profiles including resumes and submitted proposals
- Shortlist and save candidates against specific opportunities
- Run reports and export results (CSV/PDF)
- Dashboard with live pool statistics and recent submissions

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | .NET 8 / ASP.NET Core |
| **Frontend** | TBD |
| **Database** | TBD |
| **Cloud** | Microsoft Azure |
| **IaC** | Bicep |
| **CI/CD** | GitHub Actions |

---

## Repository Structure

```
/docs
  /prd                  ← Product Requirements Documents
  /architecture         ← Architecture and design documents
  /decisions            ← Architecture Decision Records (ADRs)
/src                    ← Application source code
/infra                  ← Azure infrastructure (Bicep)
/.github
  /workflows            ← GitHub Actions CI/CD pipelines
  /ISSUE_TEMPLATE       ← Issue templates
CONTRIBUTING.md
README.md
```

---

## Getting Started

> Setup instructions will be added once the development environment is established.

---

## Contributing

This is an open-source project. Contribution guidelines will be published in [`CONTRIBUTING.md`](CONTRIBUTING.md) prior to the first development milestone.

To report a bug or request a feature, please [open an issue](../../issues/new/choose).

---

## Open Questions

Several key decisions are still open and under discussion — see [Section 7 of the PRD](docs/prd/Herit_PRD.md#7-open-questions) for details. These include:

- How government recruiter identity is verified
- Whether volunteer profiles are publicly visible or restricted to authenticated recruiters
- Data retention policy for inactive or withdrawn EOIs
- Whether the platform will support a single home country or multiple governments

---

## License

TBD
