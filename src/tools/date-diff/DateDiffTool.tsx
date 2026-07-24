import { useMemo, useState } from "react";

import {
  ToolOutput,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { calculateDateDifference } from "./date-diff";

const copy = {
  en: {
    title: "Date difference",
    description:
      "Compare calendar years, months, and days with exact elapsed days between two dates.",
    dates: "Dates",
    start: "Start date",
    end: "End date",
    swap: "Swap dates",
    result: "Difference result",
    empty: "The date difference appears here.",
    before: "End is before start",
    after: "End is after start",
    equal: "Dates are equal",
    calendar: "Calendar difference",
    elapsed: "Elapsed",
    totalDays: "total days",
    dateOnly:
      "Dates are compared at UTC date boundaries, so daylight-saving changes do not alter total days.",
  },
  vi: {
    title: "Khoảng cách ngày",
    description:
      "So sánh năm, tháng, ngày theo lịch với số ngày thực giữa hai ngày.",
    dates: "Ngày",
    start: "Ngày bắt đầu",
    end: "Ngày kết thúc",
    swap: "Đổi hai ngày",
    result: "Kết quả chênh lệch",
    empty: "Khoảng cách ngày sẽ hiện ở đây.",
    before: "Ngày kết thúc trước ngày bắt đầu",
    after: "Ngày kết thúc sau ngày bắt đầu",
    equal: "Hai ngày bằng nhau",
    calendar: "Chênh lệch theo lịch",
    elapsed: "Thời gian thực",
    totalDays: "tổng số ngày",
    dateOnly:
      "Ngày được so sánh tại ranh giới ngày UTC nên giờ mùa hè không làm thay đổi tổng số ngày.",
  },
} as const;

function englishUnit(value: number, unit: string) {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

export default function DateDiffTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [start, setStart] = useState("2023-01-31");
  const [end, setEnd] = useState("2023-03-01");
  const result = useMemo(() => {
    try {
      const difference = calculateDateDifference(start, end);
      const calendar =
        locale === "vi"
          ? `${difference.years} năm, ${difference.months} tháng, ${difference.days} ngày`
          : [
              englishUnit(difference.years, "year"),
              englishUnit(difference.months, "month"),
              englishUnit(difference.days, "day"),
            ].join(", ");
      const weeks =
        locale === "vi"
          ? `${difference.weeks} tuần, ${difference.remainingDays} ngày`
          : `${englishUnit(difference.weeks, "week")}, ${englishUnit(difference.remainingDays, "day")}`;
      const direction =
        difference.sign === 0
          ? t.equal
          : difference.sign > 0
            ? t.after
            : t.before;
      return {
        output: [
          direction,
          `${t.calendar}: ${calendar}`,
          `${t.elapsed}: ${difference.totalDays} ${t.totalDays}`,
          weeks,
          `${difference.elapsedMilliseconds} ms`,
        ].join("\n"),
        error: "",
      };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [end, locale, start, t]);

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel title={t.dates}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(
              [
                [t.start, start, setStart],
                [t.end, end, setEnd],
              ] as const
            ).map(([label, value, update]) => (
              <label
                key={label}
                className="text-xs font-semibold text-[var(--vt-text-2)]"
              >
                {label}
                <input
                  type="date"
                  aria-label={label}
                  value={value}
                  onChange={(event) => update(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            aria-label={t.swap}
            onClick={() => {
              setStart(end);
              setEnd(start);
            }}
            className="mt-4 rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]"
          >
            ⇄ {t.swap}
          </button>
          <p className="mt-4 text-xs leading-5 text-[var(--vt-text-3)]">
            {t.dateOnly}
          </p>
        </ToolPanel>
        <ToolPanel title={t.result}>
          {result.error ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs text-[var(--vt-red)]"
            >
              {result.error}
            </p>
          ) : (
            <ToolOutput
              label={t.result}
              value={result.output}
              emptyLabel={t.empty}
            />
          )}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}
