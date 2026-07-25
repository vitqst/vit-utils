# UUID / ULID / NanoID

## Purpose

Generate local identifiers from the browser's cryptographically secure random
source.

## Behavior

- Generate RFC 9562 UUID v4 values with version/variant bits set.
- Generate RFC 9562 UUID v7 values with a 48-bit Unix millisecond timestamp,
  version/variant bits, and cryptographically random remaining bits.
- Generate 26-character Crockford Base32 ULIDs with a 48-bit millisecond time
  prefix and 80 random bits. Repeated calls in one millisecond increment the
  random suffix monotonically.
- Generate URL-safe NanoIDs with configurable length.
- Generate 1–1,000 values at a time, validate length/count limits, and allow
  individual or bulk copy/download.
- Never use `Math.random`.

UUID v7 values and ULIDs reveal their creation timestamp. Identifiers are
generated locally and are not registered with any external service.

## Accessibility and localization

- Type/count/length controls, generate action, result list, and copy/download
  actions are semantic.
- English and Vietnamese copy ship together.
