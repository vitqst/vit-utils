import { describe, expect, it } from "vitest";

import { parsePageRange, validatePdfFiles } from "./pdf";

describe("PDF page selection", () => {
  it("parses ordered pages, ranges, last, and removes duplicates", () => {
    expect(parsePageRange("3, 1-2, last, 2", 5)).toEqual([2, 0, 1, 4]);
    expect(parsePageRange("", 3)).toEqual([0, 1, 2]);
  });

  it("rejects malformed and out-of-range expressions", () => {
    expect(() => parsePageRange("0", 3)).toThrow(/between 1 and 3/i);
    expect(() => parsePageRange("3-1", 3)).toThrow(/range/i);
    expect(() => parsePageRange("one", 3)).toThrow(/page/i);
    expect(() => parsePageRange("4", 3)).toThrow(/between 1 and 3/i);
  });

  it("enforces file type, count, and aggregate size", () => {
    expect(
      validatePdfFiles(
        [
          { name: "a.pdf", type: "application/pdf", size: 10 },
          { name: "b.PDF", type: "", size: 20 },
        ],
        "merge",
      ),
    ).toBe(30);
    expect(() =>
      validatePdfFiles([{ name: "image.png", type: "image/png", size: 10 }], "split"),
    ).toThrow(/PDF/i);
    expect(() =>
      validatePdfFiles([{ name: "a.pdf", type: "application/pdf", size: 10 }], "merge"),
    ).toThrow(/at least two/i);
  });
});

