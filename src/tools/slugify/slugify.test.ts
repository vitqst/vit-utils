import { describe, expect, it } from "vitest";

import { removeVietnameseDiacritics, slugify } from "./slugify";

describe("slugify", () => {
  it("creates a lowercase ASCII slug with collapsed separators", () => {
    expect(slugify("  Đặng Thái Sơn & Café  ")).toBe("dang-thai-son-cafe");
  });

  it("can preserve Unicode letters and use underscores", () => {
    expect(
      slugify("Tiếng Việt thật đẹp!", {
        ascii: false,
        separator: "_",
      }),
    ).toBe("tiếng_việt_thật_đẹp");
  });

  it("removes Vietnamese accents while preserving other text structure", () => {
    expect(removeVietnameseDiacritics("Đặng Thái Sơn — SỐ 2")).toBe(
      "Dang Thai Son — SO 2",
    );
  });

  it("returns an empty result for punctuation-only input", () => {
    expect(slugify(" -- & -- ")).toBe("");
  });
});
