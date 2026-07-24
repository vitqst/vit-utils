# Slug & Vietnamese Accents

## Job

Create a stable URL slug or remove Vietnamese diacritics from text locally.

## Core flows

1. Enter or paste text.
2. Choose ASCII slug or Unicode-preserving slug.
3. Choose hyphen or underscore as the separator.
4. Copy the slug or switch to the accent-removal result.

## Behavior

- ASCII mode decomposes diacritics and maps Vietnamese `đ`/`Đ` to `d`/`D`.
- Unicode mode retains letters and marks from every script.
- Slugs are lowercase, trim separators at both ends, and collapse repeated
  punctuation or whitespace into one separator.
- Accent removal preserves case, spacing, numbers, and punctuation.
- Empty input produces an empty result.

## Privacy

All text and results remain in component memory.

## Out of scope

- Transliteration between scripts
- Checking whether a URL is available
- Locale-specific search-engine recommendations

