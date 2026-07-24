# Merge / split PDF

## Purpose

Merge local PDF documents in file order, or extract selected pages from one PDF.

## Inputs and limits

- Merge: 2–20 PDF files in the order shown.
- Split: one PDF and a page expression such as `1-3, 5, last`.
- Optional clockwise rotation of 0°, 90°, 180°, or 270°.
- Maximum 100 MB across selected files.

Page expressions are one-based, preserve the written order, remove duplicates,
and reject pages outside the document. Encrypted and malformed PDFs are rejected.

## Output and lifecycle

The tool produces one local `merged.pdf` or `extracted.pdf`. Loading, copying,
rotation, and saving happen in a short-lived cancellable module worker. Progress
is reported per source document and copied page. Result URLs are revoked on
replacement, reset, and unmount.

## Privacy and accessibility

PDF bytes remain in the browser and are transferred only to the local worker. No
network or persistent-storage API is used. Every operation has semantic file,
mode, range, rotation, generate, cancel, reset, status, error, and download
controls with English and Vietnamese copy.

