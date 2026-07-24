# JSON Formatter

## Job

Validate, format, minify, and optionally sort JSON locally with an error location
that helps repair invalid input.

## Core flows

1. Paste JSON.
2. Choose formatted or minified output.
3. For formatted output, choose two or four spaces.
4. Optionally sort object keys recursively.
5. Review or copy the result; correct announced validation errors.

## Behavior

- Parse with the browser's native `JSON.parse` and emit standards-compliant JSON
  with `JSON.stringify`.
- Sorting reorders object keys recursively but never reorders array elements.
- Minify emits no insignificant whitespace.
- Empty input produces empty output and no error.
- Parse failures expose the native message plus a one-based line and column when
  the engine provides or permits deriving a source position.
- Native JSON parsing keeps the last duplicate object key; the UI discloses this
  limitation instead of claiming duplicate-key validation.

## Privacy

Input and result remain in component memory.

## Out of scope

- JSON5 or comments
- Schema validation
- Lossless integers outside JavaScript's safe numeric range

