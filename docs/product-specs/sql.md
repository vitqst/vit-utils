# SQL Formatter

## Purpose

Format SQL locally for easier reading without executing or transmitting a query.

## Behavior

- Support Standard SQL, BigQuery, MySQL, MariaDB, PostgreSQL, SQLite,
  Transact-SQL, PL/SQL, Snowflake, and Spark.
- Let the user preserve, uppercase, or lowercase keywords and choose two- or
  four-space indentation.
- Keep the source editable and unchanged while showing formatted output
  separately.
- Treat empty input as an empty state and report formatter/parser failures
  accessibly.
- Allow the result to be copied or downloaded as a `.sql` file.

## Privacy and limits

- Processing is entirely local and does not execute SQL.
- Formatting validates tokens and layout, not database schema or query meaning.
- The tool does not promise that every database-specific extension is supported.

## Accessibility and localization

- All controls have semantic labels and errors are announced.
- English and Vietnamese copy ship together.

