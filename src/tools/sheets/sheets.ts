export type SheetMode = "csv-to-xlsx" | "xlsx-to-csv";
export type SheetCell = string | number | boolean | Date | null;

export const MAX_SHEET_BYTES = 50 * 1024 * 1024;
export const MAX_SHEET_ROWS = 10_000;
export const MAX_SHEET_CELLS = 100_000;

export function parseCsv(input: string) {
  const source = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"') {
        if (source[index + 1] === '"') {
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
    if (character === '"' && field === "") {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (character === '"') {
      throw new Error("Unexpected quote in an unquoted CSV field.");
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("CSV contains an unclosed quote.");
  if (field || row.length || source.endsWith(",")) {
    row.push(field);
    rows.push(row);
  }
  validateRows(rows);
  return rows;
}

function cellText(cell: SheetCell) {
  if (cell === null || cell === undefined) return "";
  if (cell instanceof Date) return cell.toISOString();
  return String(cell);
}

export function rowsToCsv(rows: SheetCell[][]) {
  validateRows(rows);
  return `${rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cellText(cell);
          return /[",\r\n]/.test(value)
            ? `"${value.replaceAll('"', '""')}"`
            : value;
        })
        .join(","),
    )
    .join("\r\n")}\r\n`;
}

export function validateRows(rows: readonly unknown[][]) {
  if (!rows.length) throw new Error("The spreadsheet does not contain any rows.");
  if (rows.length > MAX_SHEET_ROWS) {
    throw new Error(`The spreadsheet exceeds ${MAX_SHEET_ROWS.toLocaleString()} rows.`);
  }
  const cells = rows.reduce((count, row) => count + row.length, 0);
  if (cells > MAX_SHEET_CELLS) {
    throw new Error(`The spreadsheet exceeds ${MAX_SHEET_CELLS.toLocaleString()} cells.`);
  }
  return { rows: rows.length, cells };
}

type FileLike = { name: string; type: string; size: number };

export function validateSheetFile(file: FileLike | undefined, mode: SheetMode) {
  if (!file) throw new Error("Choose a spreadsheet file.");
  const extension = file.name.toLowerCase();
  if (mode === "csv-to-xlsx" && !extension.endsWith(".csv")) {
    throw new Error("Choose a CSV file.");
  }
  if (mode === "xlsx-to-csv" && !extension.endsWith(".xlsx")) {
    throw new Error("Choose an XLSX file.");
  }
  if (file.size > MAX_SHEET_BYTES) {
    throw new Error("The spreadsheet must be 50 MB or smaller.");
  }
  return file.size;
}

export function normalizeSheetRows(rows: unknown[][]): SheetCell[][] {
  const normalized = rows.map((row) =>
    row.map((cell) => {
      if (
        cell === null ||
        typeof cell === "string" ||
        typeof cell === "number" ||
        typeof cell === "boolean" ||
        cell instanceof Date
      ) {
        return cell;
      }
      return String(cell ?? "");
    }),
  );
  validateRows(normalized);
  return normalized;
}

