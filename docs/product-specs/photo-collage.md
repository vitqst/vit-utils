# Photo Collage

## Purpose

Arrange a small ordered set of local photos in a live collage editor and export
one image without uploading or persisting source images or derived data.

## Primary flow

1. Select 2–12 PNG, JPEG, or WebP images, up to 25 MB each.
2. Review local thumbnails and reorder, select, or remove images. Dragging works
   with touch, pen, or mouse; move-earlier and move-later buttons provide the
   complete keyboard path.
3. Choose one of the suggested layouts for the current image count.
4. Choose aspect ratio, fill or fit, spacing, background, corner radius, output
   width, and PNG or JPEG.
5. Select an image cell and frame it directly by dragging to pan, pinching to
   zoom, or double-tapping to reset. Sliders and numeric inputs expose the same
   values for keyboard, screen-reader, and precise editing.
6. Review the live local preview.
7. Export in a cancellable worker and download the result.

## Behavior

- The tool suggests deterministic balanced and asymmetric rectangular templates
  for 2–12 images; it does not claim AI-generated suggestions.
- Aspect options are original, 1:1, 4:5, 16:9, and 9:16. Original follows the
  selected template's natural aspect.
- Fill crops a source using its selected zoom and focal point. Fit preserves the
  whole source and leaves the selected background visible.
- Output width is 320–4096 pixels, spacing and corner radius are 0–128 pixels,
  zoom is 100–300%, focal axes are 0–100%, and total canvas area is capped at
  24 megapixels.
- A new render replaces and revokes the previous preview URL.
- Cancel, reset, unmount, and stale-operation handling terminate worker work.
- Failures identify invalid file types, size/count limits, invalid dimensions,
  image decode failures, and unavailable browser canvas features.

## Photo ordering

- Reordering is insertion, not swapping. Moving the fifth photo to the first
  position produces `5, 1, 2, 3, 4`; the photos between the old and new
  positions shift by one.
- A thumbnail preview follows touch, pen, or mouse movement continuously, and
  the destination position is visibly marked.
- Releasing over a valid position commits the reorder. Releasing outside the
  list or cancelling the gesture leaves the order unchanged.
- Reordering never depends on dragging. Each photo exposes semantic
  move-earlier and move-later buttons with disabled boundary states, and order
  changes are announced through a localized live region.

## Direct photo framing

- Direct framing is available on the selected preview cell in fill mode. A
  one-pointer drag pans the image, a two-pointer pinch zooms around the gesture
  midpoint, and a double-tap resets zoom and focal position.
- The content follows the pointer while panning. Zoom is clamped to 100–300% and
  focal axes to 0–100%, matching export validation.
- Gesture updates and exact controls share one transform state. The zoom,
  horizontal focal point, and vertical focal point sliders visibly track direct
  manipulation, and each slider has an adjacent numeric input with the same
  range and localized label.
- A visible Reset framing button is the single-pointer, keyboard, and
  screen-reader equivalent of double-tap. Sliders and numeric inputs are the
  non-gesture equivalent of pan and pinch.
- Pointer cancellation or Escape during an active framing gesture restores the
  transform from the start of that gesture. Fit mode preserves the stored
  transform but disables framing controls with a localized explanation because
  fit displays the complete source image.
- The preview and worker render use the same crop geometry so direct framing
  does not promise a different crop from the exported image.

## Mobile layout and controls

- The add-photo control uses a multiple image file input that opens the device's
  normal photo picker. It does not force camera capture, so users can choose
  existing camera-roll photos or any other local image source offered by the
  device.
- The mobile page contains the add action, preview, and photo list. Layout,
  framing, appearance, and export controls open in one bottom sheet; the whole
  tool is never placed in the sheet.
- At 360 CSS pixels wide, the preview remains visible above the open sheet while
  controls update it. The sheet has a bounded viewport-relative height and its
  own vertical scrolling, while the page has no horizontal overflow.
- Opening the sheet moves focus inside it and makes the page behind it inert.
  Tab and Shift+Tab remain trapped in the sheet. Closing restores focus to the
  control that opened it.
- The sheet has a visible drag handle and a semantic Close button. Swiping the
  handle down, pressing Escape, activating Close, or activating the backdrop can
  dismiss it; no gesture is the only route to an action.
- Sheet opening and dismissal are exposed as a localized dialog to assistive
  technology. Touch opening receives the same explicit focus movement as
  keyboard opening.
- Controls wrap within the 360px viewport and new touch targets are at least
  44×44 CSS pixels where space permits.
- Larger viewports retain the three-region editor: photos and layouts, preview,
  and settings. The bottom sheet is a mobile presentation of the same control
  state, not a second editor.

## Privacy and accessibility

- Source bytes, thumbnails, editing data, previews, and exports stay in browser
  memory.
- The tool makes no network requests and uses no browser persistence. Adding
  photos never implies an upload.
- Pointer reordering supplements semantic move-earlier/move-later controls; it
  never replaces keyboard-accessible ordering.
- Every control has a visible label. Status and errors use live regions, and the
  preview has localized alternative text.
- English and Vietnamese copy ship together.

## Design references

- [Nielsen Norman Group: Bottom Sheets](https://www.nngroup.com/articles/bottom-sheet/)
- [Nielsen Norman Group: Slider Design](https://www.nngroup.com/articles/gui-slider-controls/)
- [UXmatters: Designing for Touch](https://www.uxmatters.com/mt/archives/2020/02/designing-for-touch.php)
- [TestParty: Mobile Accessibility Patterns](https://testparty.ai/blog/mobile-accessibility-patterns)
- [Puck: Drag-and-Drop Libraries for React](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)

## Non-goals

- Carousel slides, freeform layers, text, stickers, filters, AI layout claims,
  accounts, cloud storage, and remote image URLs.
- A freeform crop rectangle or separate crop screen, sharing, and additional
  export formats.
- Animated image output or preservation of image metadata.
- Color-profile conversion beyond browser canvas behavior.
