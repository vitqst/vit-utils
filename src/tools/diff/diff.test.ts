import { describe, expect, it } from "vitest";

import { diffLines } from "./diff";

describe("line diff", () => {
  it("returns unchanged lines with both line numbers", () => {
    expect(diffLines("alpha\nbeta", "alpha\nbeta")).toEqual([
      { type: "equal", value: "alpha", oldLine: 1, newLine: 1 },
      { type: "equal", value: "beta", oldLine: 2, newLine: 2 },
    ]);
  });

  it("identifies inserted and removed lines", () => {
    expect(diffLines("alpha\nomega", "alpha\nbeta\nomega")).toEqual([
      { type: "equal", value: "alpha", oldLine: 1, newLine: 1 },
      { type: "insert", value: "beta", newLine: 2 },
      { type: "equal", value: "omega", oldLine: 2, newLine: 3 },
    ]);
    expect(diffLines("alpha\nbeta\nomega", "alpha\nomega")).toContainEqual({
      type: "delete",
      value: "beta",
      oldLine: 2,
    });
  });

  it("represents a changed line as a removal and addition", () => {
    expect(diffLines("before", "after")).toEqual([
      { type: "delete", value: "before", oldLine: 1 },
      { type: "insert", value: "after", newLine: 1 },
    ]);
  });

  it("normalizes line endings and treats empty text as zero lines", () => {
    expect(diffLines("alpha\r\nbeta", "alpha\nbeta")).toHaveLength(2);
    expect(diffLines("", "")).toEqual([]);
  });
});

