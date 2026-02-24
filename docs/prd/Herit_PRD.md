# Herit
## *(working product title: DiasporaConnect)*
### Diaspora Talent EOI Platform for the Public Sector
**Product Requirements Document | v1.0**

| | |
|---|---|
| **Code name** | Herit |
| **Working title** | DiasporaConnect |
| **Status** | Draft |
| **Version** | 1.0 |
| **Date** | 23 February 2026 |
| **Audience** | Product, Engineering, Design, Stakeholders |

---

## 1. Purpose

DiasporaConnect is a web application that enables citizens living and working abroad — the diaspora — to offer their expertise, languages, and globally acquired skills in service of their home country's public sector. It provides a structured, searchable channel for volunteers and paid contributors alike to express their interest, and equips government recruiters with the tools to discover and engage the right people.

---

## 2. Problem

Diaspora communities represent a significant but largely untapped resource for governments. Individuals living abroad develop unique skills, multilingual capabilities, international networks, and cross-cultural perspectives that can be directly valuable to the public sector. Many are willing — even eager — to contribute to their home country, but there is no easy or systematic way for them to register that interest, and no efficient way for government to discover and engage them. The connection simply doesn't happen.

---

## 3. Solution Overview

A two-sided web platform serving two user types:

- **Volunteer:** Diaspora volunteers — individuals living abroad who submit an Expression of Interest (EOI) to contribute to their home country's public sector, either voluntarily or on a paid basis.
- **Recruiter:** Government recruiters — public sector staff who search, filter, and report on the EOI database to identify and engage suitable contributors.

The platform captures rich, structured profiles — including skills, languages, country of residence, availability, and compensation preferences — and provides recruiters with powerful query and reporting tools to match the right person to the right opportunity.

---

## 4. User Stories

### 4.1 Diaspora Volunteer

| **ID** | **As a...** | **I want to...** | **So that...** |
|---|---|---|---|
| **V-01** | Volunteer | Register and create a profile with my resume, professional background, and areas of expertise | recruiters can understand what I bring to the table |
| **V-02** | Volunteer | Specify my country of residence and the languages I speak (including proficiency level) | recruiters know my geographic and linguistic context |
| **V-03** | Volunteer | Select the sector(s) I am most interested in contributing to (e.g. health, education, trade, technology) | I am matched to relevant opportunities |
| **V-04** | Volunteer | Indicate my availability (remote/on-site, full-time/part-time, start and end dates) | recruiters know when and how I can engage |
| **V-05** | Volunteer | Specify whether I am offering my time voluntarily or seeking paid engagement | expectations are clear from the outset |
| **V-06** | Volunteer | Optionally submit a specific proposal or idea for how I can contribute | I can proactively go beyond a resume submission |
| **V-07** | Volunteer | Edit or withdraw my EOI at any time | my profile stays accurate and up to date |
| **V-08** | Volunteer | Receive a confirmation when my EOI is submitted | I know my expression of interest was received |

### 4.2 Government Recruiter

| **ID** | **As a...** | **I want to...** | **So that...** |
|---|---|---|---|
| **R-01** | Recruiter | Search the EOI database by skill, sector, language, country of residence, availability, and compensation type | I can quickly surface relevant candidates |
| **R-02** | Recruiter | View a full volunteer profile including resume, languages, and any submitted proposals | I can assess suitability before reaching out |
| **R-03** | Recruiter | Shortlist and save candidates against a specific opportunity or project | I can compare and revisit them easily |
| **R-04** | Recruiter | Run reports on the EOI pool (e.g. by sector, language, country of residence, skill gaps) | I can plan diaspora engagement strategically |
| **R-05** | Recruiter | Export search results to a standard format (CSV/PDF) | I can share findings with my team or management |
| **R-06** | Recruiter | View a dashboard with pool statistics and recent submissions | I have a live overview of available diaspora talent |

---

## 5. Non-Functional Requirements

| **Category** | **Requirement** |
|---|---|
| **Security** | All personal data must be encrypted at rest and in transit (TLS 1.2+). Role-based access control (RBAC) must strictly separate volunteer and recruiter capabilities. Recruiter access requires authenticated government credentials. |
| **Privacy** | The platform must comply with applicable privacy legislation in both the home country and, where feasible, major countries of volunteer residence (e.g. GDPR for EU-based diaspora). Volunteers must provide informed consent for how their data is stored and used, and must have the right to request deletion. |
| **Performance** | Search queries must return results within 2 seconds under normal load. The platform must support up to 10,000 active EOI profiles without degradation. |
| **Availability** | Target uptime of 99.5% excluding scheduled maintenance. Maintenance windows should occur outside business hours (home country time zone). |
| **Accessibility** | The public-facing volunteer portal must meet WCAG 2.1 AA accessibility standards. |
| **Internationalisation** | The volunteer-facing interface should support multiple languages to lower the barrier for diaspora members who primarily operate in their country of residence language. |
| **Scalability** | The architecture must support horizontal scaling to accommodate growth in users and submission volume. |
| **Auditability** | All recruiter search and profile access activity must be logged for compliance and accountability purposes. |
| **Browser Support** | Must support the latest two versions of Chrome, Edge, Firefox, and Safari on desktop. Mobile-responsive layout is required, given the global and varied device contexts of diaspora users. |

---

## 6. Out of Scope (v1)

The following are explicitly deferred to keep the initial scope focused:

- In-platform messaging between recruiter and volunteer
- AI-driven automatic matching or ranking of volunteers to opportunities
- Integration with existing government HR or payroll systems
- Full multi-language UI (internationalisation noted as an NFR to be scoped in detail)
- Mobile native apps (iOS / Android)
- Verification of volunteer credentials or professional qualifications

---

## 7. Open Questions

- Who verifies government recruiter identity — the platform itself, or an external identity provider (e.g. government SSO)?
- Are volunteer profiles visible only to authenticated recruiters, or is there a public-facing directory?
- What is the data retention policy for inactive or withdrawn EOIs, particularly given cross-border privacy obligations?
- Is there a moderation or approval step before a volunteer profile becomes visible to recruiters?
- Which home country privacy legislation applies, and does the platform need to address GDPR or equivalent frameworks for diaspora in the EU or other jurisdictions?
- Will the platform support multiple home countries, or is it scoped to a single government?
