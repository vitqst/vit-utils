# CSV ↔ XLSX

## Purpose

Convert one local UTF-8 CSV file to XLSX or the first worksheet of an XLSX file
to CSV.

## Behavior and limits

- CSV parsing supports commas, quoted fields, escaped quotes, CRLF/LF line
  endings, embedded newlines, and a leading UTF-8 BOM.
- XLSX conversion preserves string, number, boolean, date, and empty cell display
  values. Formula code is never executed.
- The selected file may be at most 50 MB. A conversion may contain at most
  100,000 cells and 10,000 rows.
- The first ten rows are returned for an accessible local preview.

Malformed encodings, CSV quote errors, empty workbooks, and excessive inputs are
rejected.

## Output and lifecycle

CSV produces `converted.xlsx`; XLSX produces UTF-8 `converted.csv`. Parsing and
writing run in a cancellable short-lived module worker. Output URLs are revoked
on replacement, reset, and unmount.

## Privacy and accessibility

Spreadsheet bytes remain in the browser. No network or persistent-storage API is
used. Direction, file, convert, cancel, reset, preview, error, status, and
download controls include English and Vietnamese copy.

