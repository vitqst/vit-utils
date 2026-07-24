# Password strength

## Purpose

Estimate a password's resistance to guessing and explain practical weaknesses
without transmitting or retaining the password.

## Behavior

- zxcvbn-ts checks common passwords, English words/names, keyboard walks,
  sequences, repeats, dates, and brute-force segments.
- Results include a 0–4 score, estimated guesses, a representative offline-fast
  crack time, and actionable localized suggestions.
- The password is limited to 256 Unicode code points. Empty passwords are not
  evaluated.
- The estimate is guidance, not a guarantee and not a breach lookup.

## Lifecycle and privacy

Evaluation runs in a short-lived lazy module worker. Worker responses contain
only score, guesses, time, pattern names, warning, and suggestions—never the
password or matched tokens. Cancellation terminates the worker immediately.
Passwords are not logged, copied, downloaded, persisted, or sent over a network,
and reset clears component state.

English and Vietnamese controls expose password visibility, check, cancel,
reset, score, metrics, suggestions, errors, and the estimate disclaimer.

