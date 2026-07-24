import { describe, expect, it } from "vitest";

import {
  dateTimeToTimestamp,
  parseUnixTimestamp,
} from "./timestamp";

describe("Unix timestamp conversion", () => {
  it("auto-detects seconds and milliseconds", () => {
    expect(parseUnixTimestamp("0", "auto")).toMatchObject({
      seconds: 0,
      milliseconds: 0,
      iso: "1970-01-01T00:00:00.000Z",
      detectedUnit: "seconds",
    });
    expect(parseUnixTimestamp("1767225600000", "auto")).toMatchObject({
      seconds: 1767225600,
      milliseconds: 1767225600000,
      iso: "2026-01-01T00:00:00.000Z",
      detectedUnit: "milliseconds",
    });
  });

  it("respects explicit units and fractional seconds", () => {
    expect(parseUnixTimestamp("1.5", "seconds").milliseconds).toBe(1500);
    expect(parseUnixTimestamp("1500", "milliseconds").seconds).toBe(1.5);
  });

  it("converts a local date-time through the native browser time zone", () => {
    const expected = new Date(2026, 0, 1, 12, 30).getTime();
    expect(dateTimeToTimestamp("2026-01-01T12:30")).toEqual({
      seconds: expected / 1000,
      milliseconds: expected,
      iso: new Date(expected).toISOString(),
    });
  });

  it.each(["", "abc", "Infinity", "999999999999999999999"])(
    "rejects invalid input: %s",
    (input) => {
      expect(() => parseUnixTimestamp(input, "auto")).toThrow();
    },
  );
});

