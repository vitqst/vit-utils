# Text & String Tools Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan
> task-by-task.

**Goal:** Ship the registry foundation and all eight Text & String tools as useful,
bilingual, lazy-loaded browser modules.

**Architecture:** Consolidate public metadata in the tool catalog, derive group
navigation from it, and attach one dynamic import per ready module. Share only
accessible workspace presentation; keep transformations pure and tool-owned.

**Tech Stack:** React 19, TypeScript 7, Vite 7, Vitest, Testing Library, Tailwind
CSS.

---

### Task 1: Registry contract

**Files:**

- Modify: `src/registry/tool-registry.test.ts`
- Modify: `src/registry/tool-catalog.ts`
- Modify: `src/registry/tool-registry.ts`
- Modify: `src/registry/group-catalog.ts`
- Modify: `src/registry/types.ts`
- Modify: `src/app/App.tsx`

1. Write a failing registry test requiring all 41 advertised ids to live in the
   catalog, all ready entries to have loaders, and all group lists to derive from
   catalog metadata.
2. Run `npm test -- src/registry/tool-registry.test.ts`; expect a count mismatch.
3. Add complete bilingual metadata and per-tool statuses to the catalog.
4. Derive group lists and fix sidebar navigation to use the matched tool path.
5. Run the focused registry and shell tests; expect them to pass.

### Task 2: Locale-aware tool contract and workspace

**Files:**

- Modify: `src/registry/types.ts`
- Modify: `src/app/App.tsx`
- Create: `src/components/tool/ToolWorkspace.tsx`
- Create: `src/components/tool/ToolWorkspace.test.tsx`

1. Write a component test rendering visible labels, input, actions, and output in
   both locales.
2. Run the focused test; expect a missing-module failure.
3. Add `ToolComponentProps { locale: Locale }`, pass locale through `ToolPage`, and
   implement semantic shared workspace primitives.
4. Re-run the focused test and shell tests.

### Task 3: Case converter and slug tools

**Files:**

- Create: `docs/product-specs/case-convert.md`
- Create: `docs/product-specs/slugify.md`
- Create: `src/tools/case-convert/case-convert.test.ts`
- Create: `src/tools/case-convert/case-convert.ts`
- Create: `src/tools/case-convert/CaseConvertTool.test.tsx`
- Create: `src/tools/case-convert/CaseConvertTool.tsx`
- Create: `src/tools/case-convert/index.ts`
- Create the equivalent files under `src/tools/slugify/`.

1. Specify supported case styles and Vietnamese-aware slug/accent behavior.
2. Write failing pure tests, including whitespace, punctuation, acronym, and
   Vietnamese diacritic cases.
3. Run each pure test and confirm the missing implementation failure.
4. Implement minimal pure transforms and make those tests pass.
5. Write failing component tests for input, style selection, output, and locale.
6. Implement the two lazy tool workspaces and make their component tests pass.

### Task 4: Diff and word count

**Files:** Create one product spec, domain test/module, component test/module, and
lazy `index.ts` under each of `src/tools/diff/` and `src/tools/word-count/`.

1. Specify line diff behavior and word/character/line counting rules.
2. Test equal/insert/delete/change lines and empty/Unicode/multiline counts first.
3. Implement pure transformations.
4. Test and implement two-pane diff input with a readable result, plus live word
   counts with bilingual metric labels.

### Task 5: Line tools and regex tester

**Files:** Create the same spec/domain/component/lazy-entry set under
`src/tools/line-tools/` and `src/tools/regex/`.

1. Specify stable sorting, case sensitivity, blank-line and dedupe options.
2. Specify regex flags, match details, zero-width handling, and invalid patterns.
3. Write and observe failing domain tests.
4. Implement pure transforms and make domain tests pass.
5. Write and observe failing component tests for options, validation, and output.
6. Implement the workspaces and make component tests pass.

### Task 6: Lorem Ipsum and Unicode inspector

**Files:** Create the same spec/domain/component/lazy-entry set under
`src/tools/lorem/` and `src/tools/unicode/`.

1. Specify deterministic paragraph/sentence/word modes and reasonable limits.
2. Specify Unicode code-point iteration, UTF-16 units, names/category limitations,
   whitespace display, and grapheme summaries.
3. Write and observe failing domain tests.
4. Implement generation and code-point inspection.
5. Write and observe failing component tests for controls, localized output labels,
   and empty states.
6. Implement the workspaces and make component tests pass.

### Task 7: Route and build verification

**Files:**

- Modify: `src/app/App.test.tsx`
- Modify: `docs/product-specs/index.md`
- Modify: `docs/exec-plans/active/2026-07-24-all-tools.md`

1. Test that each Text & String catalog item navigates to its own route and module.
2. Update the shipped product-spec index and active-plan checkboxes.
3. Run `npm test`.
4. Run `npm run typecheck`.
5. Run `npm run build`.
6. Inspect `dist/tools/<id>/index.html` and emitted chunks for all eight tools.

