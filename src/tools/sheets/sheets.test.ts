import { describe, expect, it } from "vitest";

import { parseCsv, rowsToCsv, validateSheetFile } from "./sheets";

describe("CSV and spreadsheet helpers", () => {
  it("parses quoted CSV fields, escaped quotes, BOM, and embedded newlines", () => {
    expect(parseCsv('\uFEFFname,note\r\n"Vịt","hello,\n""world"""\r\n')).toEqual([
      ["name", "note"],
      ["Vịt", 'hello,\n"world"'],
    ]);
  });

  it("serializes values with RFC-style quoting and CRLF rows", () => {
    expect(rowsToCsv([["a", "b,c"], [1, true], [null, 'say "hi"']])).toBe(
      'a,"b,c"\r\n1,true\r\n,"say ""hi"""\r\n',
    );
  });

  it("rejects malformed CSV and invalid file directions", () => {
    expect(() => parseCsv('"unclosed')).toThrow(/quote/i);
    expect(() =>
      validateSheetFile(
        { name: "data.xlsx", type: "", size: 10 },
        "csv-to-xlsx",
      ),
    ).toThrow(/CSV/i);
    expect(
      validateSheetFile({ name: "data.xlsx", type: "", size: 10 }, "xlsx-to-csv"),
    ).toBe(10);
  });
});

