# Breach check (HIBP)

## Purpose

Check whether a password has appeared in the Have I Been Pwned Pwned Passwords
corpus without sending the password or its complete hash.

## Privacy-preserving request

On explicit button activation only:

1. UTF-8 password bytes are SHA-1 hashed locally.
2. The browser sends one HTTPS GET to
   `https://api.pwnedpasswords.com/range/{first-five-hex-characters}`.
3. The request includes `Add-Padding: true`, no credentials, no referrer, no
   cache, no redirects, and an abort signal.
4. The returned 35-character suffixes are compared locally. Zero-count padding
   and unrelated suffixes are immediately discarded.

HIBP documents this five-character k-anonymity protocol and recommends checking
only after the complete password has been entered:
[Pwned Passwords API](https://haveibeenpwned.com/API/v3#PwnedPasswords).

## Inputs, output, and errors

- One password from 1–256 Unicode code points.
- Result: not found, or found with the observed breach count.
- The result does not prove a password is safe or identify which account used it.
- Cancel aborts the request. Offline, CORS, malformed, oversized, 429, and 5xx
  responses produce actionable errors without retrying another service.
- Clear removes the password and result from component state.

## Network and storage boundary

This is the only non-local tool. Its route and group badges disclose the HIBP
prefix request and the sidebar reports one possible external request. The exact
exception is approved in
[the HIBP security review](../design-docs/hibp-security-review.md).
Neither password, full hash, response, nor result is logged or persisted.

