# All Tools Design

## Product boundary

The shipped catalog is the 41 tools presented by the current home page. Each tool
must complete a specific job in the browser, have English and Vietnamese copy, be
keyboard accessible, and be reachable at a stable static route. A catalog entry is
not "implemented" merely because its route renders: its primary flow, validation,
empty state, and result behavior must be tested.

The HIBP breach checker is the sole anticipated network exception. It will not be
marked ready until a product specification and security review define the
k-anonymity prefix request and the UI discloses it. All other tools keep inputs and
derived data in browser memory or local browser storage.

## Architecture

`src/registry/tool-catalog.ts` becomes the source of truth for all public metadata.
`group-catalog.ts` derives its group lists from those entries, and
`tool-registry.ts` attaches statically analyzable dynamic imports. This preserves a
separate Vite chunk per tool while preventing navigation, group hubs, search, and
the sitemap from drifting into private tool lists.

Every lazy module exports a component that accepts `{ locale }`. Tool-owned copy
lives beside the tool because labels and error messages are part of its behavior;
the shell continues to own platform copy. Shared workspace components provide
labels, text areas, action rows, result panels, copy/download actions, and status
announcements without deciding any tool's domain behavior.

Pure transformations live in each tool's domain module and are unit tested without
React. Similar tools may share standards-focused helpers, but each lazy entry owns
its workflow. Large file, archive, spreadsheet, PDF, cryptographic-file, and image
operations use workers with explicit cancel and dispose messages.

## Delivery

Work proceeds in group batches: registry foundation, Text & String, Developer &
Data, Date & Time, Generators, Files & Documents, Security, then Media. Each tool
gets a product specification before its first failing test. Each behavior follows
red-green-refactor, and each group ends with full test, type-check, build, and
browser checks.

## Error handling and accessibility

Validation errors appear next to the relevant semantic control and are announced
with `role="alert"` when an action fails. Live computed results use polite status
announcements only when that does not create noisy typing feedback. Buttons remain
buttons, downloads remain links or explicit buttons, labels are visible, and all
primary flows work without a pointer. Destructive reset actions only clear local
working state and remain reversible through input history where practical.

## Testing

Domain tests cover transformations and edge cases. Component tests cover the
primary user flow, bilingual labels, keyboard operation, validation, copy/download
behavior where browser APIs permit, and cancellation for worker-backed tools.
Registry tests prove that the 41 catalog ids and paths are unique, every catalog
entry has a loader, and planned entries cannot silently appear as ready.

