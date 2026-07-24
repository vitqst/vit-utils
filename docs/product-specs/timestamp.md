# Unix Timestamp

## Purpose

Convert Unix seconds or milliseconds to readable dates and convert a local date
and time back to epoch values.

## Behavior

- Accept signed integer or fractional timestamps.
- Offer automatic seconds/milliseconds detection plus explicit unit selection.
- Show ISO 8601, UTC, browser-local time, Unix seconds, and Unix milliseconds.
- Let the user insert the current time.
- Convert a valid `datetime-local` value to seconds and milliseconds.
- Reject empty, non-finite, or out-of-range values with an announced error.

All conversion is local. Local output and local date input use the browser's
current time zone.

## Accessibility and localization

- Modes, units, inputs, result labels, copy actions, and errors are semantic.
- English and Vietnamese copy ship together.

