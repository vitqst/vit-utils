import { describe, expect, it } from "vitest";

import {
  getCanChiYear,
  lunarToSolar,
  solarToLunar,
} from "./lunar";

describe("Vietnamese lunar conversion", () => {
  it("converts known Tết dates from Gregorian to lunar", () => {
    expect(solarToLunar({ day: 10, month: 2, year: 2024 })).toEqual({
      day: 1,
      month: 1,
      year: 2024,
      leap: false,
    });
    expect(solarToLunar({ day: 17, month: 2, year: 2026 })).toEqual({
      day: 1,
      month: 1,
      year: 2026,
      leap: false,
    });
  });

  it("converts lunar dates back to Gregorian, including a leap month", () => {
    expect(
      lunarToSolar({ day: 1, month: 1, year: 2024, leap: false }),
    ).toEqual({ day: 10, month: 2, year: 2024 });
    expect(
      lunarToSolar({ day: 1, month: 2, year: 2023, leap: true }),
    ).toEqual({ day: 22, month: 3, year: 2023 });
  });

  it("returns Vietnamese can-chi year names", () => {
    expect(getCanChiYear(2024)).toBe("Giáp Thìn");
    expect(getCanChiYear(2026)).toBe("Bính Ngọ");
  });

  it("rejects invalid dates, leap selections, and years outside the range", () => {
    expect(() => solarToLunar({ day: 30, month: 2, year: 2024 })).toThrow();
    expect(() =>
      lunarToSolar({ day: 1, month: 3, year: 2023, leap: true }),
    ).toThrow(/leap/i);
    expect(() => solarToLunar({ day: 1, month: 1, year: 1799 })).toThrow(
      /1800.*2199/,
    );
  });
});

