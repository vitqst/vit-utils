# Date & Time Tools Implementation Plan

**Goal:** Ship all six Date & Time tools as bilingual, deterministic,
lazy-loaded browser modules.

**Architecture:** Keep calendar and duration arithmetic in pure modules. Use
`Intl.DateTimeFormat` for IANA-zone rules and localized display. Implement the
Vietnamese UTC+7 lunar conversion from the repository's specified Hồ Ngọc Đức
algorithm so no network or runtime service is involved. Treat date-only values
as calendar dates rather than local-midnight instants where elapsed time is not
requested.

### Task 1: Unix timestamp and Vietnamese lunar calendar

- Add product specs and failing pure/component tests under
  `src/tools/timestamp/` and `src/tools/lunar/`.
- Support seconds/milliseconds auto-detection, date-to-epoch conversion, local
  and UTC results, range validation, solar/lunar directions, leap months, and
  can-chi year names.
- Register both only after focused tests and type checking pass.
- Commit as `feat(date): add timestamp and lunar tools`.

### Task 2: Timezone converter and date difference

- Add product specs and test-first modules under `src/tools/timezone/` and
  `src/tools/date-diff/`.
- Resolve a wall-clock input in an IANA source zone with DST-aware validation,
  compare selected target zones, and disclose ambiguous/nonexistent local times.
- Calculate signed elapsed milliseconds plus calendar years/months/days with
  explicit date-only semantics.
- Register, verify, and commit as `feat(date): add timezone and date diff tools`.

### Task 3: Duration humanizer and working days

- Add product specs and test-first modules under `src/tools/duration/` and
  `src/tools/working-days/`.
- Parse milliseconds, seconds, and clock notation; emit normalized milliseconds,
  clock text, and bilingual readable parts.
- Count an inclusive date range with configurable weekend weekdays and validated
  ISO holiday dates, returning working/weekend/holiday totals.
- Register, verify, and commit as
  `feat(date): add duration and working-day tools`.

### Task 4: Date & Time group verification

- Add group-hub and all-six direct-route shell coverage.
- Update the shipped spec index and active execution-plan checkboxes.
- Run `npm run check`; audit static routes, lazy imports, network APIs, and
  browser persistence.
- Commit as `test(date): verify complete tool group`.

