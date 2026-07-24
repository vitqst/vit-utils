# JSON to TypeScript

## Purpose

Infer readable TypeScript declarations from a local JSON sample.

## Behavior

- Support root objects, arrays, and primitives.
- Infer nested objects, arrays, `null`, and heterogeneous array unions.
- Merge object samples in arrays and mark properties absent from some samples
  optional.
- Sanitize declaration names, quote unsafe property names, and use deterministic
  singular nested names.
- Offer interface-style output where possible and type-alias output.
- Report invalid JSON locally and leave the sample editable.
- Allow generated TypeScript to be copied or downloaded.

## Limits

- Inference describes the supplied sample, not every future value.
- Empty arrays use `unknown[]`; numbers do not distinguish integers.
- Duplicate JSON keys follow native JSON parsing behavior.
- No source is uploaded and no generated code is evaluated.

## Accessibility and localization

- All inputs, modes, errors, and actions are keyboard accessible.
- English and Vietnamese copy ship together.

