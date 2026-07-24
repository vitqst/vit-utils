# File checksum

## Purpose

Calculate and verify a checksum for one local file without uploading it.

## Inputs and algorithms

- One local file up to 500 MB.
- SHA-256, SHA-384, SHA-512, SHA-1, or MD5.
- Optional expected checksum as bare hexadecimal, GNU format
  (`hex *filename`), or BSD format (`SHA256 (filename) = hex`).

SHA-1 and MD5 are labeled legacy and are provided for compatibility checks, not
new security designs. Expected values must have the correct hexadecimal length
for the selected algorithm and are compared without timing-dependent early exit.

## Output and lifecycle

The file is read in 1 MB slices. Each buffer is transferred to a short-lived
module worker and acknowledged before the next slice is read, bounding live
memory. The worker incrementally updates an audited hash implementation and
reports progress. Processing can be cancelled between chunks. The result can be
copied or downloaded as a GNU-compatible checksum file.

## Privacy and accessibility

File bytes remain in the browser. No network, object URL, or persistent storage
is used. English and Vietnamese semantic controls expose file, algorithm,
expected value, calculate, cancel, reset, progress, result, verification state,
copy, and download.

