import { describe, expect, it } from "vitest";

import { calculateDateDifference } from "./date-diff";

describe("date difference", () => {
  it("distinguishes calendar units from total elapsed days", () => {
    expect(calculateDateDifference("2023-01-31", "2023-03-01")).toEqual({
      sign: 1,
      years: 0,
      months: 1,
      days: 1,
      totalDays: 29,
      weeks: 4,
      remainingDays: 1,
      elapsedMilliseconds: 2_505_600_000,
    });
  });

  it("clamps leap-day calendar anniversaries", () => {
    expect(calculateDateDifference("2024-02-29", "2025-02-28")).toMatchObject({
      sign: 1,
      years: 1,
      months: 0,
      days: 0,
      totalDays: 365,
    });
  });

  it("handles equal and reversed dates with signed elapsed time", () => {
    expect(calculateDateDifference("2026-01-01", "2026-01-01")).toMatchObject({
      sign: 0,
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      elapsedMilliseconds: 0,
    });
    expect(calculateDateDifference("2026-01-10", "2026-01-01")).toMatchObject({
      sign: -1,
      totalDays: 9,
      elapsedMilliseconds: -777_600_000,
    });
  });

  it.each(["2026-02-30", "not-a-date", ""])(
    "rejects invalid dates: %s",
    (value) => {
      expect(() => calculateDateDifference(value, "2026-03-01")).toThrow();
    },
  );
});

