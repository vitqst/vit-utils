# Cron Builder

## Purpose

Build and inspect five-field cron expressions, then preview upcoming run times
without scheduling a job.

## Behavior

- Use the five fields minute, hour, day of month, month, and day of week.
- Provide common presets and allow direct editing of either the complete
  expression or individual fields.
- Validate with Croner in five-field mode.
- Show a concise human-readable summary and the next five runs.
- Calculate previews from the current instant in the browser and disclose that
  displayed dates use the browser's local time zone.
- Invalid input preserves the expression and produces an announced error.

## Privacy and limits

- Processing is entirely local.
- The tool only calls Croner's next-run calculation APIs; it never creates a
  callback or schedules work.
- Cron day-of-month and day-of-week semantics follow Croner.

## Accessibility and localization

- Field editors, presets, expression input, results, and errors are keyboard
  accessible.
- English and Vietnamese copy ship together.

