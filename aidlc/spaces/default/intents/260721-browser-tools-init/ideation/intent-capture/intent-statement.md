# Intent Statement

## Problem Statement

People need small, dependable browser tools without surrendering their files,
text, or behavior to an online service. The current project proves one useful
photo workflow and includes a strong first draft of a broader tool catalog, but
it does not yet provide a launch-ready foundation that can grow without
duplicated navigation, inconsistent privacy claims, or regressions in the
existing Photo Cure experience.

This initiative will turn that starting point into a trustworthy, discoverable,
and contributor-friendly browser-tool product. It combines four needs:

- give users single-purpose tools that work locally and respect their privacy;
- make tools easy to find through bilingual navigation, search, and direct
  static pages;
- let maintainers add future tools without rewriting shared discovery surfaces;
- preserve the working Photo Cure flow while moving it into the common product
  experience.

The supplied draft at `docs/requirements/vit tools.dc.html` is the approved
first structural and interaction direction. It is evidence and a baseline, not
an instruction to ship every demo tool contained in that file.

## Target Customer

The primary customer is a general privacy-conscious user who wants to open a
page and complete a task immediately. Vietnamese and English users must receive
an equally understandable launch experience.

Secondary customers and beneficiaries are:

- photographers who rely on the existing Photo Cure workflow;
- developers and power users who will use later text and data utilities;
- open-source contributors who need a predictable way to extend the catalog;
- search visitors who need a direct, descriptive page for the specific tool
  they sought.

## Success Metrics

Completion is determined by observable launch criteria rather than post-launch
traffic or engagement:

| ID | Outcome | Pass condition |
|---|---|---|
| IC-01 | Bilingual discovery | Home, group, search, and tool experiences are usable in both Vietnamese and English |
| IC-02 | Focused launch slice | The shared catalog experience and Photo Cure are complete; other draft tools are not required |
| IC-03 | Verifiable privacy | Tool data stays in the browser and each static tool page makes zero requests to third-party origins |
| IC-04 | Offline continuity | After the required first load or install, the shell and Photo Cure remain usable without a connection |
| IC-05 | Direct discovery | Photo Cure has a descriptive, directly addressable static page suitable for indexing and sharing |
| IC-06 | Predictable extension | A contributor can add a future self-describing tool without separately maintaining navigation, search, and sitemap lists |
| IC-07 | Fast repeat access | Users can find tools through grouped browsing and the command palette, with favorites or recent choices retained locally |
| IC-08 | Release readiness | A repeatable production build and Firebase Hosting configuration are present and verified without requiring a live deployment |
| IC-09 | Photo Cure continuity | Existing supported Photo Cure workflows remain available after migration, with regression evidence |

No analytics, tracking, or production observation period is required to declare
this initialization complete.

## Initiative Trigger

Four triggers make the work timely:

1. The current single-purpose photo application is difficult to grow into a
   coherent catalog.
2. A privacy-first, no-upload product promise offers meaningful user value and
   must be made verifiable rather than aspirational.
3. The existing application and the catalog draft need to become one
   maintainable product foundation.
4. The open-source project needs repeatable, static hosting readiness so users
   can access it publicly or run it locally.

## Initial Scope Signal

The initiative uses the approved custom `browser-tools-init` scope at Standard
depth.

In scope:

- adapt the supplied first-structure draft into the shared launch experience;
- migrate the existing Photo Cure workflow without intentional feature loss;
- deliver bilingual discovery, direct tool pages, offline behavior, local
  favorites/recent use, and clear privacy indicators;
- provide tested, repeatable build and hosting readiness.

Out of scope:

- implementing Photo Collage or any other future catalog tool;
- a live production deployment or creation of external hosting accounts;
- analytics, advertising, behavioral tracking, or server-side user-data
  processing;
- post-launch experimentation and adoption optimization.

## Assumptions and Constraints

- The repository owner is the final product and release decision-maker.
- End users and contributors influence decisions through feedback but do not
  replace the owner's approval authority.
- Third-party CDN assets may be used on non-tool pages. Every static tool page
  must remain self-contained with respect to third-party origins so its
  zero-outbound privacy claim is independently verifiable.
- The draft's visual direction may be refined for responsiveness,
  accessibility, and consistency while preserving its recognizable information
  structure and interaction model.
- Hosting credentials and an actual production release require separate user
  authority.

## Source Traceability

- `docs/requirements/20260721-init-app.md`
- `docs/requirements/vit tools.dc.html`
- Existing Photo Cure application and regression tests
- Confirmed answers in `intent-capture-questions.md`
