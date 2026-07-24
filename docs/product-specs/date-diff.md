# Date Difference

## Purpose

Compare two calendar dates using both calendar units and exact elapsed days.

## Behavior

- Parse strict Gregorian `YYYY-MM-DD` dates.
- Return direction, calendar years/months/days, total elapsed days, weeks plus
  remaining days, and signed elapsed milliseconds.
- Treat inputs as date-only values at UTC boundaries so daylight-saving changes
  cannot alter the elapsed-day count.
- Clamp end-of-month calendar steps; for example, January 31 to March 1 is one
  month and one day in a non-leap year.
- Handle equal and reversed dates deterministically.

## Accessibility and localization

- Both date inputs, result labels, swap action, and errors are semantic.
- English and Vietnamese copy ship together.

