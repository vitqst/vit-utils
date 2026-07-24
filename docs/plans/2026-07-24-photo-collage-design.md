# Photo Collage Design

## Product shape

Photo Collage combines 2–12 local images into one downloadable image. It is a
single-purpose grid composer, not a freeform graphics editor. Users can choose
grid, horizontal, or vertical layout; move each image earlier or later with
semantic buttons; choose fill or fit; set gap, background, output width, and
PNG or JPEG; then render, cancel, reset, preview, and download. English and
Vietnamese labels ship together.

Fixed social-media templates were rejected because they make the tool useful
only for a few platforms and require ongoing dimension churn. A freeform canvas
was rejected because pointer placement, text, layers, and arbitrary transforms
would turn the tool into a substantially larger editor. Deterministic presets
cover the common job while remaining keyboard accessible.

## Architecture and data flow

The React route owns ordered `File` records, settings, status, worker lifetime,
and the preview object URL. Pure layout helpers calculate canvas and cell
rectangles, validate bounds, and preserve aspect ratio for fit/fill drawing.
Those helpers are independently tested.

Rendering runs in `photo-collage.worker.ts`. The component transfers image
buffers and a compact settings object. The worker decodes with
`createImageBitmap`, draws to `OffscreenCanvas`, checks cancellation between
decode and draw steps, exports a PNG or JPEG `Blob`, closes every bitmap, and
returns the blob. Cancel/reset/unmount terminate the worker. Replacing or
clearing a result revokes the previous object URL.

The worker never reads paths, performs network requests, or persists source or
derived data. The component rejects unsupported types, more than 12 files,
files above 25 MB each, output widths outside 320–4096 pixels, and estimated
canvas dimensions above the configured pixel budget before starting work.

## Interaction, errors, and verification

The file input accepts common browser-decodable image formats. The ordered file
list exposes filename, move earlier, move later, and remove controls; button
disabled states make list boundaries clear without drag-and-drop. Rendering
requires at least two images. Status and failures use live regions, and the
preview has descriptive alternative text.

Pure tests cover grid geometry, row/column presets, fit/fill source rectangles,
and dimension limits. Component tests cover file selection, ordering, the
worker transfer contract, cancellation, bilingual copy, worker termination,
and object-URL revocation. Registry and shell tests prove the route remains
lazy-loaded and both Media tools appear on the group hub. A real Chromium test
uploads sample images, renders a collage, checks the preview/download, tests
reset, and confirms there are no outbound requests.

