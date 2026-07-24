import { describe, expect, it } from "vitest";

import { countWorkingDays } from "./working-days";

describe("working-day counting", () => {
  it("counts an inclusive range with weekend and holiday exclusions", () => {
    expect(
      countWorkingDays("2026-01-05", "2026-01-11", [0, 6], ["2026-01-06"]),
    ).toEqual({
      sign: 1,
      totalDays: 7,
      workingDays: 4,
      weekendDays: 2,
      holidayDays: 1,
    });
  });

  it("gives holidays precedence over weekends and deduplicates them", () => {
    expect(
      countWorkingDays(
        "2026-01-05",
        "2026-01-11",
        [0, 6],
        ["2026-01-10", "2026-01-10"],
      ),
    ).toMatchObject({
      workingDays: 5,
      weekendDays: 1,
      holidayDays: 1,
    });
  });

  it("handles reversed and single-day ranges", () => {
    expect(
      countWorkingDays("2026-01-11", "2026-01-05", [0, 6], []),
    ).toMatchObject({ sign: -1, totalDays: 7, workingDays: 5 });
    expect(
      countWorkingDays("2026-01-05", "2026-01-05", [0, 6], []),
    ).toEqual({
      sign: 0,
      totalDays: 1,
      workingDays: 1,
      weekendDays: 0,
      holidayDays: 0,
    });
  });

  it("rejects invalid dates, weekday values, and excessive ranges", () => {
    expect(() =>
      countWorkingDays("2026-02-30", "2026-03-01", [0, 6], []),
    ).toThrow();
    expect(() =>
      countWorkingDays("2026-01-01", "2026-01-02", [7], []),
    ).toThrow();
    expect(() =>
      countWorkingDays("1900-01-01", "2100-01-01", [0, 6], []),
    ).toThrow(/20,000/);
  });
});

