# Navigation Element Handling Guide

Detailed handling instructions for header/nav element types and `content/nav.plain.html`.

## `nav.plain.html` contract (all projects)

`*.plain.html` is a **portable content fragment**: the **same file** should work under local preview (aem up) and in Document Authoring / production. Treat the strictest rules as universal — do not maintain a “GitHub-only” vs “DA-only” shape.

- **Belongs in `nav.plain.html`:** semantic structure authors expect (sections, headings, paragraphs, lists, links, images) that survives the plain pipeline — logos, nav link text, megamenu copy, feature-card titles, locale labels, mobile menu entries, etc.
- **Belongs in `header.js`:** interactive controls (`<form>`, `<input>`, `<button>`, `<label>`, `<select>`, `<textarea>`), layout shells that depend on `class` / `data-*` / `id` / `style` on wrappers, open/close megamenu logic, hamburger toggles, search behavior, and anything authoring strips or rewrites. **Copy** still lives in the fragment where possible; **controls and layout chrome** are created in JS and wired to nodes from the fetched fragment.

### Flat structure (enforced)

Do **not** nest extra `<div>` wrappers inside a top-level section `<div>` for layout. Do **not** put `class=`, `data-*`, `style=`, or `id=` on fragment tags. The PostToolUse **FLAT_STRUCTURE** gate and **`validate-nav-content.js`** enforce this on every write and on orchestrator validation. You still need **at least two top-level section `<div>`s** (e.g. brand bar + main nav) — a single wrapper div breaks the header block and DA.

## Brand / utility bar

Top strip: logo lockup, utility links, locale trigger, sometimes secondary CTAs.

**Analysis:** Record row index in phase-2, element types (logo, links, locale, icons).

**Content:** Typically the **first top-level `<div>`** in `nav.plain.html` with headings/lists/links and `<img>` for logos.

**Behavior:** Hover states, link navigation — implemented in `header.js` / `header.css` by querying structure produced from the fragment.

## Main navigation row

Primary horizontal nav: top-level categories, possible dropdown triggers.

**Content:** Second (or adjacent) top-level `<div>` with `<ul>` / `<li>` / `<a>` text matching source labels.

**Behavior:** Megamenu open on hover/click reads panel content from the fragment DOM; do not hardcode category labels in JS.

## Search

Search field and submit (magnifier).

**Content:** Section shell and any **static** instructional text in the fragment if it survives plain processing.

**Implementation:** Build `<form>` / `<input>` in **`header.js`** per the **`nav.plain.html` contract**; wire submit and any autocomplete in JS.

## Megamenu

Large panels with columns, links, optional images.

**Content:** Panel copy, column headings, link lists, and **`<img>`** references for thumbnails/cards belong in `nav.plain.html` (often under sections keyed by trigger in your structural mapping).

**Behavior:** Show/hide panels, focus trap, overlay alignment — **`header.js`** + **`header.css`**.

**Feature cards:** When phase-3 / megamenu-mapping documents `featureCard` (title, image, links), mirror that content in the fragment with real image paths under `content/images/`.

## Locale selector

Country/language grid, dropdown, or list; often with flags.

**CRITICAL:** Extract **all** entries (not only the closed trigger).

**Content:** Country names and **flag image references** MUST live in `nav.plain.html`. **`header.js` must only read** entries from the DOM — never hardcode locale lists or flag URLs.

**Images:** Download flags to `content/images/`.

## Hamburger and mobile menu panel

Mobile trigger icon and slide-in / full-screen menu.

**Analysis:** Phase-4 records animation (hamburger → X), panel type, menu item layout.

**Content:** Mobile root menu items, nested labels, and images belong in the fragment (often in a **mobile-only** section — see below).

**Behavior:** Toggle panel, focus, scroll lock — **`header.js`**.

## Mobile-only content

When mobile has rows or items not shown on desktop:

**Content:** Add a dedicated top-level section in `nav.plain.html` (or clearly separated block) with the extra links/images/text. **`header.css`:** hide on desktop (`display: none` by default), show only inside `@media` for the mobile breakpoint.

**Registers:** Document gaps in `mobile/missing-content-register.json` until resolved; hooks block until `resolved: true`.

## Social links

If the header (not only footer) exposes social icons:

**Content:** `<a>` wrapping `<img>` or inline SVG in `nav.plain.html`; images under `content/images/`.

## Sticky header

Header that sticks or shrinks on scroll.

**Implementation:** Primarily **`header.css`** (`position: sticky` / `fixed`, shadow transitions). Fragment stays semantic; JS only if scroll listeners are required beyond CSS.

## Cross-reference

Footer migrations use the same plain-HTML discipline; see the footer orchestrator **`references/element-handling-guide.md`** for parallel patterns (forms, locale, images).
