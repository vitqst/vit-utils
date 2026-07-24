# Developer & Data Tools Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan
> task-by-task.

**Goal:** Ship all eight Developer & Data tools as bilingual, validated,
lazy-loaded browser modules.

**Architecture:** Keep JSON, Base64 text, JWT, curl, CSV, and type inference in
pure tool-owned modules. Use the browser-compatible `yaml`, `sql-formatter`, and
`croner` packages only inside their lazy tool chunks. Put file Base64 conversion
in a cancellable worker; keep all other transforms synchronous only while their
bounded text inputs remain interactive.

**Tech Stack:** React 19, TypeScript 7, Vite 7, Vitest, Testing Library,
`yaml@^2.9.0`, `sql-formatter@^15.8.2`, `croner@^10.0.1`.

---

### Task 1: JSON formatter and Base64

**Files:**

- Create: `docs/product-specs/json.md`
- Create: `src/tools/json/json.test.ts`
- Create: `src/tools/json/json.ts`
- Create: `src/tools/json/JsonTool.test.tsx`
- Create: `src/tools/json/JsonTool.tsx`
- Create: `src/tools/json/index.ts`
- Create: `docs/product-specs/base64.md`
- Create: `src/tools/base64/base64.test.ts`
- Create: `src/tools/base64/base64.ts`
- Create: `src/tools/base64/base64.worker.ts`
- Create: `src/tools/base64/Base64Tool.test.tsx`
- Create: `src/tools/base64/Base64Tool.tsx`
- Create: `src/tools/base64/index.ts`
- Modify: `src/registry/tool-catalog.ts`
- Modify: `src/registry/tool-registry.ts`
- Modify: `src/registry/tool-registry.test.ts`

1. Specify JSON parse/format/minify/sort rules, duplicate-key limitation, error
   location behavior, and JSON-compatible output.
2. Write failing tests requiring this pure contract:

   ```ts
   transformJson('{"b":1,"a":{"d":2,"c":3}}', {
     mode: "format",
     indent: 2,
     sortKeys: true,
   });
   // => '{\n  "a": {\n    "c": 3,\n    "d": 2\n  },\n  "b": 1\n}'
   ```

3. Run `npm test -- src/tools/json/json.test.ts`; confirm a missing-module
   failure.
4. Implement recursive object-key sorting without reordering arrays, format and
   minify modes, and line/column extraction from native `JSON.parse` offsets.
5. Re-run the pure tests and confirm they pass.
6. Write failing component tests for format/minify, indentation, sort keys,
   localized labels, copy, and announced invalid JSON.
7. Implement `JsonTool.tsx` and make its component tests pass.
8. Specify UTF-8 text encode/decode, Base64url, whitespace-tolerant decode,
   invalid-input errors, binary files, output download, worker cancellation, and
   object URL cleanup.
9. Write failing pure tests such as:

   ```ts
   expect(encodeBase64Text("Xin chào 👋", false)).toBe(
     "WGluIGNow6BvIPCfkYs="
   );
   expect(decodeBase64Text("WGluIGNow6BvIPCfkYs=")).toBe("Xin chào 👋");
   ```

10. Implement text conversion with `TextEncoder`/`TextDecoder` and chunked binary
    helpers that never spread an unbounded byte array into one function call.
11. Write failing component tests for text direction, Base64url, file selection,
    cancel/reset, localized validation, copy, and download availability.
12. Implement the tool plus module worker protocol:

    ```ts
    type WorkerRequest =
      | { type: "encode"; id: number; bytes: ArrayBuffer; urlSafe: boolean }
      | { type: "decode"; id: number; value: string; urlSafe: boolean }
      | { type: "cancel"; id: number };
    ```

13. Mark both catalog entries ready only after focused tests and type-check pass.
14. Commit with `git commit -m "feat(developer): add JSON and Base64 tools"`.

### Task 2: Structured data converter and JWT decoder

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create the product spec, pure test/module, component test/module, and lazy
  `index.ts` under `src/tools/data-convert/`.
- Create the equivalent set under `src/tools/jwt/`.
- Modify the catalog and registry files.

1. Add `yaml@^2.9.0` with `npm install yaml@^2.9.0`; do not import it outside the
   `data-convert` lazy chunk.
2. Specify conversions among JSON, YAML, and CSV. Limit CSV to one rectangular
   array of records; preserve quoted delimiters, quotes, CRLF, embedded newlines,
   empty fields, and deterministic header order. Reject multiple YAML documents,
   aliases that exceed safe expansion, non-string map keys, and cyclic values.
3. Write failing pure tests for:

   ```ts
   convertData('name,age\\n"Nguyễn, An",30', "csv", "json");
   // => '[\n  {\n    "name": "Nguyễn, An",\n    "age": "30"\n  }\n]'
   ```

4. Implement CSV state-machine parsing/stringifying and YAML
   `parseDocument(..., { uniqueKeys: true })`; inspect `doc.errors` before
   `toJS({ maxAliasCount: 100 })`, then reject values outside JSON-compatible
   primitives, arrays, and string-keyed objects. Use
   `YAML.stringify(value, { lineWidth: 0 })`.
5. Test and implement source/target selectors, swap, localized errors, result copy,
   and download with the correct extension.
6. Specify JWT decoding as inspection without signature verification. Support
   Base64url padding, UTF-8 JSON, malformed segment errors, `exp`/`nbf`/`iat`
   timestamps, and an explicit “not verified” warning.
7. Write failing tests for a known token, Unicode payload, malformed segments,
   invalid Base64url, invalid JSON, and time-claim summaries.
8. Implement pure decoding without network or cryptographic verification.
9. Test and implement bilingual token input, header/payload panels, claim times,
   copy controls, and the persistent signature warning.
10. Register both lazy modules after focused tests and type-check pass.
11. Commit with `git commit -m "feat(developer): add data converter and JWT tools"`.

### Task 3: SQL formatter and Cron builder

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create the standard spec/domain/component/lazy-entry set under
  `src/tools/sql/`.
- Create the equivalent set under `src/tools/cron/`.
- Modify the catalog and registry files.

1. Install `sql-formatter@^15.8.2` and `croner@^10.0.1`.
2. Specify supported SQL dialects: Standard SQL, BigQuery, MySQL, MariaDB,
   PostgreSQL, SQLite, Transact-SQL, PL/SQL, Snowflake, and Spark. Specify
   keyword-case, indentation, parse-error, and unchanged-source behavior.
3. Write failing tests around the current official API:

   ```ts
   format("select * from users where id = 1", {
     language: "postgresql",
     tabWidth: 2,
     keywordCase: "upper",
   });
   ```

4. Wrap `sql-formatter` with a typed, validation-returning domain function; test
   and implement dialect/options UI, localized errors, result copy, and download.
5. Specify a five-field cron builder with minute/hour/day/month/weekday presets,
   direct expression editing, human-readable summary, local-time disclosure, and
   five upcoming runs from a supplied reference date.
6. Write deterministic tests using:

   ```ts
   new Cron("*/15 * * * *").nextRuns(
     3,
     new Date("2026-01-01T00:00:00.000Z"),
   );
   ```

7. Wrap Croner construction in a result-returning validator. Never schedule a
   callback; call only `nextRun`/`nextRuns`.
8. Test and implement presets, direct editing, localized validation, five-run
   preview, and locale-aware date rendering.
9. Register both lazy modules after focused tests and type-check pass.
10. Commit with `git commit -m "feat(developer): add SQL and cron tools"`.

### Task 4: curl to code and JSON to TypeScript

**Files:**

- Create the standard spec/domain/component/lazy-entry set under
  `src/tools/curl/`.
- Create the equivalent set under `src/tools/json-types/`.
- Modify the catalog and registry files.

1. Specify a bounded curl subset: URL, `-X/--request`, `-H/--header`,
   `-d/--data/--data-raw`, `--json`, `-u/--user`, `-G/--get`, and common shell
   quoting/line continuations. Reject file reads (`@file`), command substitution,
   unsupported flags, and missing values rather than executing anything.
2. Write failing tokenizer/parser tests for single/double quotes, escaped
   characters, repeated headers, implicit POST, query data, basic auth, and
   rejected unsafe/unsupported syntax.
3. Implement a non-executing shell tokenizer and structured request model:

   ```ts
   interface CurlRequest {
     url: string;
     method: string;
     headers: Array<[string, string]>;
     body?: string;
   }
   ```

4. Write failing generator tests for browser Fetch, Node Fetch, Python Requests,
   and PHP cURL with correct string escaping.
5. Implement generators, then test and implement bilingual source/target UI,
   validation, copy, and download.
6. Specify JSON-to-TypeScript inference for nested objects, arrays, null,
   heterogeneous arrays, optional properties across object samples, safe property
   names, root arrays/primitives, and deterministic interface names.
7. Write failing inference tests such as:

   ```ts
   jsonToTypeScript('[{"id":1,"name":"An"},{"id":2}]', "User");
   // interface User { id: number; name?: string; }
   ```

8. Implement a structural type tree, merge compatible nodes, emit named nested
   interfaces once, quote unsafe keys, and use unions only when required.
9. Test and implement root-name input, interface/type-alias mode, localized parse
   errors, result copy, and download.
10. Register both lazy modules after focused tests and type-check pass.
11. Commit with `git commit -m "feat(developer): add curl and JSON types tools"`.

### Task 5: Developer group verification

**Files:**

- Modify: `src/app/App.test.tsx`
- Modify: `docs/product-specs/index.md`
- Modify: `docs/exec-plans/active/2026-07-24-all-tools.md`

1. Add direct-route coverage for all eight Developer tools and require the group
   hub to show eight offline-ready entries.
2. Update the shipped specification index and active-plan checkboxes.
3. Run `npm run check` and record the fresh test/build counts.
4. Confirm `dist/tools/<id>/index.html` exists for each Developer route.
5. Inspect the application chunk for eight additional dynamic imports and verify
   `yaml`, `sql-formatter`, and `croner` code is absent from the application shell
   chunk.
6. Inspect source for `fetch`, `XMLHttpRequest`, remote URLs, dynamic evaluation,
   and file content stored outside tool/worker state.
7. Commit with `git commit -m "test(developer): verify complete tool group"`.
