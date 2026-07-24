# Duration Humanizer

## Purpose

Convert a duration among milliseconds, seconds, clock notation, and readable
English or Vietnamese text.

## Behavior

- Accept signed milliseconds or seconds, including fractional values.
- Accept `MM:SS`, `HH:MM:SS`, or `days:HH:MM:SS` clock notation with optional
  fractional seconds.
- Require minute/second fields below 60 and the hour field below 24 when a
  separate day field is present.
- Emit exact milliseconds, seconds, normalized clock notation, and localized
  readable units from days through milliseconds.
- Preserve negative duration signs and reject non-finite or malformed input.

All conversion is local and uses fixed 24-hour days; it does not represent
calendar months or daylight-saving changes.

## Accessibility and localization

- Unit/input controls, results, copy actions, and errors are semantic.
- English and Vietnamese copy ship together.

