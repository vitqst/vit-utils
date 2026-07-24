# Vietnamese Lunar Calendar

## Purpose

Convert between Gregorian dates and the Vietnamese lunar calendar using the
UTC+7 calendar convention.

## Behavior

- Convert Gregorian dates to lunar day, month, year, leap-month status, and
  Vietnamese can-chi year.
- Convert lunar day/month/year plus an explicit leap-month choice back to a
  Gregorian date.
- Validate real Gregorian dates, real lunar dates, and leap-month selection.
- Support years 1800 through 2199 and disclose the supported range.
- Use the Hồ Ngọc Đức astronomical algorithm already selected by the product
  requirements, fixed to UTC+7 for Vietnamese lunar dates.

All calculation is local and deterministic. The tool does not provide astrology,
holiday, or auspicious-day advice.

## Accessibility and localization

- Direction, date fields, leap-month control, results, and errors are keyboard
  accessible.
- English and Vietnamese copy ship together.

