# Mobile Photo Collage

Status: completed 2026-07-29

## Outcome

Make the existing photo collage editor usable at a 360px phone viewport without
regressing its desktop, keyboard, privacy, or worker-rendering behavior.

The work fixes three connected interaction models:

1. Reordering becomes visible, cancellable insertion instead of a blind swap.
2. The selected photo can be framed directly in the preview, while exact
   accessible controls remain synchronized with the gesture.
3. Mobile controls move into an accessible bottom sheet so the preview remains
   visible while settings change.

The 1,060-line component will be split along these interaction and presentation
boundaries rather than extended in place.

## Verified defects and baseline

- `PhotoCollageTool.tsx` uses `draggable`, `onDragStart`, `onDragOver`, and
  `onDrop`. Native HTML drag-and-drop does not supply the required touch
  interaction on iOS Safari or Android Chrome.
- Its pointer fallback stores a photo ID on a handle's `pointerdown` and swaps
  when any tile receives `pointerup`. It has no movement feedback, target
  indication, user-visible armed state, or explicit cancellation.
- Both `move` and `swap` exchange array positions. Dragging photo 5 onto photo 1
  therefore produces `5, 2, 3, 4, 1`, not the expected insertion order
  `5, 1, 2, 3, 4`.
- Per-photo zoom, horizontal focal point, and vertical focal point are three
  side-panel sliders. The spatial edit and its feedback are separated, and the
  sliders do not provide a practical exact-value path on touch.
- The component has one responsive utility, an `xl:grid-cols-*` declaration.
  At 360×800, the add panel starts around y=357, the empty preview around y=486,
  and settings around y=962. A populated photo list and layout controls push the
  preview farther down because they precede it in document order.
- The file input already uses `type="file"`, `multiple`, and image MIME
  acceptance. Keeping it without `capture` preserves access to the phone's
  camera roll instead of forcing a new camera image.
- The first full baseline test run had two unrelated application-route timeouts;
  the isolated application suite passed 23/23, and an immediate full rerun
  passed 86 files / 359 tests. No collage baseline failure reproduced.

## Dependency gate: dnd-kit

Adopt the stable `@dnd-kit/core` and `@dnd-kit/sortable` API rather than the
newer rewritten package line.

- This repository resolves React and React DOM 19.2.8.
- `@dnd-kit/core@6.3.1` declares React and React DOM `>=16.8.0`.
- `@dnd-kit/sortable@10.0.0` declares React `>=16.8.0` and core `^6.3.0`.
- An `npm install --dry-run` against this worktree completed without a peer
  warning or package change.
- A representative tree-shaken ESM build importing the required context,
  overlay, pointer/keyboard sensors, sortable hooks/strategy, `arrayMove`, and
  transform utility measured 48,424 bytes minified and 16,581 bytes gzip with
  React externalized.

The roughly 16.6KB gzip cost is accepted because it buys tested pointer,
keyboard, cancellation, ARIA, and live-announcement infrastructure. It remains
inside the already lazy-loaded photo-collage tool chunk, so it must not enter the
application shell. Add exact compatible ranges for:

- `@dnd-kit/core@^6.3.1`
- `@dnd-kit/sortable@^10.0.0`
- `@dnd-kit/utilities@^3.2.2`

The final production build will measure the actual collage chunk and confirm the
shell did not acquire these modules.

## Reorder interaction decision

Use one dnd-kit sortable list for touch, pen, mouse, and keyboard.

- `PointerSensor` activates from a dedicated 44px reorder handle after a small
  movement threshold. The handle uses the required touch-action rule without
  disabling page scrolling on the rest of the photo tile.
- `DragOverlay` keeps a thumbnail under the active pointer. Sortable transforms
  and an explicit insertion marker show the destination continuously.
- `KeyboardSensor` with sortable keyboard coordinates supports Space/Enter,
  arrow keys, drop, and Escape cancellation.
- `onDragEnd` removes the active item and inserts it at the target index.
  `arrayMove([1,2,3,4,5], 4, 0)` must yield `[5,1,2,3,4]`.
- A null target and `onDragCancel` do not mutate editor state.
- English and Vietnamese screen-reader instructions and start/over/end/cancel
  announcements replace the library's English defaults.
- Visible semantic move-earlier and move-later buttons remain as a simpler
  keyboard, switch-control, and screen-reader alternative. They call the same
  insertion helper and announce the resulting position.

HTML drag-and-drop and the ref-based pointer fallback will be removed completely;
there will not be two competing reorder implementations.

## Direct framing decision

Make the selected preview cell a direct manipulation surface in fill mode.

- One active pointer pans. The image follows the pointer, and movement is
  converted into focal coordinates using the displayed cell, natural image
  dimensions, current crop rectangle, and zoom.
- Two active pointers pinch. Zoom follows the distance ratio and preserves the
  source point under the pinch midpoint as closely as crop bounds allow.
- Pointer capture keeps an active gesture coherent. Pointer cancellation,
  lost capture, or Escape restores the transform captured at gesture start.
- Double-tap resets `{ zoom: 1, focalX: 0.5, focalY: 0.5 }`.
- A visible Reset framing button is the double-tap equivalent.
- Zoom, horizontal focal point, and vertical focal point retain their sliders.
  Each slider gains an adjacent numeric input. Gestures, ranges, numbers, reset,
  preview, and worker payload all read and update one clamped transform state.
- Fit mode keeps the stored framing values but disables gesture and exact
  framing controls with localized guidance because the whole image is visible.

Extract pure crop-to-preview and gesture math so unit tests can prove direction,
clamping, midpoint anchoring, cancellation state, and parity with
`fillSourceRectWithCrop`. Avoid a generic gesture dependency: the required
state is limited to two pointers and must integrate with the existing crop
model.

## Mobile bottom-sheet decision

At mobile widths, keep add photos, the preview, and the photo list on the page.
Render layout, framing, appearance, and export controls in one bottom sheet.
Desktop keeps its persistent three-region editor.

Use the existing `@headlessui/react@2.2.10` Dialog foundation. Its peer range
supports React 19 and it provides focus trapping, inert background content,
Escape/outside dismissal, scroll locking, and focus restoration.

- The sheet is fixed to the viewport bottom and bounded to roughly the lower
  half of a 360×800 viewport. Its content scrolls internally; the uncovered
  preview remains visibly above it and updates while controls change.
- Opening from touch or keyboard explicitly moves focus to the localized Close
  button. This is tested directly because the library intentionally avoids its
  default initial-focus move on touch devices.
- Tab and Shift+Tab remain inside the dialog. The page behind it is inert.
- Closing through the button, Escape, backdrop, or downward handle gesture
  restores focus to the exact opener.
- The sheet has a visible drag handle and a semantic Close button. Handle
  dragging has continuous feedback and a threshold; an insufficient drag or
  `pointercancel` restores the open position.
- The controls launcher sits with the preview. Before opening, the preview is
  brought into the uncovered viewport region when necessary.
- No nested sheets are introduced. The entire tool is never placed in the
  dialog.
- At 360px, controls fit the sheet width, touch targets meet the intended 44px
  size, and `document.documentElement.scrollWidth <= clientWidth`.

## Component boundaries

- `PhotoCollageTool.tsx`: editor state, local file lifecycle, worker
  orchestration, cancellation, and responsive composition.
- `PhotoCollagePhotoList.tsx`: dnd-kit context, sortable thumbnails, overlay,
  insertion feedback, localized announcements, selection/removal, and visible
  move controls.
- `PhotoCollagePreview.tsx`: live geometry, selectable cells, pointer tracking,
  direct framing, and preview/export crop parity.
- `PhotoCollageFramingControls.tsx`: synchronized sliders, numeric inputs,
  reset, fit-mode explanation, and validation.
- `PhotoCollageSettings.tsx`: layout, appearance, framing, and output control
  sections, reusable between desktop placement and the mobile sheet.
- `PhotoCollageBottomSheet.tsx`: Headless UI dialog, focus contract, drag
  handle, close paths, and bounded mobile presentation.
- `photo-collage-framing.ts`: pure transform, pan, pinch, and preview-placement
  math.
- `photo-collage-order.ts`: pure ID-to-index insertion helpers shared by
  dragging and buttons.

Shared view types and localized copy live beside these components. The renderer,
worker protocol, catalog registration, and lazy tool boundary remain unchanged
unless a type-only import needs adjustment.

## Implementation tasks

### 1. Specify and gate the design

- [x] Verify all six reported interaction and responsive defects in source and
  at 360×800.
- [x] Update `docs/product-specs/photo-collage.md` with insertion, direct
  framing, exact controls, bottom-sheet accessibility, camera-roll, responsive,
  keyboard, and privacy requirements.
- [x] Verify dnd-kit peer ranges against the installed React 19.2.8.
- [x] Measure a representative dnd-kit production bundle.
- [x] Record this amended execution plan before production changes.
- [x] Report the amended interaction model and plan before implementation.

### 2. Fix the ordering model test-first

- [x] Add failing `photo-collage-order.test.ts` cases for forward/backward
  insertion, same-index identity, missing IDs, and the required
  `5 → 1 = 5,1,2,3,4` example.
- [x] Run the focused test and retain its RED output.
- [x] Implement the smallest pure insertion helper and make move-earlier and
  move-later use it.
- [x] Run the focused test to GREEN.

### 3. Build accessible sortable thumbnails test-first

- [x] Add failing `PhotoCollagePhotoList.test.tsx` coverage for:
  - localized handle names and screen-reader instructions;
  - localized start, target, completion, and cancellation announcements;
  - pointer and keyboard callbacks both request insertion;
  - a null drop and Escape cancellation do not request a reorder;
  - visible move controls, disabled boundaries, selection, and removal.
- [x] Install the gated dnd-kit packages and update the lockfile.
- [x] Implement the sortable list with Pointer and Keyboard sensors,
  `DragOverlay`, and explicit insertion feedback.
- [x] Remove `draggable`, HTML drag events, ref-based arming, and swap logic from
  `PhotoCollageTool.tsx`.
- [x] Run list and existing component tests to GREEN.

### 4. Build framing math test-first

- [x] Add failing `photo-collage-framing.test.ts` cases for:
  - pan direction and focal-axis clamping;
  - pinch zoom clamping from 100–300%;
  - preservation of the pinch-midpoint source coordinate;
  - reset values and gesture-start restoration;
  - preview placement matching `fillSourceRectWithCrop`.
- [x] Run the focused test and retain its RED output.
- [x] Implement pure transform and placement helpers.
- [x] Run the focused test to GREEN.

### 5. Build direct preview manipulation test-first

- [x] Add failing `PhotoCollagePreview.test.tsx` coverage for:
  - selecting a photo without accidentally panning it;
  - one-pointer drag updates focal values continuously;
  - two touch pointers update zoom and focal values continuously;
  - double-tap requests reset;
  - pointer cancellation, lost capture, and Escape restore the initial
    transform;
  - fit mode does not activate framing gestures;
  - mouse and touch pointer types use the same transform callbacks.
- [x] Extract and implement `PhotoCollagePreview.tsx` with at most two captured
  pointers and localized direct-manipulation guidance.
- [x] Run preview and renderer tests to GREEN.

### 6. Synchronize exact framing controls test-first

- [x] Add failing `PhotoCollageFramingControls.test.tsx` coverage for:
  - each slider and number input reflects the same supplied transform;
  - range, numeric, gesture, and reset changes converge on the same state;
  - numeric values clamp and invalid intermediate input does not corrupt state;
  - Reset framing is keyboard-operable and localized;
  - fit mode disables controls and explains why in both locales.
- [x] Implement the extracted framing controls and connect them to the preview's
  shared transform update.
- [x] Extend the tool payload test to prove gesture-derived transforms reach the
  worker unchanged.
- [x] Run focused suites to GREEN.

### 7. Build the accessible bottom sheet test-first

- [x] Add failing `PhotoCollageBottomSheet.test.tsx` coverage for:
  - dialog name, visible handle, visible localized Close button;
  - focus moves inside after pointer and keyboard opening;
  - Tab and Shift+Tab remain trapped;
  - the page behind is inert while open;
  - Close, Escape, backdrop, and successful handle drag dismiss;
  - short/cancelled handle drags leave it open;
  - focus returns to the exact opener.
- [x] Implement the sheet with the existing Headless UI Dialog and explicit
  touch-device initial focus.
- [x] Extract `PhotoCollageSettings.tsx` and render the same controls in the
  desktop panel or mobile dialog without duplicating state.
- [x] Add responsive sizing, internal scrolling, and sheet animation that
  respects reduced motion.
- [x] Run focused suites to GREEN.

### 8. Compose the responsive editor test-first

- [x] Extend `PhotoCollageTool.test.tsx` first to cover:
  - add input remains multiple and accepts PNG/JPEG/WebP without forced capture;
  - page content retains preview and photo list outside the mobile sheet;
  - desktop and mobile controls drive the same state;
  - all existing selection, layout, fit/fill, aspect, gap, export, limits,
    object URL cleanup, and worker cancellation wiring survives extraction.
- [x] Apply mobile-first wrapping, padding, preview sizing, and control-launcher
  styles; restore the desktop three-region grid at the wide breakpoint.
- [x] Run every `src/tools/photo-collage` test to GREEN.

### 9. Verify actual browser interaction with Playwright MCP

- [x] Run the app and use Playwright MCP at 360×800.
- [x] Upload local PNG/JPEG fixtures through the actual input and confirm
  multiple camera-roll-style files are accepted.
- [x] With five distinct photos, drag photo 5 to position 1 by touch pointer and
  assert the visible order is exactly `5,1,2,3,4`; observe the overlay and
  insertion feedback during movement.
- [x] Cancel touch reordering and assert the order is unchanged. Repeat reorder
  with mouse and with keyboard only.
- [x] On a selected fill cell, dispatch a real two-pointer touch sequence and a
  one-pointer pan; observe preview movement and assert sliders/numeric inputs
  update. Double-tap and Reset must converge on the same values.
- [x] Inspect the accessibility tree and operate all gesture alternatives by
  keyboard: move controls, sliders/numbers, Reset, sheet launcher, and Close.
- [x] Open the sheet from touch and keyboard. Assert focus entry, Tab trapping,
  background inertness, Escape/Close dismissal, focus return, and that preview
  pixels remain visible in the uncovered viewport while a setting changes.
- [x] Assert `document.documentElement.scrollWidth <= clientWidth` and all
  critical control bounds stay within the 360px viewport.
- [x] Repeat a desktop smoke pass for the three-region layout and export flow.
- [x] Inspect browser requests and source for network or persistence additions.

### 10. Final regression and delivery

- [x] Run `npm test -- src/tools/photo-collage`.
- [x] Run `npm run check` and record test, typecheck, and build evidence.
- [x] Compare production chunks with baseline and confirm dnd-kit remains in the
  lazy collage chunk while rendering remains in its worker chunk.
- [x] Move this plan to `docs/exec-plans/completed/` with verification evidence.
- [x] Review the final diff for scope, bilingual copy, accessibility, privacy,
  and explicit non-goals.
- [x] Commit on `agent/mobile-photo-collage`, push, and open a new PR based on
  latest `main`.

## Capability regression matrix

| Capability | Required evidence |
| --- | --- |
| Templates for 2–12 images | Existing template unit tests remain green |
| Grid, horizontal, vertical layouts | Existing geometry and component tests |
| Fill and fit | Renderer plus component payload tests |
| Original, 1:1, 4:5, 16:9, 9:16 | Geometry and UI selection tests |
| Gap, background, corner radius | Renderer and worker payload tests |
| PNG/JPEG export | Component worker/download tests |
| 24 MP output guard | Existing validation tests |
| 25 MB per-file guard | Existing file validation tests |
| Worker cancellation | Existing cancel, reset, unmount, and stale-op tests |
| Browser-only privacy | Source audit and browser request inspection |
| Lazy loading | Production chunk inspection |

## Out of scope

- Filters and effects.
- Stickers or text overlays.
- A freeform crop rectangle or separate crop editor.
- Cloud sync, sharing, or analytics.
- New export formats.
- Renderer or worker redesign unrelated to preview/export crop parity.

## Completion record

Implementation completed on `agent/mobile-photo-collage`.

- TDD began from the existing swap assertion, which failed with
  `5,2,3,4,1`, before the insertion helper produced `5,1,2,3,4`. Subsequent
  RED stages covered missing sortable semantics, direct framing, synchronized
  numeric controls, the mobile sheet, mobile feedback, responsive preview
  placement, outside-list cancellation, localized announcements, and sheet
  drag cancellation. Some component-boundary cases were consolidated into the
  existing tool integration suite so the tests exercise real shared state
  rather than duplicate fixture components.
- The focused collage suite passes 5 files / 28 tests. The final
  `npm run check` passes 88 files / 368 tests, typecheck, and production build.
- Playwright MCP at 360×800 uploaded five local PNG fixtures through the actual
  multiple file input. Touch insertion showed a following overlay and marked
  target, then produced exactly `5,1,2,3,4`. Pointer cancel and release outside
  the list preserved order. Mouse Pointer Events and dnd-kit keyboard movement
  also reordered, with localized live-region output.
- Browser pan, pinch, pointer cancellation, and double-tap reset changed the
  selected preview continuously. The sliders and numeric inputs reflected the
  same `100–300 / 0–100 / 0–100` state. Review caught and tests fixed an
  output-pixel/CSS-pixel mismatch; preview placement is now cell-relative and
  stays in parity with the worker crop as the responsive cell scales.
- The open 360px sheet left 305px of the 320px preview visible, focused Close,
  trapped Tab/Shift+Tab, made the background inert, restored opener focus, and
  supported Close, Escape, and its 44px drag/activation handle. Reorder, move,
  remove, handle, and Close targets measured at least 44px. The document
  remained 360px wide with no horizontal overflow.
- A 1440px smoke pass retained the three-region layout. A real worker export
  completed at 1200×1200 and produced the PNG download.
- Runtime source audit found no network, analytics, telemetry, or persistence
  additions. The production build keeps dnd-kit only in the lazy
  `photo-collage` chunk (88.27KB, 27.75KB gzip); rendering remains in the
  separate 4.52KB photo-collage worker chunk.
- `PhotoCollageTool.tsx` is 718 lines, down from 1,060, with list, preview,
  framing, settings, sheet, ordering, and framing math split into focused
  modules.
- Independent review found seven concrete interaction/accessibility issues.
  All were fixed with regression tests; the final re-review reported no
  remaining findings.
