# Intent Capture Questions

Source context:

- `docs/requirements/20260721-init-app.md`
- `docs/requirements/vit tools.dc.html`
- Existing React/Vite photo-culling application and test suite
- User clarification: "current it already have a draft 1st structure in docs/requirements/vit tools.dc.html"

## Interaction Mode

How would you like to answer the intent-capture questions?

A. Guide me — walk through each question interactively
B. I'll edit the file — fill the answers in this file directly
C. Chat — discuss freely and extract the decisions afterward
X. Other (please specify)

[Answer]: A. Guide me (Recommended)

## Q1. Core Problem

Which problem should define this initiative's primary purpose?

A. Treat privacy-first tools, extensible catalog growth, search discovery, and easy contribution as one combined problem
B. Focus primarily on the end-user problem: trustworthy browser tools without uploads, tracking, or ads
C. Focus primarily on the product-maintenance problem: turn the single photo app into an extensible catalog
X. Other (please specify)

[Answer]: A. Combined platform problem (Recommended)

## Q2. Primary Customer

Who should be the primary customer for launch decisions?

A. General privacy-conscious users, with Vietnamese and English support from launch
B. Photographers who already need the Photo Cure workflow
C. Developers, power users, and open-source contributors
X. Other (please specify)

[Answer]: A. General privacy users (Recommended)

## Q3. Initial Release Boundary

What should the first completed release include?

A. The reusable platform shell plus the existing Photo Cure tool migrated into the registry
B. The reusable platform shell only; migrate Photo Cure later
C. A broader launch that adds Photo Collage or tools from other groups
X. Other (please specify)

[Answer]: A. Platform plus Photo Cure (Recommended)

## Q4. Definition of Success

Which definition should decide when this initialization requirement is complete?

A. The full requirement acceptance checklist: registry, lazy loading, offline use, vi/en, static pages, privacy, Firebase readiness, and Photo Cure parity
B. The functional catalog shell and Photo Cure migration first, with PWA, SSG, or i18n deferred
C. Live outcome metrics such as discoverability or adoption, requiring production release and observation
X. Other (please specify)

[Answer]: A. Full requirement checklist (Recommended)

## Q5. Privacy Promise

What should “zero outbound requests on tool pages” mean for the initial release?

A. No third-party requests at runtime; bundle fonts/assets locally, with only the hosted site origin serving files
B. No uploads or tracking, but third-party CDN assets such as web fonts are acceptable
C. Explicitly opted-in external APIs may be allowed per tool when clearly disclosed
X. Other (please specify)

[Answer]: B. CDN assets allowed

## Q6. Initiative Trigger

Why is this work important now?

A. All four triggers matter together: catalog growth, privacy opportunity, modernization, and deployment readiness
B. The monolithic photo application and untyped stack are the dominant trigger
C. The privacy-first market opportunity and Firebase/open-source launch are the dominant trigger
X. Other (please specify)

[Answer]: A. All triggers together (Recommended)

## Q7. Decision Ownership

Who should be represented as the decision-maker and key influencers?

A. Repository owner as final product/release decision-maker; end users and contributors as key stakeholders
B. End users and contributors collectively steer decisions through feedback; repository owner facilitates
C. A separate product owner, sponsor, or maintainer group holds final authority
X. Other (please specify)

[Answer]: A. Repository owner (Recommended)

## Q8. Privacy Promise Reconciliation

The full requirement checklist says tool pages must make zero outbound requests, while Q5 allows third-party CDN assets. Which policy should prevail?

A. Preserve strict zero-outbound behavior everywhere by bundling all fonts and assets locally
B. Allow CDN assets and revise the claim to “no uploads and no tracking,” without promising zero outbound requests
C. Allow CDN assets on non-tool pages, but require each static tool page to bundle its assets and make zero third-party requests
X. Other (please specify)

[Answer]: C. Tool-page split (Recommended)

## Consolidated Summary

- Frame this as one combined platform problem: privacy-first browser tools, extensible catalog growth, organic discovery, and easy open-source contribution.
- Prioritize general privacy-conscious users, with Vietnamese and English support from launch.
- Ship the reusable catalog shell and migrate the existing Photo Cure application into the registry; other draft tools remain later work.
- Treat the full initialization checklist as the completion definition, including registry-driven discovery, lazy loading, offline PWA behavior, vi/en, static tool pages, verifiable privacy, Firebase-ready output, and Photo Cure feature parity.
- Use `docs/requirements/vit tools.dc.html` as the first structural and interaction draft rather than creating a new shell direction.
- Permit third-party CDN assets on non-tool pages, while every static tool page remains self-contained and makes zero third-party requests.
- Treat catalog growth, privacy opportunity, stack modernization, and deployment readiness as joint initiative triggers.
- Treat the repository owner as final product and release decision-maker; end users and contributors are key stakeholders and influencers.

## Consolidated Summary Confirmation

Does this all look correct before I generate the intent artifacts?

A. Looks correct — generate the artifacts from these answers
B. Request changes — revise one or more answers before generation
X. Other (please specify)

[Answer]: A. Looks correct (Recommended)
