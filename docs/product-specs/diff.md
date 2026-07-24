# Text Diff

## Job

Compare two local texts line by line and make additions, removals, and unchanged
context easy to review.

## Core flows

1. Paste the original and changed text into separately labeled editors.
2. Review a line-oriented result that distinguishes unchanged, removed, and added
   lines with both symbols and color.
3. Clear either side and compare again without a network request.

## Behavior

- Normalize Windows and classic Mac line endings before comparison.
- Use a deterministic longest-common-subsequence line diff.
- Show replacements as an adjacent removal and addition so no content is hidden.
- Preserve blank lines within the compared content.
- Empty text contains zero lines; identical inputs show unchanged lines.
- Result rows expose old and new line numbers where applicable.

## Privacy

Both inputs and the derived diff remain in component memory.

## Out of scope

- Character-level highlighting inside a changed line
- Patch application or Git repository integration
- Comparing files too large for an interactive text editor

