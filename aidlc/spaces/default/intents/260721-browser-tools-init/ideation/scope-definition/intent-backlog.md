# Prioritized Intent Backlog

## Prioritization Method

The backlog uses MoSCoW for the release boundary and dependency-first,
risk-aware ordering within the Must set. Numeric RICE or WSJF scoring is not
used because there is no reliable reach, cost-of-delay, or duration evidence at
this stage; inventing scores would create false precision.

Every proto-Unit below traces to the approved scope in `scope-document.md`
and the originating outcomes in `../intent-capture/intent-statement.md`.

## Ordered Proto-Units

| Order | ID | Proto-Unit | Priority | Value and acceptance signal | Dependencies | Scope trace |
|---:|---|---|---|---|---|---|
| 1 | IB-01 | Catalog contract and truthful availability | Must | One declaration supplies identity, group, localized metadata, search terms, readiness, privacy status, and discovery inputs; future entries are clearly “coming soon” | None | SC-02, SC-03 |
| 2 | IB-02 | Privacy, offline, and isolated delivery foundation | Must | Tool pages contact no third-party origins, the shell and Photo Cure work offline after first load, and tool behavior is delivered only when opened | IB-01 | SC-04, SC-08, SC-11 |
| 3 | IB-03 | Bilingual shared shell and discovery | Must | The approved draft's home, groups, tool view, search, command palette, language, theme, ready state, and coming-soon state work coherently in vi/en | IB-01, IB-02 | SC-01, SC-02, SC-07, SC-10 |
| 4 | IB-04 | Photo Cure migration and responsive heavy work | Must | Every supported and tested current workflow remains available without freezing shared navigation; visual presentation fits the shell | IB-01, IB-02, IB-03 | SC-05, SC-06 |
| 5 | IB-05 | Static working-tool discovery | Must | Photo Cure has a directly addressable static page, groups have hubs, and only implemented pages appear in generated discovery and sitemap output | IB-01, IB-03, IB-04 | SC-09 |
| 6 | IB-06 | Local favorites and recent navigation | Must | Users can favorite and revisit tools locally without accounts, tracking, or server persistence | IB-01, IB-03 | SC-07, SC-11 |
| 7 | IB-07 | Quality, contributor, and hosting readiness | Must | Automated checks cover the platform and Photo Cure continuity; local-run guidance, CI, production build, and Firebase Hosting configuration are verified | IB-01 through IB-06 | SC-12 |
| 8 | IB-08 | Responsive and accessible refinement | Should | The approved draft remains usable across common screen sizes, keyboard navigation, and input modes | IB-03, IB-04 | SC-01 |
| 9 | IB-09 | Optional decorative polish | Could | Additional motion or visual detail improves delight without changing task completion or trust | IB-08 | SC-01 |
| 10 | IB-10 | Future tool implementations | Won't | Photo Collage and all other planned utilities remain backlog ideas after initialization | IB-01, future approval | Out of scope |

## Capability Dependencies

- IB-01 is the shared discovery source and unblocks all catalog-facing work.
- IB-02 proves the strongest cross-cutting promises before dependent
  experiences are polished.
- IB-03 creates the user-facing shell required by Photo Cure, static discovery,
  and local preferences.
- IB-04 must demonstrate working-tool continuity before Photo Cure can be
  published as an implemented static page.
- IB-05 and IB-06 can proceed independently after their shared prerequisites.
- IB-07 closes the release only after every Must proto-Unit has evidence.
- IB-08 may be incorporated while IB-03 and IB-04 are built, but it cannot
  displace a Must item.

## Risk-First Validation Order

| Checkpoint | Confidence question | Evidence expected |
|---|---|---|
| V1 | Can one source represent ready and planned tools without false claims? | Catalog proof covering Photo Cure and coming-soon entries |
| V2 | Can a direct tool page uphold the zero-third-party promise and offline use? | Network and offline verification on the first working-tool slice |
| V3 | Can the existing Photo Cure behavior move without regressions or UI blocking? | Baseline comparison, regression suite, and responsive-use evidence |
| V4 | Can discovery output expose only implemented static pages while previewing future tools in-app? | Route, hub, and generated sitemap checks |
| V5 | Can contributors and hosting operators reproduce the release? | Clean local setup, CI, production build, and hosting configuration checks |

## Deferred Backlog

The listed future tools remain product direction, not hidden implementation
work. Each requires a later intent or explicit scope expansion. The initial
catalog may name them as “coming soon,” but no future tool receives a working
claim, indexed static page, sitemap entry, or implementation in this release.

## Change Control

Any proposal to implement a future tool, remove a Must capability, weaken Photo
Cure continuity, or relax the tool-page privacy boundary must return to the
repository owner for an explicit scope decision and update both this backlog
and `scope-document.md`.
