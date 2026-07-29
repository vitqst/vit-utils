import { describe, expect, it } from "vitest";

import { EFF_LONG_WORDS } from "./eff-long-wordlist";
import {
  estimatePasswordEntropy,
  generatePassphrase,
  generatePassword,
  passphraseEntropy,
} from "./password";

function ascending(length: number) {
  return Uint8Array.from({ length }, (_, index) => index % 256);
}

function filled(value: number) {
  return (length: number) => new Uint8Array(length).fill(value);
}

describe("password generation", () => {
  it("ships the complete EFF long wordlist in official index order", () => {
    expect(EFF_LONG_WORDS).toHaveLength(7_776);
    expect(new Set(EFF_LONG_WORDS).size).toBe(7_776);
    expect(EFF_LONG_WORDS[0]).toBe("abacus");
    expect(EFF_LONG_WORDS.at(-1)).toBe("zoom");
  });

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

  it("uses every entry in the 7,776-word EFF long list for generation and entropy", () => {
    const options = {
      words: 3,
      separator: "-",
      capitalize: false,
      includeNumber: false,
    };

    expect(generatePassphrase(options, filled(5))).toBe("zoom-zoom-zoom");
    expect(passphraseEntropy(options)).toBeCloseTo(3 * Math.log2(7_776));
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
