import { describe, expect, it } from "vitest";

import {
  certificateBytesFromPem,
  certificateValidityState,
  formatFingerprint,
  validateCertificateBytes,
} from "./certificate";

describe("X.509 input helpers", () => {
  it("decodes a single PEM certificate block", () => {
    expect(
      Array.from(
        certificateBytesFromPem(
          "-----BEGIN CERTIFICATE-----\nMAMCAQE=\n-----END CERTIFICATE-----",
        ),
      ),
    ).toEqual([48, 3, 2, 1, 1]);
    expect(() =>
      certificateBytesFromPem(
        "-----BEGIN PRIVATE KEY-----\nMAMCAQE=\n-----END PRIVATE KEY-----",
      ),
    ).toThrow(/certificate/i);
  });

  it("reports not-yet-valid, valid, and expired states", () => {
    const now = new Date("2026-07-24T00:00:00Z");
    expect(
      certificateValidityState(
        new Date("2026-07-25T00:00:00Z"),
        new Date("2027-01-01T00:00:00Z"),
        now,
      ),
    ).toBe("not-yet-valid");
    expect(
      certificateValidityState(
        new Date("2026-01-01T00:00:00Z"),
        new Date("2027-01-01T00:00:00Z"),
        now,
      ),
    ).toBe("valid");
    expect(
      certificateValidityState(
        new Date("2025-01-01T00:00:00Z"),
        new Date("2026-01-01T00:00:00Z"),
        now,
      ),
    ).toBe("expired");
  });

  it("formats fingerprints and enforces the file bound", () => {
    expect(formatFingerprint(new Uint8Array([0, 15, 255]))).toBe("00:0F:FF");
    expect(validateCertificateBytes(new Uint8Array([1]))).toHaveLength(1);
    expect(() => validateCertificateBytes(new Uint8Array())).toThrow(/empty/i);
  });
});

