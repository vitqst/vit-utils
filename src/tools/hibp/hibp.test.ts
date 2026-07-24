import { describe, expect, it } from "vitest";

import {
  derivePwnedPasswordRange,
  parsePwnedRangeResponse,
  validatePwnedPassword,
} from "./hibp";

describe("HIBP k-anonymity helpers", () => {
  it("derives the known SHA-1 five-character range without exposing the password", () => {
    expect(derivePwnedPasswordRange("password")).toEqual({
      prefix: "5BAA6",
      suffix: "1E4C9B93F3F0682250B6CF8331B7EE68FD8",
    });
  });

  it("finds an exact suffix and discards zero-count padding", () => {
    const suffix = "1E4C9B93F3F0682250B6CF8331B7EE68FD8";
    expect(
      parsePwnedRangeResponse(
        `00000000000000000000000000000000000:0\r\n${suffix}:42\r\nABCDEFABCDEFABCDEFABCDEFABCDEFABCDE:7\r\n`,
        suffix,
      ),
    ).toBe(42);
    expect(
      parsePwnedRangeResponse(
        "ABCDEFABCDEFABCDEFABCDEFABCDEFABCDE:7\r\n",
        suffix,
      ),
    ).toBe(0);
  });

  it("rejects malformed, oversized, empty, and excessive input", () => {
    expect(() => parsePwnedRangeResponse("bad", "A".repeat(35))).toThrow(
      /response/i,
    );
    expect(() => validatePwnedPassword("")).toThrow(/password/i);
    expect(() => validatePwnedPassword("a".repeat(257))).toThrow(/256/i);
  });
});

