# X.509 decoder

## Purpose

Decode a local PEM or DER X.509 certificate and inspect its identity, validity,
algorithms, fingerprint, and extensions.

## Inputs and limits

- Paste one PEM `CERTIFICATE` block, or select a `.pem`, `.crt`, or `.cer` file.
- DER and PEM files are detected by content, not trusted by extension alone.
- Maximum input size is 5 MB.

Private-key PEM blocks, certificate chains, malformed Base64/ASN.1, empty inputs,
and excessive files are rejected.

## Output and lifecycle

The result includes subject, issuer, serial number, UTC validity bounds, current
validity state, signature and public-key algorithms, SHA-256 fingerprint,
self-signed status, and extension OIDs/critical flags. Parsing, fingerprinting,
and signature self-checking run in a short-lived cancellable worker using
`@peculiar/x509`. Reset and unmount terminate the worker and clear results.

Decoding fields does not establish trust, revocation status, hostname validity,
or a chain to a trusted root; the UI states this explicitly.

## Privacy and accessibility

Certificate bytes remain in the browser and are not persisted. Bilingual
semantic controls expose source mode, PEM/file input, decode, cancel, reset,
status, errors, fields, and extensions.

