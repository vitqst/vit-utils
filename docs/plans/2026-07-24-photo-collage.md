# Photo Collage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a bilingual, accessible, worker-backed tool that arranges local
images into a downloadable PNG or JPEG collage.

**Architecture:** Pure helpers calculate bounded cell and crop geometry. A lazy
React route owns files, settings, cancellation, and object URLs; a dedicated Web
Worker decodes and renders transferred image buffers with OffscreenCanvas.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Web Workers,
createImageBitmap, OffscreenCanvas, Canvas 2D, Vite.

---

### Task 1: Specify geometry and limits

**Files:**

- Create: `docs/product-specs/photo-collage.md`
- Create: `src/tools/photo-collage/collage.test.ts`
- Create: `src/tools/photo-collage/collage.ts`

**Step 1: Write the failing geometry tests**

Test a four-image grid at 1200 pixels wide with a 16-pixel gap, horizontal and
vertical presets, and fit/fill rectangles:

```ts
expect(layoutCollage({
  layout: "grid",
  count: 4,
  width: 1200,
  aspectRatios: [1, 1, 1, 1],
  gap: 16,
})).toMatchObject({
  width: 1200,
  cells: [
    { x: 0, y: 0, width: 592, height: 592 },
    { x: 608, y: 0, width: 592, height: 592 },
  ],
});
```

Also assert rejection below two images, above twelve images, outside the output
width range, and beyond the canvas pixel budget.

**Step 2: Run the test and verify RED**

Run:

```sh
npm test -- --run src/tools/photo-collage/collage.test.ts
```

Expected: FAIL because `collage.ts` and the geometry API do not exist.

**Step 3: Implement the minimal pure helpers**

Define `CollageLayout`, `CollageSettings`, `CellRect`, `layoutCollage`, and
`coverSourceRect`. Grid uses `ceil(sqrt(count))` columns, horizontal uses
`count` columns, and vertical uses one column. Calculate deterministic cells,
apply gaps only between cells, and throw plain errors for invalid bounds.

**Step 4: Run the focused test and verify GREEN**

Run the same Vitest command. Expected: all geometry tests pass.

### Task 2: Define and test the route lifecycle

**Files:**

- Create: `src/tools/photo-collage/PhotoCollageTool.test.tsx`
- Create: `src/tools/photo-collage/PhotoCollageTool.tsx`
- Create: `src/tools/photo-collage/index.ts`

**Step 1: Write the failing component tests**

Render English and Vietnamese variants. Select two image files, move the second
file earlier, start rendering, and assert the worker receives ordered buffers,
settings, and a transfer list. Simulate a worker result and assert preview and
download controls appear. Reset and unmount must revoke object URLs and
terminate the worker. Assert one-file rendering is rejected and Vietnamese copy
includes the privacy statement.

**Step 2: Run the component test and verify RED**

```sh
npm test -- --run src/tools/photo-collage/PhotoCollageTool.test.tsx
```

Expected: FAIL because the route component does not exist.

**Step 3: Implement the minimal component**

Use shared `ToolWorkspace`, `ToolPanel`, and `ToolActions`. Keep file records in
state with stable generated IDs. Use buttons for move earlier/later and remove.
Expose layout, fit mode, gap, background, width, and format controls. Start one
module worker per render; terminate on cancel/reset/unmount. Revoke the previous
preview URL before replacement and during cleanup.

**Step 4: Run the focused test and verify GREEN**

Run the component test until all lifecycle assertions pass without console
warnings.

### Task 3: Render in a cancellable worker

**Files:**

- Create: `src/tools/photo-collage/photo-collage.worker.ts`
- Modify: `src/tools/photo-collage/PhotoCollageTool.test.tsx`

**Step 1: Extend the failing worker-contract test**

Assert each image buffer is transferred, response IDs isolate stale results,
cancel terminates an active worker, and failed responses become an accessible
error.

**Step 2: Verify RED**

Run the component test and confirm the worker contract assertion fails because
the worker implementation/response handling is incomplete.

**Step 3: Implement rendering**

Decode each buffer with `createImageBitmap`, calculate layout, draw the
background, then draw each image with contain or cover geometry. Check the
operation ID/cancellation state between images. Export with
`canvas.convertToBlob({ type, quality: 0.9 })`, close all bitmaps in `finally`,
and post a result or bounded error message.

**Step 4: Verify GREEN and type safety**

```sh
npm test -- --run src/tools/photo-collage
npm run typecheck
```

Expected: focused tests and TypeScript pass.

### Task 4: Register and expose the tool

**Files:**

- Modify: `src/registry/tool-registry.test.ts`
- Modify: `src/registry/tool-catalog.ts`
- Modify: `src/registry/tool-registry.ts`
- Modify: `src/app/App.test.tsx`
- Modify: `docs/product-specs/index.md`

**Step 1: Write failing registry and shell tests**

Expect Media IDs `photo-cure` and `photo-collage`, two offline badges on the
Media hub, and direct-route heading `Photo collage`.

**Step 2: Verify RED**

```sh
npm test -- --run src/registry/tool-registry.test.ts src/app/App.test.tsx
```

Expected: FAIL because Photo Collage is still planned and has no lazy loader.

**Step 3: Register the ready route**

Set the existing catalog entry to `ready`, add only a dynamic import in the
runtime registry, and add the product specification to the shipped index.

**Step 4: Verify GREEN**

Run the registry and shell tests. Expected: both pass.

### Task 5: Browser and repository verification

**Files:**

- Modify: `docs/exec-plans/active/2026-07-24-all-tools.md`
- Move after all checks:
  `docs/exec-plans/active/2026-07-24-all-tools.md` to
  `docs/exec-plans/completed/2026-07-24-all-tools.md`

**Step 1: Run full verification**

```sh
npm run check
npm audit --omit=dev
```

Expected: tests, typecheck, build, and production dependency audit pass.

**Step 2: Inspect output and source invariants**

Confirm 41 static route documents, 41 dynamic tool imports, a separate collage
worker chunk, no collage network/persistence calls, and no leaked object URLs or
workers in lifecycle tests.

**Step 3: Test real Chromium**

Upload at least three generated sample images, reorder one, render grid and
horizontal outputs, verify preview/download and reset, exercise Vietnamese and
English copy, and confirm no requests beyond local Vite assets.

**Step 4: Record completion**

Update evidence with current counts, check Photo Collage, move the execution
plan to `completed/`, run `git diff --check`, and inspect the final diff.

