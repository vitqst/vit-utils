# Audit password generator

Status: completed 2026-07-29.

## Goal

Close security and user-experience gaps in the existing password generator
without changing its browser-only architecture or rebuilding the tool.

## Work

- Add failing unit coverage for the complete 7,776-entry EFF long wordlist,
  word selection, and entropy derived from the imported list length.
- Add failing UI coverage for the six-word passphrase default, localized
  validation, clearing stale generated output when options change, and resetting
  copy confirmation when the secret changes.
- Move the EFF long wordlist into a dedicated lazy-loaded tool module and keep
  the existing Web Crypto and rejection-sampling generation path.
- Update English and Vietnamese UI/product copy to identify the EFF list and
  explain the six-word recommendation.
- Audit the password tool for persistence, logging, network access,
  `Math.random`, accessibility, and eager shell imports.
- Run focused tests, then the full repository check.

## Verification

- `npm test -- src/tools/password/password.test.ts src/tools/password/PasswordTool.test.tsx`
- `npm run check`
- Static searches for network, persistence, logging, analytics, and
  `Math.random` usage in `src/tools/password/`.
