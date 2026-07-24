import { describe, expect, it } from "vitest";

import { inspectUnicode } from "./unicode";

describe("Unicode inspection", () => {
  it("distinguishes code points, graphemes, and UTF-16 units", () => {
    expect(inspectUnicode("A😀", "en")).toEqual({
      graphemes: 2,
      codePoints: 2,
      utf16Units: 3,
      rows: [
        {
          character: "A",
          display: "A",
          codePoint: "U+0041",
          decimal: 65,
          utf16: ["0041"],
          utf16Index: 0,
          category: "letter",
          name: "LATIN CAPITAL LETTER A",
        },
        {
          character: "😀",
          display: "😀",
          codePoint: "U+1F600",
          decimal: 128512,
          utf16: ["D83D", "DE00"],
          utf16Index: 1,
          category: "symbol",
          name: null,
        },
      ],
    });
  });

  it("counts a combining sequence as one grapheme and identifies marks", () => {
    const result = inspectUnicode("e\u0301", "en");

    expect(result.graphemes).toBe(1);
    expect(result.codePoints).toBe(2);
    expect(result.rows[1]).toMatchObject({
      codePoint: "U+0301",
      category: "mark",
    });
  });

  it("makes whitespace visible and names common controls", () => {
    expect(inspectUnicode(" \n", "en").rows).toMatchObject([
      { display: "␠", name: "SPACE", category: "separator" },
      { display: "↵", name: "LINE FEED", category: "control" },
    ]);
  });

  it("returns zero totals for empty input", () => {
    expect(inspectUnicode("", "vi")).toMatchObject({
      graphemes: 0,
      codePoints: 0,
      utf16Units: 0,
      rows: [],
    });
  });
});
