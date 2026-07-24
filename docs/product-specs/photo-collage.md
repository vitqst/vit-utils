# Photo Collage

## Purpose

Combine a small ordered set of local photos into one downloadable collage
without uploading the source images.

## Primary flow

1. Select 2–12 PNG, JPEG, or WebP images, up to 25 MB each.
2. Review the ordered file list and move or remove images with buttons.
3. Choose grid, horizontal, or vertical layout.
4. Choose fill or fit, gap, background, output width, and PNG or JPEG.
5. Render in a cancellable worker.
6. Preview and download the result.

## Behavior

- Grid uses approximately square rows and columns. Horizontal uses one row;
  vertical uses one column.
- Cells are square. Fill crops each source around its center. Fit preserves the
  whole source and leaves the selected background visible.
- Output width is 320–4096 pixels, gap is 0–128 pixels, and total canvas area is
  capped at 24 megapixels.
- A new render replaces and revokes the previous preview URL.
- Cancel, reset, unmount, and stale-operation handling terminate worker work.
- Failures identify invalid file types, size/count limits, invalid dimensions,
  image decode failures, and unavailable browser canvas features.

## Privacy and accessibility

- Source bytes and the rendered collage stay in browser memory.
- The tool makes no network requests and uses no browser persistence.
- Files are ordered with semantic move-earlier/move-later buttons rather than
  pointer-only drag interactions.
- Every control has a visible label. Status and errors use live regions, and the
  preview has localized alternative text.
- English and Vietnamese copy ship together.

## Non-goals

- Freeform positioning, layers, text, stickers, filters, and remote image URLs.
- Animated image output or preservation of image metadata.
- Color-profile conversion beyond browser canvas behavior.

