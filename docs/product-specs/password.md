# Password Generator

## Purpose

Generate passwords or passphrases locally with explicit composition controls.

## Behavior

- Password mode supports length 4–256, uppercase, lowercase, digits, symbols,
  and optional ambiguous-character exclusion.
- Require at least one selected class and guarantee at least one character from
  every selected class when length allows.
- Passphrase mode supports 3–20 words, a bounded separator, capitalization, and
  an optional numeric suffix.
- Select passphrase words from EFF's 7,776-entry long wordlist and default to
  the six words EFF recommends for most applications.
- Use rejection sampling over `crypto.getRandomValues`; never use `Math.random`.
- Show an entropy estimate based on the selected pool/word-list size and explain
  that it is an estimate, not a strength audit.
- Generated secrets remain only in current component state and can be regenerated,
  copied, or cleared.
- Clear a generated secret and its copy confirmation when the settings used to
  generate it change, so the displayed result and entropy never describe
  different configurations.

## Accessibility and localization

- Every option has a semantic label; validation and copy status are announced.
- English and Vietnamese copy ship together.
