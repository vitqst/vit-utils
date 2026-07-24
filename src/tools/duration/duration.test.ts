import { describe, expect, it } from "vitest";

import {
  formatClockDuration,
  humanizeDuration,
  parseDuration,
} from "./duration";

describe("duration conversion", () => {
  it("parses milliseconds, seconds, and clock notation exactly", () => {
    expect(parseDuration("1500", "milliseconds")).toBe(1500);
    expect(parseDuration("1.5", "seconds")).toBe(1500);
    expect(parseDuration("01:02:03.004", "clock")).toBe(3_723_004);
    expect(parseDuration("1:02:03:04.005", "clock")).toBe(93_784_005);
    expect(parseDuration("-02:30", "clock")).toBe(-150_000);
  });

  it("formats normalized clocks with days and signs", () => {
    expect(formatClockDuration(3_723_004)).toBe("01:02:03.004");
    expect(formatClockDuration(93_784_005)).toBe("1:02:03:04.005");
    expect(formatClockDuration(-150_000)).toBe("-00:02:30.000");
  });

  it("humanizes exact parts in English and Vietnamese", () => {
    expect(humanizeDuration(3_723_004, "en")).toBe(
      "1 hour, 2 minutes, 3 seconds, 4 milliseconds",
    );
    expect(humanizeDuration(3_723_004, "vi")).toBe(
      "1 giờ, 2 phút, 3 giây, 4 mili giây",
    );
    expect(humanizeDuration(0, "en")).toBe("0 milliseconds");
  });

  it.each(["", "abc", "1:60", "1:24:00:00", "Infinity"])(
    "rejects invalid input: %s",
    (input) => {
      expect(() => parseDuration(input, "clock")).toThrow();
    },
  );
});

