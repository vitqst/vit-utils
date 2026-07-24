# Sort & Dedupe Lines

## Job

Clean and reorganize line-oriented text while keeping the transformation explicit
and reversible by retaining the source editor.

## Core flows

1. Paste line-oriented text.
2. Choose original order, ascending sort, descending sort, or reverse order.
3. Optionally trim lines, remove blank lines, and remove duplicates.
4. Choose case-sensitive duplicate comparison when needed.
5. Review and copy the result.

## Behavior

- Normalize CRLF and classic Mac line endings.
- Apply trimming and blank-line removal before duplicate detection.
- Keep the first occurrence when removing duplicates.
- Compare duplicates case-insensitively by default, using the active locale.
- Sort with `Intl.Collator`, including natural numeric ordering, and preserve input
  order for equivalent values.
- Apply reverse order without alphabetic sorting.
- Empty input produces an empty result.

## Privacy

Source and result remain in component memory.

## Out of scope

- Random shuffling
- Column-aware CSV sorting
- Editing files in place

