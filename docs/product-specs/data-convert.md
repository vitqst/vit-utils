# JSON ↔ YAML ↔ CSV

## Job

Convert structured data among JSON, YAML, and CSV locally with explicit format
constraints and useful validation errors.

## Core flows

1. Choose source and target formats.
2. Paste structured data and convert immediately.
3. Swap source/target formats when round-tripping.
4. Review, copy, or download the converted result.

## Behavior

- JSON uses native strict parsing and two-space formatted output.
- YAML uses the YAML 1.2 core schema, rejects duplicate keys and multiple
  documents, limits alias expansion to 100, and rejects parsed values that are not
  JSON-compatible.
- CSV supports RFC 4180-style comma separation, doubled quotes, CRLF/LF, quoted
  commas, and quoted embedded newlines.
- The first CSV row is the header; headers must be non-empty and unique.
- CSV data rows must match the header width and convert to arrays of string-valued
  records.
- Converting to CSV requires a top-level array of plain objects with primitive or
  null values. Header order follows first appearance across the records.
- Nested arrays/objects are rejected for CSV rather than stringified ambiguously.
- Empty input produces empty output.

## Privacy

Source and converted data remain in component memory.

## Out of scope

- XML or TOML
- Type inference for CSV cells
- Multiple YAML documents
- Arbitrary YAML tags or non-string map keys
