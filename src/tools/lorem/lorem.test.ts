import { describe, expect, it } from "vitest";

import { generateLorem } from "./lorem";

describe("Lorem Ipsum generation", () => {
  it("generates the requested number of words from a stable corpus", () => {
    const result = generateLorem({
      unit: "words",
      count: 5,
      startWithLorem: true,
    });

    expect(result).toBe("Lorem ipsum dolor sit amet");
    expect(result.split(/\s+/)).toHaveLength(5);
  });

  it("generates capitalized, punctuated sentences deterministically", () => {
    const options = {
      unit: "sentences" as const,
      count: 2,
      startWithLorem: true,
    };
    const result = generateLorem(options);

    expect(result).toMatch(/^Lorem ipsum/);
    expect(result.match(/[.!?](?:\s|$)/g)).toHaveLength(2);
    expect(generateLorem(options)).toBe(result);
  });

  it("separates the requested number of paragraphs", () => {
    expect(
      generateLorem({
        unit: "paragraphs",
        count: 2,
        startWithLorem: false,
      }).split("\n\n"),
    ).toHaveLength(2);
  });

  it("returns empty output for non-positive counts and clamps high counts", () => {
    expect(generateLorem({ unit: "words", count: 0 })).toBe("");
    expect(
      generateLorem({ unit: "paragraphs", count: 99 }).split("\n\n"),
    ).toHaveLength(20);
  });
});

