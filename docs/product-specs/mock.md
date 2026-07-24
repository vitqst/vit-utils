# Mock Data

## Purpose

Generate repeatable sample records for prototypes and tests without a network
service.

## Behavior

- Generate 1–1,000 records in English or Vietnamese.
- Select any combination of ID, name, email, phone, address, company, and ISO
  date fields.
- Use a caller-provided seed so the same options reproduce the same records.
- Produce formatted JSON or quoted CSV with stable field ordering.
- Keep generated values obviously synthetic and do not imitate real complete
  identities.
- Validate count, seed length, and non-empty field selection.

All dictionaries and generation logic ship in the lazy tool module. No data is
downloaded or uploaded.

## Accessibility and localization

- Locale/count/seed/field/output controls and errors are semantic.
- English and Vietnamese interface copy ship together.

