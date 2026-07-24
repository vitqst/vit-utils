import { describe, expect, it } from "vitest";

import {
  localizedStrengthSuggestions,
  scoreLabel,
  validateStrengthPassword,
} from "./strength";

describe("password strength presentation", () => {
  it("labels every score in both languages", () => {
    expect([0, 1, 2, 3, 4].map((score) => scoreLabel(score, "en"))).toEqual([
      "Very weak",
      "Weak",
      "Fair",
      "Strong",
      "Very strong",
    ]);
    expect(scoreLabel(4, "vi")).toBe("Rất mạnh");
  });

  it("provides localized actionable suggestions", () => {
    expect(localizedStrengthSuggestions(1, "vi")).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/dài/i),
        expect.stringMatching(/phổ biến/i),
      ]),
    );
    expect(localizedStrengthSuggestions(4, "en")).toEqual([
      "Keep this password unique to one account.",
    ]);
  });

  it("rejects empty and excessive passwords", () => {
    expect(validateStrengthPassword("correct horse")).toBe("correct horse");
    expect(() => validateStrengthPassword("")).toThrow(/password/i);
    expect(() => validateStrengthPassword("a".repeat(257))).toThrow(/256/i);
  });
});

