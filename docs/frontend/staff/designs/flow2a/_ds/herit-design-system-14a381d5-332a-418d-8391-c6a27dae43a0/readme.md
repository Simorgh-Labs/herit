# Herit Design System

**Herit** is a civic platform ("Expat / Herit Portal") connecting diaspora professionals with
government Requests for Proposals (RFPs), community-submitted Proposals, and volunteer/expert
roles published as **CFEOIs** (Calls for Expression of Interest). Users sign in with Google,
browse public RFPs and proposals, create their own proposals, move them through a
Ideation → Resourcing → Submitted → Under Review → Approved/Withdrawn lifecycle, publish CFEOIs
under a proposal to recruit contributors, and submit/withdraw Expressions of Interest (EOIs) on
those CFEOIs.

There is one product surface today: the **Herit Portal** (public + authenticated web app).

## Sources

- `frontend/portal/user-flows-high-level.md` — the authoritative user-flow / data-model spec
  (proposal & CFEOI & EOI lifecycles, visibility rules, API endpoints).
- `frontend/portal/designs/flow1` … `flow3e/` — ~30 static HTML/Tailwind mockups covering
  unauthenticated browsing, auth, proposal creation/lifecycle, CFEOI publishing, EOI inbox, and
  contributor EOI flows. These are AI-generated (uxpilot) visual mockups, not a shipped
  production codebase — no live app source, Figma file, or component library was attached.
  `flow3c/` and `flow3b/07` are called out in `flow3e-design-brief.md` as the corrected,
  canonical reference for tokens and modal patterns; this design system follows their palette.
- `frontend/portal/designs/flow3c-implementation-tasks.md`,
  `flow3c-review-tasks.md`, `flow3d-3e-implementation-tasks.md`, `flow3e-design-brief.md` —
  supporting planning docs with data-model constraints (exact field lists, enum values).

No Figma link, GitHub repo, or running codebase was provided — everything here is reverse
derived from the static mockup HTML.

## Content fundamentals

- **Voice**: plain, procedural, civic-institutional. Copy states what a screen does and what a
  status means ("This action will remove the proposal from active review and resourcing. It
  will be kept as a historical record, but cannot be reactivated.") rather than selling or
  hyping. Minimal marketing gloss even on the public landing page.
- **Person**: second person for instructions and empty states ("You haven't submitted any
  proposals. Start by browsing active RFPs or create a new proposal from scratch."); first
  person plural only in trust/privacy copy ("We do not post on your behalf.").
- **Casing**: sentence case for body copy and button labels ("Continue with Google", "Withdraw
  proposal?"). Title Case only for nav labels and section headings ("Browse RFPs", "My
  Proposals", "How Herit Works").
- **Terminology is exact and enum-locked**: use the literal domain terms — Proposal, CFEOI,
  EOI, RFP — and their literal status values (`Ideation`, `Resourcing`, `Submitted`,
  `Under Review`, `Approved`, `Withdrawn`; `Open`/`Closed`; `Pending`/`Approved`/`Rejected`;
  `Public`/`Shared`/`Private`). Never invent a "Draft" state or a "Public/Hidden" visibility —
  the backend enums are the vocabulary; don't paraphrase them.
- **Confirmations are explicit about permanence.** Destructive actions always say plainly
  whether something is reversible: "permanently deleted," "cannot be reactivated," "this
  action is permanent and cannot be undone."
- **No emoji anywhere.** Icons (Font Awesome) carry visual meaning instead.
- **Future features are labelled, not hidden.** Anything not yet backed by infrastructure
  (email notifications) appears as a visible "Future:" placeholder rather than being silently
  omitted or half-built.
- **Numbers read like real product metrics**, not vague marketing stats: "1,204 Active RFPs,"
  "3.2k Volunteer Roles" — concrete counts, comma-formatted at scale.

## Visual foundations

- **Palette**: one brand blue ramp used everywhere — `#1D4ED8` (primary, on the authenticated
  app and buttons) and `#1E40AF` (primary-hover, and the primary text/CTA color on white
  marketing pages). No secondary brand hue. Neutrals are a cool gray/slate scale
  (`#111827` text, `#6B7280` muted text, `#E5E7EB` borders, `#F9FAFB` page background, white
  cards). Status color is the only place saturated hues beyond blue appear: amber, orange,
  green, red — always as a light-tint background + darker-tint text pair (never solid fill),
  e.g. Approved = `#D1FAE5` bg / `#047857` text.
- **Type**: Inter only, weights 400–700, no serif or display face. Headings are bold + tight
  tracking; body copy is regular weight, relaxed line-height, gray-600 for secondary text.
  Marketing hero type runs very large (48–72px); app UI type is conservative (14–24px).
- **Spacing**: 4px-based scale (Tailwind default steps). Generous section padding on marketing
  pages (80–96px vertical), tighter but still airy padding in app panels (24–32px).
- **Backgrounds**: flat solid colors only — no photography, no hand-drawn illustration, no
  repeating pattern/texture. The only "decoration" is a very low-opacity (3–10%) oversized
  Font Awesome glyph bleeding off a panel edge, or a soft blurred color blob behind a stat
  widget. No gradients on surfaces except two narrow uses: a subtle radial glow behind the dark
  marketing sign-in CTA panel, and default browser `bg-gradient` utility classes on connecting
  lines/dividers.
- **Animation**: none beyond CSS `transition-colors`/`transition-shadow` on hover/focus
  (120–300ms, standard ease). No entrance animations, no bounce/spring, no scroll effects. A
  single drawer slide-in (EOI detail panel) is the only transform-based motion in the source.
- **Hover states**: buttons darken one step (primary → primary-hover) or gain a light tint fill
  (ghost/ outline buttons go from transparent to a 5–10% brand tint); cards gain a stronger
  shadow (`shadow-nav` → `shadow-card`), never a border-color or scale change.
- **Press/active states**: not distinctly styled in the source mockups (static HTML); assume
  the hover treatment plus a slight opacity dip if a pressed state is needed.
- **Borders**: 1px, `#E5E7EB`, used on virtually every card/input/panel — this is the dominant
  way surfaces are separated (borders, not shadows, do most of the work). Shadows are soft and
  secondary (`shadow-nav`/`shadow-soft`/`shadow-card`), never dark or heavy; no inner shadows
  anywhere in the source.
- **Corner radii**: buttons and inputs `8px` (app) or fully round pill (marketing CTAs and the
  public-page nav); cards/panels `12px`; modals, the dashboard welcome banner, and the dark
  marketing CTA panel `16–24px`; avatars, badges, and small chips fully round.
- **Cards**: white background, 1px gray border, 12px radius, soft shadow that intensifies on
  hover — never a colored left-border accent, never a gradient fill.
- **Transparency/blur**: used exactly twice in the source — the sticky header
  (`bg-white/80` + `backdrop-blur`) and modal backdrops (`bg-gray-900/40` +
  `backdrop-blur-sm`). Not used decoratively elsewhere.
- **Imagery**: none is real/bundled. Mockups hotlink to a third-party demo avatar bucket
  (`storage.googleapis.com/uxpilot-auth...`) for placeholder headshots — not brand assets, and
  not copied into this system. Where a photo would go, this system uses the `Avatar` initials
  fallback instead. **No logo file exists in the source.** The mockups' own convention for a
  "mark" is either a Font Awesome globe glyph + "Herit" wordmark (public pages) or a solid
  blue rounded-square "H" + "Herit" wordmark (authenticated app) — both are treated here as
  established in-house wordmark patterns, not a designed logo, and are not to be mistaken for
  one. If a real logo exists, please attach it.

## Iconography

- **System**: Font Awesome 6 (Free), solid + regular + brands styles, loaded from the cdnjs
  CDN in every mockup. No custom icon font, no SVG sprite sheet, no PNG icon set exists in the
  source — this is a CDN dependency, not a bundled asset, so it's flagged here as a
  substitution risk (see Caveats below) even though it matches the source exactly.
- **No emoji, no unicode glyphs used as icons.**
- Icons are used generously but functionally: building/org type, calendar/deadline, location
  pin, search, chevrons for disclosure/breadcrumbs/pagination, lock for auth-gated actions,
  file/document for proposals, handshake for EOIs/volunteering, brand `fa-google` for the
  sign-in button.
- Usage in this system: components reference icons as `<i className="fa-solid fa-...">`
  children passed in by the consumer (Button `icon` prop, Badge `icon` prop) rather than
  baking icon choices into the primitives — pages using these components must load the Font
  Awesome CDN stylesheet themselves (see any component card's `<head>` for the exact tag).

## Index

```
styles.css              — root stylesheet; @imports every token file below
tokens/
  colors.css            — brand ramp, neutrals, status bg/text pairs, semantic aliases
  typography.css         — font stack, weights, type scale, tracking/leading
  spacing.css            — spacing scale, radii, shadows, motion tokens
  fonts.css              — Inter loaded via Google Fonts @import (see Caveats)
components/
  forms/                 — Button, Input, Textarea, Select, Checkbox, Radio
  feedback/              — Badge, Banner, Modal, EmptyState
  data-display/          — Avatar, Card, StatCard
  navigation/             — Breadcrumb, Pagination, AppHeader, PublicHeader
ui_kits/
  portal/                 — Herit Portal: 5 click-through screens (landing, sign-in,
                             dashboard, my proposals, CFEOI directory)
guidelines/               — foundation specimen cards (Design System tab: Colors, Type,
                             Spacing, Brand groups)
SKILL.md                  — Claude Code / Agent Skill wrapper for this system
```

### Components (17)

Forms: `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`
Feedback: `Badge`, `Banner`, `Modal`, `EmptyState`
Data display: `Avatar`, `Card`, `StatCard`
Navigation: `Breadcrumb`, `Pagination`, `AppHeader`, `PublicHeader`

### Intentional additions

No component inventory was defined by a Figma file or component library in the source — only
full-page mockups. The 17 components above were extracted as the recurring primitives those
pages are built from (buttons, status pills, form fields, cards, headers, etc.) — a standard
set sized to what the mockups actually use, per the design-system authoring rules for
brand-guidelines-only sources.

## Caveats — please help me get this right

1. **No logo file.** I did not draw one — the wordmark/glyph pairing in the mockups is used
   as-is, not invented. If Herit has a real logo, attach it and I'll swap it in everywhere.
2. **No font files.** Inter is loaded from Google Fonts CDN (`tokens/fonts.css`) since no
   `.woff2`/`.ttf` binaries were in the source. If you have licensed font files, send them and
   I'll self-host proper `@font-face` rules.
3. **No icon assets to copy.** The mockups depend on the Font Awesome CDN; I kept that
   dependency rather than fabricating hand-drawn SVGs. If Herit has its own icon set, attach it.
4. **No real screenshots/photography.** Placeholder avatars hotlinked a third-party demo image
   bucket in the source mockups; I did not carry that dependency into this system — components
   use an initials fallback instead. Attach real product photography/headshots if you'd like
   them reflected.
5. **Source is mockups, not a shipped app.** Some flows (e.g. flow3c/flow3e) reference an
   "implemented app" codebase (`frontend/portal/src/...`) that was not present in what I could
   access — only the `designs/` mockup folder and the flow spec markdown were readable. If that
   app code exists and you can attach it, I'd like to re-verify pixel values against it.

I'd love your take on all five before this goes further — tell me which to prioritize and I'll
iterate.
