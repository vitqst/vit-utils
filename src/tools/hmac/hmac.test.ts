import { describe, expect, it } from "vitest";

import {
  computeHmac,
  decodeHmacValue,
  verifyHmac,
} from "./hmac";

describe("HMAC helpers", () => {
  it("matches the standard HMAC-SHA-256 text vector", async () => {
    expect(
      await computeHmac({
        algorithm: "SHA-256",
        key: "key",
        keyEncoding: "utf8",
        message: "The quick brown fox jumps over the lazy dog",
        messageEncoding: "utf8",
        outputEncoding: "hex",
      }),
    ).toBe("f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8");
  });

  it("decodes strict hex and Base64 and rejects malformed input", () => {
    expect(Array.from(decodeHmacValue("00ff", "hex", false))).toEqual([0, 255]);
    expect(Array.from(decodeHmacValue("AP8=", "base64", false))).toEqual([0, 255]);
    expect(() => decodeHmacValue("0xz", "hex", false)).toThrow(/hex/i);
    expect(() => decodeHmacValue("", "utf8", false)).toThrow(/key/i);
  });

  it("verifies signatures without early character exit", () => {
    expect(verifyHmac(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(true);
    expect(verifyHmac(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(false);
    expect(verifyHmac(new Uint8Array([1]), new Uint8Array([1, 0]))).toBe(false);
  });
});

