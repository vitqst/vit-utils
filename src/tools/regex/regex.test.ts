import { describe, expect, it } from "vitest";

import { testRegex } from "./regex";

describe("regex testing", () => {
  it("returns all global matches with offsets and capture groups", () => {
    expect(testRegex("(?<word>[a-z]+)-(\\d+)", "item-12 next-3", "g")).toEqual({
      error: null,
      matches: [
        {
          value: "item-12",
          index: 0,
          end: 7,
          groups: ["item", "12"],
          namedGroups: { word: "item" },
        },
        {
          value: "next-3",
          index: 8,
          end: 14,
          groups: ["next", "3"],
          namedGroups: { word: "next" },
        },
      ],
    });
  });

  it("returns only the first match without the global flag", () => {
    expect(testRegex("a.", "ab ac", "").matches).toHaveLength(1);
  });

  it("returns an error instead of throwing for invalid patterns", () => {
    const result = testRegex("(", "text", "g");

    expect(result.matches).toEqual([]);
    expect(result.error).toMatch(/unterminated|invalid/i);
  });

  it("advances global zero-width matches without hanging", () => {
    const result = testRegex("\\b", "ab cd", "g");

    expect(result.error).toBeNull();
    expect(result.matches.map((match) => match.index)).toEqual([0, 2, 3, 5]);
  });
});
