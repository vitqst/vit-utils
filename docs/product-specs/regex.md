# Regex Tester

## Job

Test a JavaScript regular expression against local text and inspect matches,
positions, and capture groups without running arbitrary code.

## Core flows

1. Enter a pattern and test text.
2. Toggle global, case-insensitive, multiline, dot-all, and Unicode flags.
3. Review each match, its start/end offsets, numbered captures, and named captures.
4. Correct an invalid expression using an inline announced error.

## Behavior

- Use the browser's JavaScript `RegExp` implementation.
- Without the global flag, return only the first match.
- With the global flag, return all matches and explicitly advance after a
  zero-width match to prevent an infinite loop.
- Preserve unmatched optional captures as `undefined`.
- Invalid patterns return a readable error and no matches.
- Empty patterns are valid JavaScript expressions and follow the same zero-width
  protections.

## Privacy and safety

Pattern and test text stay in memory. The tool constructs `RegExp` objects only;
it never evaluates JavaScript source. Catastrophic-backtracking protection is
limited by browser `RegExp` capabilities, so the UI documents that complex
patterns may still be slow.

## Out of scope

- PCRE, RE2, or server-specific dialects
- Replacement execution
- Guaranteed interruption of a synchronous pathological browser regex

