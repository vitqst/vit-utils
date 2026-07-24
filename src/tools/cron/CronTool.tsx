import { useMemo, useState } from "react";

import {
  ToolGrid,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  buildCronExpression,
  CRON_PRESETS,
  previewCron,
  splitCronExpression,
  type CronFields,
} from "./cron";

const copy = {
  en: {
    title: "Cron builder",
    description:
      "Build a five-field cron schedule and preview upcoming runs without scheduling anything.",
    presets: "Presets",
    expression: "Cron expression",
    fields: "Schedule fields",
    minute: "Minute",
    hour: "Hour",
    day: "Day of month",
    month: "Month",
    weekday: "Day of week",
    preview: "Schedule preview",
    summary: "Summary",
    nextRuns: "Next five runs",
    localTime:
      "Run times are calculated and displayed in your browser's local time zone.",
  },
  vi: {
    title: "Cron builder",
    description:
      "Tạo lịch cron năm trường và xem trước các lần chạy mà không lên lịch tác vụ.",
    presets: "Mẫu lịch",
    expression: "Biểu thức cron",
    fields: "Các trường lịch",
    minute: "Phút",
    hour: "Giờ",
    day: "Ngày trong tháng",
    month: "Tháng",
    weekday: "Thứ trong tuần",
    preview: "Xem trước lịch",
    summary: "Tóm tắt",
    nextRuns: "Năm lần chạy tiếp theo",
    localTime:
      "Thời gian chạy được tính và hiển thị theo giờ địa phương của trình duyệt.",
  },
} as const;

const fieldKeys = [
  "minute",
  "hour",
  "day",
  "month",
  "weekday",
] as const satisfies ReadonlyArray<keyof CronFields>;

const initialExpression = CRON_PRESETS[0].expression;
const initialFields = splitCronExpression(initialExpression);

export default function CronTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [referenceDate] = useState(() => new Date());
  const [expression, setExpression] = useState<string>(initialExpression);
  const [fields, setFields] = useState<CronFields>(
    initialFields.ok
      ? initialFields.fields
      : { minute: "*", hour: "*", day: "*", month: "*", weekday: "*" },
  );
  const result = useMemo(
    () => previewCron(expression, referenceDate, 5),
    [expression, referenceDate],
  );

  const updateExpression = (value: string) => {
    setExpression(value);
    const split = splitCronExpression(value);
    if (split.ok) setFields(split.fields);
  };

  const updateField = (key: keyof CronFields, value: string) => {
    const next = { ...fields, [key]: value };
    setFields(next);
    setExpression(buildCronExpression(next));
  };

  const applyPreset = (value: string) => {
    const split = splitCronExpression(value);
    setExpression(value);
    if (split.ok) setFields(split.fields);
  };

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <section className="mb-4 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        <h2 className="mb-3 text-sm font-semibold text-[var(--vt-text)]">
          {t.presets}
        </h2>
        <div className="flex flex-wrap gap-2">
          {CRON_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.expression)}
              className="rounded-lg border border-[var(--vt-border-2)] bg-[var(--vt-bg-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-text)] hover:border-[var(--vt-accent)]"
            >
              {preset[locale]}
            </button>
          ))}
        </div>
      </section>
      <ToolGrid>
        <ToolPanel title={t.fields}>
          <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.expression}
            <input
              aria-label={t.expression}
              value={expression}
              onChange={(event) => updateExpression(event.target.value)}
              spellCheck={false}
              className="mt-2 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2.5 font-mono text-sm text-[var(--vt-text)] outline-none focus:border-[var(--vt-accent)]"
            />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {fieldKeys.map((key) => (
              <label
                key={key}
                className="text-xs font-semibold text-[var(--vt-text-2)]"
              >
                {t[key]}
                <input
                  aria-label={t[key]}
                  value={fields[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                  spellCheck={false}
                  className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-2 py-2 font-mono text-sm text-[var(--vt-text)] outline-none focus:border-[var(--vt-accent)]"
                />
              </label>
            ))}
          </div>
        </ToolPanel>
        <ToolPanel title={t.preview}>
          {!result.ok ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs leading-5 text-[var(--vt-red)]"
            >
              {result.error}
            </p>
          ) : (
            <>
              <p className="text-sm text-[var(--vt-text)]">
                <span className="font-semibold">{t.summary}:</span>{" "}
                {result.summary[locale]}
              </p>
              <ol
                aria-label={t.nextRuns}
                className="mt-3 space-y-2 font-mono text-xs text-[var(--vt-text-2)]"
              >
                {result.runs.map((run) => (
                  <li
                    key={run.toISOString()}
                    className="rounded-md bg-[var(--vt-bg-0)] px-3 py-2"
                  >
                    {new Intl.DateTimeFormat(
                      locale === "vi" ? "vi-VN" : "en-US",
                      {
                        dateStyle: "medium",
                        timeStyle: "medium",
                      },
                    ).format(run)}
                  </li>
                ))}
              </ol>
            </>
          )}
          <p className="mt-3 text-xs leading-5 text-[var(--vt-text-3)]">
            {t.localTime}
          </p>
        </ToolPanel>
      </ToolGrid>
    </ToolWorkspace>
  );
}

