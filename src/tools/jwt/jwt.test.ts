import { describe, expect, it } from "vitest";

import { decodeJwt } from "./jwt";

function segment(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function token(header: unknown, payload: unknown, signature = "signature") {
  return `${segment(header)}.${segment(payload)}.${signature}`;
}

describe("JWT decoding", () => {
  it("decodes Unicode header and payload objects without verifying a signature", () => {
    const result = decodeJwt(
      token(
        { alg: "HS256", typ: "JWT" },
        { sub: "123", name: "Nguyễn An" },
      ),
      new Date("2026-01-01T00:00:00.000Z"),
    );

    expect(result.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(result.payload).toEqual({ sub: "123", name: "Nguyễn An" });
    expect(result.signature).toBe("signature");
    expect(result.signatureVerified).toBe(false);
  });

  it("summarizes numeric time claims relative to the supplied time", () => {
    const result = decodeJwt(
      token(
        { alg: "none" },
        {
          exp: 1767225599,
          nbf: 1767225601,
          iat: 1767225000,
        },
        "",
      ),
      new Date("2026-01-01T00:00:00.000Z"),
    );

    expect(result.timeClaims).toMatchObject([
      { name: "exp", status: "expired" },
      { name: "nbf", status: "future" },
      { name: "iat", status: "issued" },
    ]);
  });

  it.each([
    ["two.segments", /three segments/i],
    ["%%%.e30.signature", /base64/i],
    [`${segment([])}.${segment({})}.signature`, /object/i],
    [`${segment({})}.${segment("text")}.signature`, /object/i],
  ])("rejects malformed token %s", (value, message) => {
    expect(() => decodeJwt(value)).toThrow(message);
  });
});
