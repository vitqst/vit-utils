import { Cron } from "croner";

export interface CronFields {
  minute: string;
  hour: string;
  day: string;
  month: string;
  weekday: string;
}

export const CRON_PRESETS = [
  {
    id: "quarter-hour",
    expression: "*/15 * * * *",
    en: "Every 15 minutes",
    vi: "Mỗi 15 phút",
  },
  {
    id: "hourly",
    expression: "0 * * * *",
    en: "Every hour",
    vi: "Mỗi giờ",
  },
  {
    id: "daily",
    expression: "0 9 * * *",
    en: "Daily at 09:00",
    vi: "Hằng ngày lúc 09:00",
  },
  {
    id: "weekly",
    expression: "0 9 * * 1",
    en: "Mondays at 09:00",
    vi: "Thứ Hai lúc 09:00",
  },
  {
    id: "monthly",
    expression: "0 9 1 * *",
    en: "First day monthly at 09:00",
    vi: "Ngày đầu tháng lúc 09:00",
  },
] as const;

export function buildCronExpression(fields: CronFields) {
  return [
    fields.minute,
    fields.hour,
    fields.day,
    fields.month,
    fields.weekday,
  ]
    .map((field) => field.trim())
    .join(" ");
}

export type SplitCronResult =
  | { ok: true; fields: CronFields }
  | { ok: false; error: string };

export function splitCronExpression(expression: string): SplitCronResult {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      ok: false,
      error: "A cron expression must contain exactly five fields.",
    };
  }

  const [minute, hour, day, month, weekday] = parts;
  return {
    ok: true,
    fields: { minute, hour, day, month, weekday },
  };
}

function describeExpression(expression: string) {
  const preset = CRON_PRESETS.find((item) => item.expression === expression);
  if (preset) return { en: preset.en, vi: preset.vi };

  const split = splitCronExpression(expression);
  if (!split.ok) {
    return {
      en: "Invalid five-field schedule",
      vi: "Lịch năm trường không hợp lệ",
    };
  }

  const { minute, hour, day, month, weekday } = split.fields;
  return {
    en: `Minute ${minute}; hour ${hour}; day ${day}; month ${month}; weekday ${weekday}`,
    vi: `Phút ${minute}; giờ ${hour}; ngày ${day}; tháng ${month}; thứ ${weekday}`,
  };
}

export type CronPreviewResult =
  | {
      ok: true;
      runs: Date[];
      summary: { en: string; vi: string };
    }
  | { ok: false; error: string };

export function previewCron(
  expression: string,
  referenceDate: Date,
  count = 5,
): CronPreviewResult {
  const normalized = expression.trim().replace(/\s+/g, " ");
  const split = splitCronExpression(normalized);
  if (!split.ok) return split;

  try {
    const cron = new Cron(normalized, { mode: "5-part" });
    const runs = cron.nextRuns(Math.min(Math.max(count, 1), 10), referenceDate);
    return {
      ok: true,
      runs,
      summary: describeExpression(normalized),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to parse the cron expression.",
    };
  }
}

