# HMAC

## Purpose

Calculate and verify a keyed HMAC signature locally with Web Crypto.

## Inputs and behavior

- HMAC-SHA-256, HMAC-SHA-384, and HMAC-SHA-512.
- Secret key encoding: UTF-8, hexadecimal, or Base64.
- Message encoding: UTF-8, hexadecimal, or Base64.
- Output: lowercase hexadecimal or Base64.
- Optional expected signature is decoded in the selected output encoding and
  compared in constant time.
- Key and message inputs are limited to 1 MB decoded each. Empty keys are
  rejected; empty messages are valid.

Malformed hex/Base64, oversized data, and output-length mismatches are rejected.

## Privacy and accessibility

Web Crypto performs signing asynchronously in the browser. Secrets are not
logged, copied automatically, downloaded, persisted, or sent over a network.
Clear/reset removes key, message, expected signature, and result from state.
English and Vietnamese controls expose secret visibility, encodings, algorithm,
calculate, verify, copy, download, clear, errors, and results.

