import { describe, expect, it } from "vitest";

import { transformLines } from "./line-tools";

describe("line tools", () => {
  it("trims, removes blanks, and keeps the first case-insensitive duplicate", () => {
    expect(
      transformLines(" Apple \n\napple\n Banana ", {
        trim: true,
        removeBlank: true,
        dedupe: true,
        caseSensitive: false,
        order: "original",
        locale: "en",
      }),
    ).toBe("Apple\nBanana");
  });

  it("supports case-sensitive duplicate comparison", () => {
    expect(
      transformLines("Apple\napple", {
        dedupe: true,
        caseSensitive: true,
      }),
    ).toBe("Apple\napple");
  });

  it("sorts naturally in ascending and descending order", () => {
    expect(transformLines("item10\nitem2\nitem1", { order: "asc" })).toBe(
      "item1\nitem2\nitem10",
    );
    expect(transformLines("item10\nitem2\nitem1", { order: "desc" })).toBe(
      "item10\nitem2\nitem1",
    );
  });

  it("reverses line order without sorting", () => {
    expect(transformLines("third\nfirst\nsecond", { order: "reverse" })).toBe(
      "second\nfirst\nthird",
    );
  });

  it("returns an empty result for empty input", () => {
    expect(transformLines("", {})).toBe("");
  });
});

