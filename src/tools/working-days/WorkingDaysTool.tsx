import { useMemo, useState } from "react";

import {
  ToolOutput,
  ToolPanel,
  ToolTextArea,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { countWorkingDays } from "./working-days";

const copy = {
  en: {
    title: "Working days",
    description:
      "Count an inclusive date range with your own weekend weekdays and local holiday list.",
    settings: "Range and exclusions",
    start: "Start date",
    end: "End date",
    weekends: "Weekend weekdays",
    holidays: "Holiday dates",
    holidayHint: "One YYYY-MM-DD date per line or separated by commas.",
    result: "Working-day result",
    empty: "Working-day totals appear here.",
    forward: "Forward range",
    reverse: "Reversed range",
    same: "Single date",
    calendarDays: "calendar days",
    workingDays: "working days",
    weekendDays: "weekend days",
    holidayDays: "holiday days",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
  vi: {
    title: "Tính ngày làm việc",
    description:
      "Đếm khoảng ngày bao gồm hai đầu với ngày cuối tuần và danh sách nghỉ lễ tùy chỉnh.",
    settings: "Khoảng ngày và loại trừ",
    start: "Ngày bắt đầu",
    end: "Ngày kết thúc",
    weekends: "Các ngày cuối tuần",
    holidays: "Ngày nghỉ lễ",
    holidayHint: "Mỗi dòng một ngày YYYY-MM-DD hoặc phân tách bằng dấu phẩy.",
    result: "Kết quả ngày làm việc",
    empty: "Tổng số ngày làm việc sẽ hiện ở đây.",
    forward: "Khoảng xuôi",
    reverse: "Khoảng đảo ngược",
    same: "Một ngày",
    calendarDays: "ngày theo lịch",
    workingDays: "ngày làm việc",
    weekendDays: "ngày cuối tuần",
    holidayDays: "ngày nghỉ lễ",
    days: ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
  },
} as const;

export default function WorkingDaysTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [start, setStart] = useState("2026-01-05");
  const [end, setEnd] = useState("2026-01-11");
  const [weekends, setWeekends] = useState<number[]>([0, 6]);
  const [holidays, setHolidays] = useState("");
  const result = useMemo(() => {
    try {
      const values = holidays.split(/[\n,]/).map((value) => value.trim());
      const count = countWorkingDays(start, end, weekends, values);
      const direction =
        count.sign === 0 ? t.same : count.sign > 0 ? t.forward : t.reverse;
      const formatCount = (value: number, label: string) =>
        `${value} ${
          locale === "en" && value === 1
            ? label.replace(/days$/, "day")
            : label
        }`;
      return {
        output: [
          direction,
          formatCount(count.totalDays, t.calendarDays),
          formatCount(count.workingDays, t.workingDays),
          formatCount(count.weekendDays, t.weekendDays),
          formatCount(count.holidayDays, t.holidayDays),
        ].join("\n"),
        error: "",
      };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [end, holidays, start, t, weekends]);

  const toggleWeekend = (weekday: number) => {
    setWeekends((current) =>
      current.includes(weekday)
        ? current.filter((value) => value !== weekday)
        : [...current, weekday].sort(),
    );
  };

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel title={t.settings}>
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
          <fieldset className="mt-4">
            <legend className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.weekends}
            </legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {t.days.map((label, weekday) => (
                <label
                  key={label}
                  className="flex items-center gap-1.5 text-xs text-[var(--vt-text)]"
                >
                  <input
                    type="checkbox"
                    checked={weekends.includes(weekday)}
                    onChange={() => toggleWeekend(weekday)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-4">
            <ToolTextArea
              label={t.holidays}
              value={holidays}
              onChange={setHolidays}
              rows={5}
              placeholder="2026-01-01"
            />
            <p className="mt-2 text-xs text-[var(--vt-text-3)]">
              {t.holidayHint}
            </p>
          </div>
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
