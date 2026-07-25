# Photo Collage

## Purpose

Arrange a small ordered set of local photos in a live collage editor and export
one image without uploading or persisting source images or derived data.

## Primary flow

1. Select 2–12 PNG, JPEG, or WebP images, up to 25 MB each.
2. Review local thumbnails and move, drag-swap, select, or remove images.
3. Choose one of the suggested layouts for the current image count.
4. Choose aspect ratio, fill or fit, spacing, background, corner radius, output
   width, and PNG or JPEG.
5. Select an image cell to adjust its zoom and horizontal/vertical focal point.
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

## Privacy and accessibility

- Source bytes, thumbnails, editing data, previews, and exports stay in browser
  memory.
- The tool makes no network requests and uses no browser persistence. Adding
  photos never implies an upload.
- Pointer drag swapping supplements semantic move-earlier/move-later controls;
  it never replaces keyboard-accessible ordering.
- Every control has a visible label. Status and errors use live regions, and the
  preview has localized alternative text.
- English and Vietnamese copy ship together.

## Non-goals

- Carousel slides, freeform layers, text, stickers, filters, AI layout claims,
  accounts, cloud storage, and remote image URLs.
- Animated image output or preservation of image metadata.
- Color-profile conversion beyond browser canvas behavior.
