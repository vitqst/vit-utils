# Case Converter

## Job

Convert pasted text into a chosen naming or prose case without sending it outside
the browser.

## Core flows

1. Enter or paste text.
2. Choose sentence, title, upper, lower, camel, Pascal, snake, kebab, or constant
   case.
3. Read or copy the converted result.
4. Switch case styles without losing the source.

## Behavior

- Word boundaries include whitespace, punctuation separators, camel-case
  transitions, and acronym-to-word transitions.
- Vietnamese and other Unicode letters are preserved.
- Naming cases normalize separators and whitespace.
- Empty input produces an empty result, not an error.
- Copy is explicit and reports success or failure accessibly.

## Privacy

All text and results remain in component memory.

## Out of scope

- Language-specific headline capitalization rules
- Source-code parsing
- Persisting pasted text

