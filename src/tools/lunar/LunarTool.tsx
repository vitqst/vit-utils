import { useMemo, useState } from "react";

import {
  ToolOutput,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { getCanChiYear, lunarToSolar, solarToLunar } from "./lunar";

type Direction = "solar-to-lunar" | "lunar-to-solar";

const copy = {
  en: {
    title: "Lunar calendar",
    description:
      "Convert Gregorian and Vietnamese lunar dates locally with leap-month support.",
    direction: "Conversion direction",
    solarToLunar: "Gregorian → lunar",
    lunarToSolar: "Lunar → Gregorian",
    solarDate: "Gregorian date",
    lunarDay: "Lunar day",
    lunarMonth: "Lunar month",
    lunarYear: "Lunar year",
    leap: "Leap month",
    result: "Conversion result",
    empty: "Converted date appears here.",
    leapLabel: "leap month",
    method:
      "Vietnamese lunar convention (UTC+7), Hồ Ngọc Đức algorithm. Supported years: 1800–2199.",
  },
  vi: {
    title: "Đổi lịch âm",
    description:
      "Chuyển đổi cục bộ giữa ngày dương và âm lịch Việt Nam, có hỗ trợ tháng nhuận.",
    direction: "Hướng chuyển đổi",
    solarToLunar: "Dương lịch → âm lịch",
    lunarToSolar: "Âm lịch → dương lịch",
    solarDate: "Ngày dương lịch",
    lunarDay: "Ngày âm",
    lunarMonth: "Tháng âm",
    lunarYear: "Năm âm",
    leap: "Tháng nhuận",
    result: "Kết quả chuyển đổi",
    empty: "Ngày đã chuyển đổi sẽ hiện ở đây.",
    leapLabel: "tháng nhuận",
    method:
      "Quy ước âm lịch Việt Nam (UTC+7), thuật toán Hồ Ngọc Đức. Hỗ trợ năm 1800–2199.",
  },
} as const;

export default function LunarTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [direction, setDirection] = useState<Direction>("solar-to-lunar");
  const [solarDate, setSolarDate] = useState("2024-02-10");
  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("1");
  const [year, setYear] = useState("2024");
  const [leap, setLeap] = useState(false);
  const result = useMemo(() => {
    try {
      if (direction === "solar-to-lunar") {
        const match = solarDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) throw new Error("Enter a Gregorian date.");
        const converted = solarToLunar({
          year: Number(match[1]),
          month: Number(match[2]),
          day: Number(match[3]),
        });
        return {
          output: [
            `${converted.day}/${converted.month}/${converted.year}${converted.leap ? ` (${t.leapLabel})` : ""}`,
            `Can Chi: ${getCanChiYear(converted.year)}`,
          ].join("\n"),
          error: "",
        };
      }
      const converted = lunarToSolar({
        day: Number(day),
        month: Number(month),
        year: Number(year),
        leap,
      });
      const pad = (value: number) => String(value).padStart(2, "0");
      return {
        output: `${converted.year}-${pad(converted.month)}-${pad(converted.day)}`,
        error: "",
      };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [day, direction, leap, month, solarDate, t.leapLabel, year]);

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.direction}
          <select
            aria-label={t.direction}
            value={direction}
            onChange={(event) => setDirection(event.target.value as Direction)}
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)]"
          >
            <option value="solar-to-lunar">{t.solarToLunar}</option>
            <option value="lunar-to-solar">{t.lunarToSolar}</option>
          </select>
        </label>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel
          title={direction === "solar-to-lunar" ? t.solarDate : t.lunarToSolar}
        >
          {direction === "solar-to-lunar" ? (
            <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
              {t.solarDate}
              <input
                type="date"
                aria-label={t.solarDate}
                value={solarDate}
                min="1800-01-01"
                max="2199-12-31"
                onChange={(event) => setSolarDate(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2.5 text-sm text-[var(--vt-text)]"
              />
            </label>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    [t.lunarDay, day, setDay, 1, 30],
                    [t.lunarMonth, month, setMonth, 1, 12],
                    [t.lunarYear, year, setYear, 1800, 2199],
                  ] as const
                ).map(([label, value, update, min, max]) => (
                  <label
                    key={label}
                    className="text-xs font-semibold text-[var(--vt-text-2)]"
                  >
                    {label}
                    <input
                      type="number"
                      aria-label={label}
                      value={value}
                      min={min}
                      max={max}
                      onChange={(event) => update(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-2 py-2 font-mono text-sm text-[var(--vt-text)]"
                    />
                  </label>
                ))}
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm text-[var(--vt-text)]">
                <input
                  type="checkbox"
                  checked={leap}
                  onChange={(event) => setLeap(event.target.checked)}
                />
                {t.leap}
              </label>
            </>
          )}
          <p className="mt-4 text-xs leading-5 text-[var(--vt-text-3)]">
            {t.method}
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

