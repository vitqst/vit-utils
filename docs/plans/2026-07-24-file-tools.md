# Files & Documents Implementation Plan

**Goal:** Ship all five Files & Documents tools as bilingual, lazy, local-only
browser modules with bounded inputs, cancellable workers, and downloadable
outputs.

**Architecture:** Use `pdf-lib` for structural PDF manipulation and image-to-PDF,
and `pdfjs-dist` with an OffscreenCanvas factory for PDF rendering. Use
`read-excel-file` and `write-excel-file` for browser-native XLSX conversion.
Reuse `fflate` for ZIP work and use incremental `@noble/hashes` instances for
checksums. Transfer file buffers into short-lived module workers and revoke every
result object URL on replacement, reset, and unmount.

### Task 1: Merge / split PDF

- Add product spec and pure page-range parsing tests.
- Add worker protocol and component lifecycle tests.
- Merge ordered PDFs; extract selected page ranges; rotate selected output pages.
- Reject encrypted, malformed, oversized, or page-less input with actionable
  bilingual errors; register, build, and commit.

### Task 2: PDF ↔ image

- Specify PDF-to-PNG and PNG/JPEG-to-PDF inputs, scale/page limits, progress,
  cancellation, and ZIP behavior.
- Render selected PDF pages to PNG on OffscreenCanvas and ZIP multi-page results.
- Embed one or more local images into page-sized PDFs using contain/cover sizing;
  register, build, and commit.

### Task 3: CSV ↔ XLSX and ZIP / unzip

- Test RFC 4180-style CSV parsing/serialization, spreadsheet cell normalization,
  archive-path sanitization, duplicate names, and output limits.
- Convert CSV to XLSX and the first XLSX sheet to UTF-8 CSV in workers.
- Create ZIPs from local files and inspect/extract safe non-directory entries
  into a ZIP result, rejecting traversal, absolute paths, bombs, and excess
  files; register, build, and commit.

### Task 4: File checksum

- Test incremental SHA-256, SHA-384, SHA-512, SHA-1, and MD5 vectors plus
  checksum-file parsing and verification.
- Stream transferred file chunks through a cancellable worker and expose copy,
  download, verify, reset, and progress controls; register, build, and commit.

### Task 5: Files group verification

- Add the five-item group hub and direct-route shell coverage.
- Update shipped specs and the active execution plan.
- Run `npm run check`; audit all routes, lazy chunks, workers, object URLs,
  network/persistence APIs, cancellation, archive safeguards, and production
  dependencies.
- Commit as `test(files): verify complete tool group`.
