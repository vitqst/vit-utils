# Scope Definition Questions

Source context:

- `../intent-capture/intent-statement.md`
- `../intent-capture/stakeholder-map.md`
- `docs/requirements/20260721-init-app.md`
- `docs/requirements/vit tools.dc.html`

Confirmed before this stage:

- The full initialization checklist is launch-blocking.
- The initial release implements the shared platform and Photo Cure only.
- The supplied HTML is the structural baseline, not full release scope.
- Tool pages must make zero third-party requests; non-tool pages may use CDN assets.

## Interaction Mode

How would you like to answer the scope-definition questions?

A. Guide me — walk through each question interactively
B. I'll edit the file — fill the answers in this file directly
C. Chat — discuss freely and extract the decisions afterward
X. Other (please specify)

[Answer]: A. Guide me (Recommended)

## Q1. Planned Tool Visibility

How should the listed but unimplemented tools appear in the first release?

A. Show every planned tool from the draft as “coming soon,” with only Photo Cure marked ready
B. Show only Photo Cure and hide all future tools until implemented
C. Show the seven groups and representative future names, but do not make unimplemented tools selectable
X. Other (please specify)

[Answer]: A. All shown coming soon (Recommended)

## Q2. Static Pages for Unimplemented Tools

Which static-page and sitemap policy should apply to planned tools that are not implemented yet?

A. Generate and index static pages only for implemented tools; planned tools may appear in the app as non-indexed previews
B. Generate a “coming soon” static page and sitemap entry for every planned tool
C. Do not expose planned tools anywhere until their static page and implementation are complete
X. Other (please specify)

[Answer]: A. Implemented pages only (Recommended)

## Q3. Photo Cure Parity

What level of continuity is required when Photo Cure moves into the shared product?

A. Preserve every currently supported workflow covered by the application and regression tests; visual integration may change presentation
B. Preserve only the core choose-folder, cull, review, and save flow; secondary behavior may be deferred
C. Preserve the current interface pixel-for-pixel as well as its behavior
X. Other (please specify)

[Answer]: A. Full tested parity (Recommended)

## Q4. Sequencing Preference

How should the work be prioritized when dependencies permit a choice?

A. Dependency-first and risk-aware: prove registry, privacy, offline, and heavy-tool boundaries before broad shell polish
B. User-value-first: make the shell and Photo Cure usable end-to-end, then harden privacy, offline, and delivery concerns
C. Draft-first: reproduce the supplied visual structure before establishing the deeper platform behaviors
X. Other (please specify)

[Answer]: A. Dependency-first risk-aware (Recommended)

## Q5. Deadline

Is there a hard delivery deadline that should override the quality-gated scope?

A. No fixed date; completion is governed by the approved acceptance criteria
B. Complete within one week, deferring non-critical details if necessary
C. Complete within two weeks, with the full approved scope retained
X. Other (please specify)

[Answer]: A. No fixed date (Recommended)

## Consolidated Summary

- Show all planned tools from the supplied draft as “coming soon,” with only Photo Cure marked ready.
- Generate and index static pages only for implemented tools; planned tools may remain non-indexed previews inside the catalog.
- Preserve every currently supported Photo Cure workflow covered by the application and regression tests; visual integration may change presentation.
- Sequence work dependency-first and risk-aware, proving registry, privacy, offline, and heavy-tool boundaries before broad shell polish.
- Use the approved acceptance criteria rather than a fixed calendar date as the completion gate.

## Consolidated Summary Confirmation

Does this all look correct before I generate the scope artifacts?

A. Looks correct — generate the artifacts from these answers
B. Request changes — revise one or more answers before generation
X. Other (please specify)

[Answer]: A. Looks correct (Recommended)
