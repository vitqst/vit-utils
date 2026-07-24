import { describe, expect, it } from "vitest";

import {
  decodeBase64Bytes,
  decodeBase64Text,
  encodeBase64Bytes,
  encodeBase64Text,
} from "./base64";

describe("Base64 conversion", () => {
  it("round-trips UTF-8 text", () => {
    const encoded = encodeBase64Text("Xin chào 👋", false);

    expect(encoded).toBe("WGluIGNow6BvIPCfkYs=");
    expect(decodeBase64Text(encoded, false)).toBe("Xin chào 👋");
  });

  it("encodes and decodes unpadded Base64url", () => {
    const encoded = encodeBase64Text("a?b/c+d", true);

    expect(encoded).not.toMatch(/[+/=]/);
    expect(decodeBase64Text(encoded, true)).toBe("a?b/c+d");
  });

  it("ignores ASCII whitespace while decoding", () => {
    expect(decodeBase64Text("SGVs\n bG8=\t", false)).toBe("Hello");
  });

  it("round-trips arbitrary bytes without text conversion", () => {
    const bytes = new Uint8Array([0, 1, 2, 127, 128, 255]);
    expect(decodeBase64Bytes(encodeBase64Bytes(bytes, false), false)).toEqual(
      bytes,
    );
  });

  it.each(["abcde", "%%%=", "A===", "AA=A"])(
    "rejects invalid Base64 input %s",
    (value) => {
      expect(() => decodeBase64Bytes(value, false)).toThrow(/base64/i);
    },
  );

  it("rejects decoded bytes that are not valid UTF-8 text", () => {
    expect(() => decodeBase64Text("/w==", false)).toThrow(/utf-8/i);
  });
});
