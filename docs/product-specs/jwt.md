# JWT Decoder

## Job

Inspect a JSON Web Token's header, payload, signature segment, and time-based
claims locally without implying that the signature is valid.

## Core flows

1. Paste a compact three-segment JWT.
2. Review formatted header and payload JSON.
3. Inspect `exp`, `nbf`, and `iat` as readable dates and status relative to now.
4. Copy either decoded JSON section.

## Behavior

- Require exactly three dot-separated compact segments.
- Decode header and payload with unpadded Base64url and fatal UTF-8 validation.
- Require both decoded sections to be JSON objects.
- Preserve the signature segment as text but never verify it.
- Interpret finite numeric `exp`, `nbf`, and `iat` values as Unix seconds.
- Report malformed segments, invalid Base64url, invalid UTF-8, and invalid JSON
  with an announced error.
- Always show a prominent bilingual “signature not verified” warning.

## Privacy and security

Tokens remain in component memory and are never sent to a server. The tool does
not fetch keys, execute claims, or make authorization decisions.

## Out of scope

- Signature verification or JWKS fetching
- JWE decryption
- Token generation

