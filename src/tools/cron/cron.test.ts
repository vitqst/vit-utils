import { describe, expect, it } from "vitest";

import {
  buildCronExpression,
  CRON_PRESETS,
  previewCron,
  splitCronExpression,
} from "./cron";

const reference = new Date("2026-01-01T00:00:00.000Z");

describe("cron domain", () => {
  it("builds and splits a five-field expression", () => {
    const fields = {
      minute: "*/15",
      hour: "*",
      day: "*",
      month: "*",
      weekday: "*",
    };

    expect(buildCronExpression(fields)).toBe("*/15 * * * *");
    expect(splitCronExpression("  */15   * * * * ")).toEqual({
      ok: true,
      fields,
    });
  });

  it("previews deterministic upcoming runs without scheduling", () => {
    const result = previewCron("*/15 * * * *", reference, 3);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.runs.map((date) => date.toISOString())).toEqual([
        "2026-01-01T00:15:00.000Z",
        "2026-01-01T00:30:00.000Z",
        "2026-01-01T00:45:00.000Z",
      ]);
      expect(result.summary.en).toMatch(/15 minutes/i);
      expect(result.summary.vi).toMatch(/15 phút/i);
    }
  });

  it("supports common presets", () => {
    expect(CRON_PRESETS.map(({ expression }) => expression)).toEqual([
      "*/15 * * * *",
      "0 * * * *",
      "0 9 * * *",
      "0 9 * * 1",
      "0 9 1 * *",
    ]);
  });

  it.each(["* * *", "61 * * * *", "not-a-cron * * * *"])(
    "returns validation errors for %s",
    (expression) => {
      expect(previewCron(expression, reference).ok).toBe(false);
    },
  );
});

