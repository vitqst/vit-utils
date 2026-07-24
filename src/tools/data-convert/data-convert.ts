import { parseDocument, stringify as stringifyYaml } from "yaml";

export type DataFormat = "json" | "yaml" | "csv";
type JsonPrimitive = string | number | boolean | null;
type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function ensureJsonValue(value: unknown, path = "$"): JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(`Non-finite number at ${path} is not JSON-compatible.`);
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      ensureJsonValue(item, `${path}[${index}]`),
    );
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        ensureJsonValue(child, `${path}.${key}`),
      ]),
    );
  }
  throw new Error(`Unsupported non-JSON value at ${path}.`);
}

function csvRows(source: string): string[][] {
  if (!source) return [];
  const input = source.replace(/\r\n?/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      if (field) throw new Error("Unexpected quote inside an unquoted CSV field.");
      quoted = true;
    } else if (character === ",") {
      pushField();
    } else if (character === "\n") {
      pushRow();
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("Unterminated quoted CSV field.");
  if (field || row.length) pushRow();
  return rows;
}

export function parseCsv(source: string): Record<string, string>[] {
  const rows = csvRows(source);
  if (!rows.length) return [];
  const headers = rows.shift() ?? [];
  if (headers.some((header) => !header)) {
    throw new Error("CSV headers must not be empty.");
  }
  if (new Set(headers).size !== headers.length) {
    throw new Error("CSV headers must be unique.");
  }

  return rows.map((row, rowIndex) => {
    if (row.length !== headers.length) {
      throw new Error(
        `CSV row ${rowIndex + 2} has ${row.length} columns; expected ${headers.length}.`,
      );
    }
    return Object.fromEntries(
      headers.map((header, index) => [header, row[index]]),
    );
  });
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    typeof value !== "boolean"
  ) {
    throw new Error("CSV cells must be primitive values; nested data is unsupported.");
  }
  const text = String(value);
  return /[",\r\n]/u.test(text) || /^\s|\s$/u.test(text)
    ? `"${text.replaceAll('"', '""')}"`
    : text;
}

export function stringifyCsv(value: unknown): string {
  if (!Array.isArray(value)) {
    throw new Error("CSV output requires a top-level array of records.");
  }
  if (!value.every(isPlainObject)) {
    throw new Error("CSV output requires an array of plain object records.");
  }

  const headers: string[] = [];
  const seen = new Set<string>();
  value.forEach((record) => {
    Object.keys(record).forEach((key) => {
      if (!seen.has(key)) {
        seen.add(key);
        headers.push(key);
      }
    });
  });
  if (!headers.length) return "";

  return [
    headers.map(csvCell).join(","),
    ...value.map((record) =>
      headers.map((header) => csvCell(record[header])).join(","),
    ),
  ].join("\r\n");
}

function parseSource(source: string, format: DataFormat): JsonValue {
  if (format === "json") return ensureJsonValue(JSON.parse(source));
  if (format === "csv") return ensureJsonValue(parseCsv(source));

  const document = parseDocument(source, {
    uniqueKeys: true,
    prettyErrors: true,
  });
  if (document.errors.length) {
    throw new Error(document.errors.map((error) => error.message).join("\n"));
  }
  return ensureJsonValue(document.toJS({ maxAliasCount: 100 }));
}

function stringifyTarget(value: JsonValue, format: DataFormat): string {
  if (format === "json") return JSON.stringify(value, null, 2);
  if (format === "csv") return stringifyCsv(value);
  return stringifyYaml(value, {
    lineWidth: 0,
  });
}

export function convertData(
  source: string,
  from: DataFormat,
  to: DataFormat,
): string {
  if (!source.trim()) return "";
  return stringifyTarget(parseSource(source, from), to);
}
