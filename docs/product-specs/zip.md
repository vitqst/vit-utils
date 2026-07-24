# Zip / unzip

## Purpose

Create a ZIP from local files or safely inspect and repackage files from a local
ZIP archive.

## Inputs and limits

- Create: 1–500 files totaling at most 250 MB.
- Extract: one ZIP file up to 250 MB.
- At most 1,000 non-directory archive entries and 500 MB uncompressed output.
- At most 250 MB per extracted file and a maximum 100:1 expansion ratio for
  files larger than 1 MB.

Before decompression, the central directory is checked. Absolute paths, drive
paths, `..` traversal, null bytes, encryption, ZIP64 placeholders, unsupported
compression, malformed directory records, duplicate normalized paths, and limit
violations are rejected.

## Output and lifecycle

Creation produces `archive.zip`. Extraction shows safe entry names and produces
`extracted-files.zip`, a clean archive containing only normalized regular files.
Compression/decompression uses a cancellable short-lived module worker. Result
URLs are revoked on replacement, reset, and unmount.

## Privacy and accessibility

File bytes remain in the browser. No network or persistent storage is used.
Bilingual semantic controls expose mode, file selection, generate/extract,
cancel, reset, entry list, progress, errors, and download.

