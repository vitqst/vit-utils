# Unicode Inspector

## Job

Explain how entered text is represented as user-perceived graphemes, Unicode code
points, and UTF-16 code units, including invisible characters.

## Core flows

1. Enter or paste text.
2. Compare grapheme, code-point, and UTF-16 totals.
3. Inspect each code point's visible placeholder, `U+` value, decimal value,
   UTF-16 units, broad Unicode category, and source index.

## Behavior

- Iterate by Unicode code point while retaining UTF-16 source indexes.
- Segment graphemes with `Intl.Segmenter`, with a code-point fallback.
- Display common whitespace and controls using visible symbols and names.
- Report broad categories using Unicode property escapes: letter, mark, number,
  punctuation, symbol, separator, control, format, or other.
- Provide algorithmic names for ASCII letters/digits and common whitespace.
  Browsers do not expose the complete Unicode Character Database, so other
  official character names are explicitly reported as unavailable.
- Empty input shows zero totals and a localized empty state.

## Privacy

Text and inspection results remain in component memory.

## Out of scope

- Shipping the full Unicode Character Database
- Normalization or text mutation
- Font-glyph inspection

