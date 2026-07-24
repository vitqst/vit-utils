import { describe, expect, it } from "vitest";

import { hashText, identifyHashFormats, validateHashText } from "./hash";

describe("text hash helpers", () => {
  it("hashes exact UTF-8 text with standard algorithms", () => {
    expect(hashText("sha256", "abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(hashText("md5", "abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
    expect(hashText("sha1", "")).toBe(
      "da39a3ee5e6b4b0d3255bfef95601890afd80709",
    );
  });

  it("identifies likely hexadecimal digest formats by length", () => {
    expect(identifyHashFormats("900150983CD24FB0D6963F7D28E17F72")).toEqual([
      "MD5 / NTLM",
    ]);
    expect(identifyHashFormats("a".repeat(64))).toEqual(["SHA-256"]);
    expect(identifyHashFormats("not-a-hash")).toEqual([]);
  });

  it("bounds text input", () => {
    expect(validateHashText("abc")).toBe("abc");
    expect(() => validateHashText("a".repeat(1_000_001))).toThrow(/1,000,000/i);
  });
});

