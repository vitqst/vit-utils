# Photo Collage Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Pixlr-like core collage editor whose files, previews, editing data, and exports remain entirely in the browser.

**Architecture:** Represent suggested layouts as normalized rectangular templates shared by the live React preview and the export worker. Keep object URLs and editor state in the tool component, while decode, crop, clipping, and encoding remain in the cancellable worker.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Web Workers, OffscreenCanvas, Vitest, Testing Library.

---

### Task 1: Specify the expanded product

**Files:**
- Modify: `docs/product-specs/photo-collage.md`
- Create: `docs/exec-plans/active/2026-07-25-photo-collage-editor.md`

1. Document templates, live preview, aspect ratios, rounded cells, and per-photo crop controls.
2. Record the explicit no-network and no-persistence invariants.
3. Add an execution checklist and verification evidence placeholders.

### Task 2: Add template and crop geometry

**Files:**
- Modify: `src/tools/photo-collage/collage.test.ts`
- Modify: `src/tools/photo-collage/collage.ts`

1. Write failing tests for deterministic suggestions, aspect output dimensions,
   normalized template scaling, and focal crop math.
2. Run `npm test -- --run src/tools/photo-collage/collage.test.ts` and confirm
   the new assertions fail because the APIs do not exist.
3. Add the smallest typed geometry API that passes.
4. Re-run the focused tests and refactor only while green.

### Task 3: Expand worker rendering

**Files:**
- Modify: `src/tools/photo-collage/photo-collage-render.test.ts`
- Modify: `src/tools/photo-collage/photo-collage-render.ts`
- Modify: `src/tools/photo-collage/photo-collage.worker.ts`

1. Write failing tests for template cells, rounded clipping, aspect ratios, and
   per-image zoom/focal position.
2. Run the renderer tests and confirm expected failures.
3. Implement canvas save/clip/restore and shared crop geometry.
4. Re-run renderer and worker tests.

### Task 4: Build the live editor

**Files:**
- Modify: `src/tools/photo-collage/PhotoCollageTool.test.tsx`
- Modify: `src/tools/photo-collage/PhotoCollageTool.tsx`

1. Write failing interaction tests for local thumbnails, immediate template and
   aspect updates, selected-photo adjustments, accessible reordering, and the
   complete export worker payload.
2. Confirm failures with
   `npm test -- --run src/tools/photo-collage/PhotoCollageTool.test.tsx`.
3. Implement the responsive three-region editor with English and Vietnamese
   copy, object-URL cleanup, pointer drag swapping, and keyboard controls.
4. Re-run component and all photo-collage tests.

### Task 5: Verify privacy, quality, and documentation

**Files:**
- Modify: `docs/exec-plans/active/2026-07-25-photo-collage-editor.md`
- Move after verification:
  `docs/exec-plans/active/2026-07-25-photo-collage-editor.md` to
  `docs/exec-plans/completed/2026-07-25-photo-collage-editor.md`

1. Run `npm run check`.
2. Audit the tool for network and persistence APIs with `rg`.
3. Inspect build output for a lazy collage chunk and worker chunk.
4. Exercise the editor in a browser at desktop and narrow widths.
5. Record evidence and move the execution plan to completed.
