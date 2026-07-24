# PDF ↔ image

## Purpose

Render local PDF pages to PNG files or combine local PNG/JPEG images into a PDF.

## Inputs and limits

- PDF → PNG: one PDF up to 100 MB, a page expression, and 1×, 1.5×, or 2×
  render scale. At most 50 pages may be rendered per operation.
- Image → PDF: 1–50 PNG/JPEG images totaling no more than 100 MB, using either
  original image page dimensions or A4 contain layout.

Malformed, encrypted, unsupported, empty, and over-limit inputs are rejected.

## Output and lifecycle

A single selected PDF page produces `page-N.png`; multiple pages produce
`pdf-pages.zip`. Images produce `images.pdf`. PDF.js rendering uses its parsing
worker plus OffscreenCanvas inside a short-lived tool worker. Image embedding
uses PDF-lib in the same worker. Page rendering tasks and the worker can be
cancelled. All output URLs are revoked on replacement, reset, and unmount.

## Privacy and accessibility

Files remain in the browser; no network or persistent storage is used. Bilingual
semantic controls expose direction, files, range, scale/layout, convert, cancel,
reset, progress, errors, and download.

