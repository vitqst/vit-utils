import { describe, expect, it } from "vitest";

import {
  hashBytes,
  parseExpectedChecksum,
  verifyChecksum,
} from "./checksum";

const bytes = new TextEncoder().encode("abc");

describe("file checksum helpers", () => {
  it("matches standard hash vectors", () => {
    expect(hashBytes("sha256", bytes)).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(hashBytes("sha1", bytes)).toBe(
      "a9993e364706816aba3e25717850c26c9cd0d89d",
    );
    expect(hashBytes("md5", bytes)).toBe(
      "900150983cd24fb0d6963f7d28e17f72",
    );
  });

  it("parses bare, GNU, and BSD checksum forms", () => {
    const hash = "a".repeat(64);
    expect(parseExpectedChecksum(hash, "sha256")).toBe(hash);
    expect(parseExpectedChecksum(`${hash} *photo.jpg`, "sha256")).toBe(hash);
    expect(
      parseExpectedChecksum(`SHA256 (photo.jpg) = ${hash}`, "sha256"),
    ).toBe(hash);
    expect(() => parseExpectedChecksum("abcd", "sha256")).toThrow(/64/i);
  });

  it("compares normalized checksums", () => {
    expect(verifyChecksum("ABCD", "abcd")).toBe(true);
    expect(verifyChecksum("abce", "abcd")).toBe(false);
  });
});

