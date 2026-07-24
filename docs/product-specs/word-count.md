# Word & Character Count

## Job

Measure pasted text immediately using Unicode-aware word, grapheme, sentence, and
line boundaries.

## Core flows

1. Enter or paste text.
2. Read live totals for words, characters, characters excluding whitespace,
   sentences, lines, and estimated reading time.
3. Clear or replace the text and see all metrics update.

## Behavior

- Count user-perceived characters as Unicode grapheme clusters.
- Count words and sentences with `Intl.Segmenter` for the active locale, with a
  Unicode fallback when segmentation is unavailable.
- Empty input reports zero lines; non-empty input reports newline count plus one.
- Treat CRLF as one line break.
- Estimate reading time at 200 words per minute, rounded up; empty text is zero.

## Privacy

Text and counts remain in component memory.

## Out of scope

- Readability grades
- Language detection
- Persisting text between visits

