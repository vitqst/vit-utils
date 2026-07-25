# Photo Collage Editor

## Outcome

Replace the basic render form with a live, Pixlr-like core collage editor that
works entirely offline and never uploads or persists user images.

## Scope

- [x] Deterministic layout suggestions for 2–12 photos.
- [x] Live local preview with direct photo selection.
- [x] Pointer drag swapping plus semantic reorder controls.
- [x] Original, 1:1, 4:5, 16:9, and 9:16 aspect ratios.
- [x] Spacing, background, corner radius, fill/fit, and output controls.
- [x] Per-photo zoom and horizontal/vertical focal position.
- [x] Cancellable PNG/JPEG worker export.
- [x] English and Vietnamese copy.
- [x] Responsive and keyboard-accessible editor.

## Privacy invariants

- [x] No image bytes or derived data cross the browser boundary.
- [x] No network, analytics, persistence, or remote asset APIs are added.
- [x] All object URLs are revoked on replacement, removal, reset, and unmount.

## Verification evidence

- Baseline: the initial root `npm test` scanned both the repository and its
  worktree (172 files / 686 tests); the effective baseline was 86 files / 343
  tests.
- Focused RED/GREEN cycles covered templates, aspect geometry, focal crops,
  rounded worker clipping, local previews, drag/drop, pointer and semantic
  ordering, export payloads, URL cleanup, stale/unmounted operations, and
  localized errors. Final focused result: 3 files / 19 tests passed.
- `npm run check`: 86 files / 353 tests passed, TypeScript passed, and the Vite
  production build completed.
- Source privacy audit: no fetch, XHR, WebSocket, beacon, storage, IndexedDB, or
  remote URL reference exists under `src/tools/photo-collage/`.
- Browser verification: two local PNG files produced an immediate live preview
  and a downloadable 1200×1200 PNG; the resource timeline contained no external
  request. All controls had accessible names, no duplicate IDs were present,
  and a 390px emulation selected the single-column responsive layout without
  document overflow.
- Build chunk inspection: the tool remains lazy in
  `photo-collage-DVe6MvTT.js`; rendering remains isolated in
  `photo-collage.worker-fuAASFZY.js`.
- Independent review found no critical issue. Important lifecycle, preview
  fidelity, touch ordering, clipping capability, visible-label, and localization
  findings were fixed before the final check.
