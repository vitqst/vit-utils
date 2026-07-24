# Working Days

## Purpose

Count working, weekend, and holiday dates in an inclusive calendar range.

## Behavior

- Accept strict `YYYY-MM-DD` start/end dates and count both endpoints.
- Let the user select any weekdays as weekend days.
- Accept a local list of ISO holiday dates separated by lines or commas.
- Classify each date exactly once: a listed holiday takes precedence over a
  selected weekend, otherwise the date is working.
- Return range direction, total calendar days, working days, weekend days, and
  holiday days.
- Reversed dates retain a negative direction while using the same inclusive
  counts.
- Reject invalid dates/weekend values and ranges over 20,000 days.

All work is local. The tool does not download public-holiday calendars or infer
regional holidays.

## Accessibility and localization

- Date inputs, weekday checkboxes, holiday input, results, and errors are
  keyboard accessible.
- English and Vietnamese copy ship together.

