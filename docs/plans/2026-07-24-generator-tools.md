# Generator Tools Implementation Plan

**Goal:** Ship all seven Generator tools as bilingual, validated, lazy-loaded
browser modules with downloadable local output.

**Architecture:** Use Web Crypto for identifiers and passwords. Keep mock-data
and metadata generation pure and deterministic when seeded. Load `qrcode` and
`jsbarcode` only in their respective tool chunks. Run favicon resizing and ZIP
assembly in a cancellable module worker using `OffscreenCanvas` and `fflate`;
keep selected image bytes and object URLs in component/worker lifetime only.

### Task 1: IDs and password generator

- Add product specs and test-first modules under `src/tools/ids/` and
  `src/tools/password/`.
- Generate UUID v4, monotonic-sortable ULID, NanoID, passwords, and passphrases
  exclusively from `crypto.getRandomValues`.
- Validate lengths/counts, guarantee selected character classes when feasible,
  expose entropy estimates, then register and commit.

### Task 2: QR code and barcode

- Install `qrcode@^1.5.4`, `jsbarcode@^3.12.3`, and their TypeScript declarations.
- Add test-first lazy tools for text/URL/Wi-Fi/contact QR payloads with SVG/PNG
  downloads and Code 128, EAN-13, UPC-A, Code 39, and ITF-14 SVG barcodes.
- Validate format-specific input, colors, sizing, and library errors; register
  and commit.

### Task 3: Mock data and metadata preview

- Add test-first pure generators for seeded names/addresses/dates/records and for
  escaped HTML meta/Open Graph/Twitter tags.
- Add bilingual configuration, JSON/CSV output, social-card preview, copy, and
  download interfaces; register and commit.

### Task 4: Favicon set

- Install `fflate@^0.8.3`.
- Specify accepted images, output sizes, manifest/browserconfig files, ZIP
  contents, progress, cancellation, reset, and object-URL cleanup.
- Test manifest/HTML generation plus worker protocol and component lifecycle.
- Implement resize/PNG/ZIP work in a cancellable module worker, register, build,
  and commit.

### Task 5: Generator group verification

- Add group-hub and all-seven direct-route shell coverage.
- Update the shipped spec index and active execution plan.
- Run `npm run check`; audit static routes, lazy chunks, workers, object URLs,
  network APIs, persistence, and cancellation.
- Commit as `test(generators): verify complete tool group`.

