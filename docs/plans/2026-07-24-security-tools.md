# Security Tools Implementation Plan

**Goal:** Ship all five Security tools with explicit algorithm limitations,
local secret handling, and one narrowly reviewed HIBP prefix-network exception.

**Architecture:** Reuse audited `@noble/hashes` primitives for text digests.
Run zxcvbn-ts with common/English dictionaries in a lazy module worker. Hash HIBP
passwords locally and make one user-triggered padded five-character range request
with no referrer, credentials, caching, retries, or persistence. Parse X.509
locally with `@peculiar/x509` in a worker. Use Web Crypto for HMAC and never retain
secrets beyond component state.

### Task 1: Text hashes and password strength

- Add specs and tests for UTF-8 SHA-256/384/512, SHA-1, MD5, format
  identification, password score labels, feedback, and length limits.
- Build the hash UI from shared checksum primitives.
- Configure zxcvbn-ts common/English dictionaries inside a cancellable worker;
  do not log, persist, or expose the password; register, build, and commit.

### Task 2: HIBP breach check and network boundary

- Add a product spec and dedicated design/security review before implementation.
- Expand privacy metadata and shell badges so HIBP never claims local-only or
  offline behavior; update the CSP only for `https://api.pwnedpasswords.com`.
- Test local SHA-1 prefix/suffix derivation, response parsing, zero-count padding,
  explicit-click-only fetch, request options, cancellation, errors, and clearing.
- Send only the first five uppercase SHA-1 characters with `Add-Padding: true`,
  immediately discard unrelated suffixes, register, browser-audit, and commit.

### Task 3: X.509 decoder and HMAC

- Add specs and tests for PEM/DER normalization, certificate fields, extensions,
  validity state, fingerprints, UTF-8/hex/base64 key/input encodings, and Web
  Crypto signatures.
- Parse certificates in a cancellable worker with strict 5 MB input limits.
- Calculate HMAC-SHA-256/384/512 locally with copy/download and constant-time
  verify controls; register, build, and commit.

### Task 4: Security group verification

- Add the five-item group hub and direct-route shell coverage, including the
  HIBP network badge and one external-request indicator.
- Update shipped specs and the active execution plan.
- Run `npm run check`; browser-test primary/error flows, audit all routes, lazy
  chunks, workers, secrets, persistence, outbound hosts, CSP, cancellation, and
  production dependencies.
- Commit as `test(security): verify complete tool group`.

