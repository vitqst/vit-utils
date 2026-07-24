# Scope Definition

## Scope Baseline

This document refines the approved problem and outcomes in
`../intent-capture/intent-statement.md`. The first release is a focused
initialization of the broader browser-tool product: the shared catalog
experience plus one complete tool, Photo Cure.

The supplied `docs/requirements/vit tools.dc.html` remains the first
structural and interaction baseline. Its planned catalog is visible as product
direction, but its demonstration tools do not become implementation scope.

## Minimum Valuable Release

The minimum valuable release lets a Vietnamese- or English-speaking user:

1. discover the available and planned tool catalog through the approved shell;
2. open Photo Cure from browsing, search, a command palette, or its direct page;
3. verify that Photo Cure keeps user data in the browser and contacts no
   third-party origin;
4. complete every currently supported Photo Cure workflow;
5. return to the tool through local recent or favorite navigation;
6. continue using the shell and Photo Cure offline after the required first
   load or installation.

It also lets a contributor run the project locally and add a future
self-describing tool without separately maintaining each discovery surface.

## In Scope

| ID | Capability boundary | Acceptance signal | Intent trace |
|---|---|---|---|
| SC-01 | Adapt the approved first-structure draft into the launch shell | Top bar, grouped catalog, home, tool view, command palette, language and theme controls form one coherent experience | IC-01, IC-02 |
| SC-02 | Show the complete planned catalog as preview information | Every listed future tool is visibly marked “coming soon”; only Photo Cure is marked ready | IC-02 |
| SC-03 | Drive discovery surfaces from one tool declaration | A future tool addition updates browsing, search, and generated discovery data without hand-maintaining parallel lists | IC-06 |
| SC-04 | Deliver tool behavior only when selected | Opening the shell does not load Photo Cure's heavy implementation until Photo Cure is requested | IC-06 |
| SC-05 | Keep heavy local work responsive | Photo and other large-data work has a non-blocking execution boundary suitable for future heavy tools | IC-04, IC-09 |
| SC-06 | Migrate Photo Cure with full tested continuity | Every workflow supported by the current application and regression tests remains supported; shared-shell styling may change presentation | IC-02, IC-09 |
| SC-07 | Support fast and repeat discovery | Group browsing, search, command palette, favorites, and recent tools work with local-only preference storage | IC-07 |
| SC-08 | Support offline use | The shared shell and Photo Cure remain usable without a connection after the required first load or install | IC-04 |
| SC-09 | Provide static discovery for working content | Photo Cure has a direct static page and every group has a hub; unimplemented tools have no indexed static page or sitemap entry | IC-05 |
| SC-10 | Provide Vietnamese and English from launch | Shared navigation, trust messaging, catalog metadata, and Photo Cure-facing copy are available in both languages | IC-01 |
| SC-11 | Make privacy independently verifiable | Tool data never leaves the browser; static tool pages load no third-party resources; non-tool pages may use approved CDN assets | IC-03 |
| SC-12 | Produce release-ready, open-source output | Local run guidance, repeatable checks, production build, continuous validation, and Firebase Hosting configuration are present | IC-08 |

## Out of Scope

- Implementing Photo Collage or any planned text, developer, date, generator,
  file, security, or other media tool.
- Generating or indexing “coming soon” static pages for unimplemented tools.
- Live Firebase project creation, credential setup, or production deployment.
- Analytics, advertising, fingerprinting, server-side logs of user behavior, or
  any server-side processing of tool inputs.
- Post-launch experiments, traffic goals, conversion metrics, or feedback
  optimization.
- Pixel-for-pixel preservation of the current Photo Cure interface.

## Priority Boundary

MoSCoW is used because this is a fixed acceptance scope rather than a
date-boxed release.

| Priority | Included work |
|---|---|
| Must | SC-01 through SC-12; these are the approved completion contract |
| Should | Responsive and accessibility refinements needed to make the approved draft usable across common viewport and input modes |
| Could | Additional decorative motion or polish that does not affect navigation, trust, or Photo Cure continuity |
| Won't this release | All future tool implementations, placeholder static pages, live deployment, and analytics |

The Must set intentionally exceeds the usual MoSCoW 60% guideline because the
repository owner chose a quality-gated full checklist and no fixed deadline.
Moving any Must item requires an explicit scope change rather than quiet
deferral.

## Dependencies and Preferred Sequence

The approved dependency-first, risk-aware sequence is:

1. Establish the single tool/catalog contract and privacy boundary.
2. Prove offline behavior, isolated tool delivery, and a responsive heavy-work
   boundary before broad visual polish.
3. Adapt the shared shell and bilingual discovery to the approved draft.
4. Migrate Photo Cure and demonstrate full tested continuity.
5. Generate direct static discovery and group hubs for implemented content.
6. Complete local preferences, quality checks, contributor guidance, and
   hosting readiness.

Downstream planning may split or combine these capability groups, but it must
preserve their dependency and acceptance relationships.

## Value Stream Map

| User step | Desired outcome | Current friction | In-scope response |
|---|---|---|---|
| Discover | Find the right tool by name or group | One photo app and a separate catalog draft | Bilingual home, groups, search, palette, and honest ready/coming-soon status |
| Trust | Confirm inputs stay private | Privacy promise is not yet consistently verifiable | Tool-page privacy badge and zero third-party-origin tool pages |
| Use | Complete the task immediately | Photo Cure is outside a shared tool experience | Full tested Photo Cure workflow inside the common product |
| Continue | Keep working on a poor connection | Current product is not an installable offline catalog | Offline-capable shell and Photo Cure |
| Return | Reopen frequent tools quickly | No catalog-level favorites or recent navigation | Local favorites and recent tools |
| Share | Link to the exact working tool | Single-page discovery is weak for direct search entry | Direct static Photo Cure page and group hubs |
| Extend | Add a future tool safely | Draft data, navigation, and implementation are coupled | One self-describing addition updates shared discovery surfaces |

## Constraints and Assumptions

- The repository owner holds final scope authority.
- Completion is governed by acceptance evidence, not a fixed delivery date.
- The draft's information structure is preserved while allowing
  responsiveness, accessibility, and integration changes.
- Planned tools may be selectable as non-indexed “coming soon” previews, but
  they must never be presented as working.
- Existing tests define a floor for Photo Cure continuity; undocumented
  behavior discovered during reverse engineering must be classified before
  removal.
- No credentialed external action is implied by “Firebase-ready.”

## Exit Criteria

Scope is complete when every SC item has downstream requirement, design,
implementation, and verification traceability; every Must item passes; no
out-of-scope tool was implemented; and the repository owner approves the final
evidence.

## Source Traceability

- `../intent-capture/intent-statement.md`
- `scope-definition-questions.md`
- `docs/requirements/20260721-init-app.md`
- `docs/requirements/vit tools.dc.html`
