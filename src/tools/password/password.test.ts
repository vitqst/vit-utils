import { describe, expect, it } from "vitest";

import {
  estimatePasswordEntropy,
  generatePassphrase,
  generatePassword,
} from "./password";

function ascending(length: number) {
  return Uint8Array.from({ length }, (_, index) => index % 256);
}

describe("password generation", () => {
  it("guarantees every enabled class and requested length", () => {
    const value = generatePassword(
      {
        length: 20,
        uppercase: true,
        lowercase: true,
        digits: true,
        symbols: true,
        excludeAmbiguous: false,
      },
      ascending,
    );

    expect(value).toHaveLength(20);
    expect(value).toMatch(/[A-Z]/);
    expect(value).toMatch(/[a-z]/);
    expect(value).toMatch(/\d/);
    expect(value).toMatch(/[^A-Za-z0-9]/);
  });

  it("excludes ambiguous characters and validates impossible options", () => {
    const value = generatePassword(
      {
        length: 16,
        uppercase: true,
        lowercase: true,
        digits: true,
        symbols: false,
        excludeAmbiguous: true,
      },
      ascending,
    );
    expect(value).not.toMatch(/[O0Il1|]/);
    expect(() =>
      generatePassword(
        {
          length: 4,
          uppercase: false,
          lowercase: false,
          digits: false,
          symbols: false,
          excludeAmbiguous: false,
        },
        ascending,
      ),
    ).toThrow(/class/i);
  });

  it("generates configured passphrases and an entropy estimate", () => {
    const phrase = generatePassphrase(
      {
        words: 4,
        separator: "-",
        capitalize: true,
        includeNumber: true,
      },
      ascending,
    );
    expect(phrase.split("-")).toHaveLength(5);
    expect(phrase).toMatch(/-\d+$/);
    expect(estimatePasswordEntropy(20, 72)).toBeCloseTo(
      20 * Math.log2(72),
    );
  });

  it("rejects invalid lengths, word counts, and separators", () => {
    expect(() =>
      generatePassword(
        {
          length: 3,
          uppercase: true,
          lowercase: true,
          digits: true,
          symbols: false,
          excludeAmbiguous: false,
        },
        ascending,
      ),
    ).toThrow();
    expect(() =>
      generatePassphrase(
        {
          words: 2,
          separator: "-",
          capitalize: false,
          includeNumber: false,
        },
        ascending,
      ),
    ).toThrow();
    expect(() =>
      generatePassphrase(
        {
          words: 4,
          separator: "too-long",
          capitalize: false,
          includeNumber: false,
        },
        ascending,
      ),
    ).toThrow();
  });
});

