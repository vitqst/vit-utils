# curl to Code

## Purpose

Convert a safe, bounded subset of a curl command into readable request code
without executing the command or making a network request.

## Accepted syntax

- A URL plus `-X`/`--request`, `-H`/`--header`,
  `-d`/`--data`/`--data-raw`, `--json`, `-u`/`--user`, and `-G`/`--get`.
- Repeated headers, common single/double shell quoting, escapes, and
  backslash-newline continuations.
- Data implies POST unless `--get` moves it to the query string or an explicit
  method overrides it.
- Targets are browser Fetch, Node Fetch, Python Requests, and PHP cURL.

## Rejected syntax

- File reads such as `@payload.json`.
- Command substitution, backticks, environment expansion, redirection, pipes,
  shell operators, unsupported flags, and missing flag values.
- Inputs over 100,000 characters.

The tokenizer is intentionally not a shell and the generated code is never run.

## Accessibility and localization

- Source, target, errors, output, copy, and download controls are semantic.
- English and Vietnamese copy ship together.

