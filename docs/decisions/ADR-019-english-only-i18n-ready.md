# ADR-019: English-Only, No i18n Investment

**Status:** Accepted (revised 2026-07-16; originally accepted the same day as "English-only launch, i18n-ready staff app")
**Date:** 2026-07-16

## Context

PRD §10 left open whether the platform needs to support multiple languages. The expat portal has been built English-only with hardcoded strings. The original version of this ADR required the staff app to externalize all user-facing strings from day one as cheap insurance against an expensive future retrofit.

On review, two factors changed the assessment. First, consistency: an i18n-ready staff app beside a hardcoded portal imposes per-PR string-key discipline on the staff app while leaving the app most exposed to language needs (the portal) untranslatable anyway — the insurance only pays out if the whole product follows. Second, the retrofit-cost premise: the project is delivered through an agent-driven workflow, and externalizing strings across a codebase is a mechanical, verifiable, wide-but-shallow task well suited to a single agent-executed pass. The disaster being insured against is far cheaper to fix on demand than the folk wisdom assumes.

## Decision

**English-only across both applications, with no i18n investment.** Strings are written inline in both the portal and the staff app; no string-externalization framework is adopted; no i18n requirement appears in any definition of done.

If a second language becomes a real requirement, the response is a dedicated, agent-executed externalization pass across both apps (framework adoption + string extraction + locale files), scoped as ordinary issues at that time.

## Consequences

- The staff app is built with the same string conventions as the portal — no divergence between the two frontends.
- No translation workflow, locale switching, or RTL work exists or is prepared for.
- A future second-language requirement triggers a retrofit of both apps at once; this is accepted as the cheaper expected cost versus paying externalization discipline on every change from now on.
