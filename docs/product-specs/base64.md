# Base64

## Job

Encode or decode UTF-8 text and local files as standard Base64 or URL-safe
Base64 without uploading content.

## Core flows

1. Choose encode or decode.
2. Choose text or file input and optionally Base64url.
3. Enter text or select one local file.
4. Review/copy text output or download file output.
5. Cancel a file conversion or reset the workspace.

## Behavior

- Text encoding uses UTF-8 through `TextEncoder`; text decoding uses fatal UTF-8
  validation through `TextDecoder`.
- Decoding ignores ASCII whitespace and accepts omitted padding when recoverable.
- Base64url maps `+`/`/` to `-`/`_` and omits padding when encoding.
- Invalid alphabet, impossible length, invalid padding, or invalid UTF-8 returns a
  localized error rather than partial text.
- File bytes are processed in a dedicated worker in bounded chunks.
- Cancel messages are observed between chunks; unmount/reset terminates the
  worker.
- Object URLs are created only for the current downloadable result and revoked on
  replacement or unmount.

## Privacy

Text, selected files, bytes, and object URLs remain in browser memory.

## Out of scope

- Streaming files larger than available browser memory
- Data URL parsing
- Compression or encryption

