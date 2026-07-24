import { useMemo, useState } from "react";

import {
  CopyButton,
  ToolOutput,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  dateTimeToTimestamp,
  parseUnixTimestamp,
  type TimestampUnit,
} from "./timestamp";

type Direction = "timestamp-to-date" | "date-to-timestamp";

const copy = {
  en: {
    title: "Unix timestamp",
    description:
      "Convert Unix seconds or milliseconds to UTC and local dates, or convert back to epoch values.",
    direction: "Conversion direction",
    timestampToDate: "Timestamp → date",
    dateToTimestamp: "Local date → timestamp",
    unit: "Timestamp unit",
    auto: "Auto-detect",
    seconds: "Seconds",
    milliseconds: "Milliseconds",
    timestamp: "Unix timestamp",
    localDate: "Local date and time",
    now: "Use current time",
    result: "Conversion result",
    empty: "Conversion results appear here.",
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Copy failed",
    localDisclosure:
      "Local date input and output use your browser's current time zone.",
  },
  vi: {
    title: "Unix Timestamp",
    description:
      "Đổi giây hoặc mili giây Unix sang UTC và giờ địa phương, hoặc đổi ngược về epoch.",
    direction: "Hướng chuyển đổi",
    timestampToDate: "Timestamp → ngày giờ",
    dateToTimestamp: "Ngày địa phương → timestamp",
    unit: "Đơn vị timestamp",
    auto: "Tự nhận diện",
    seconds: "Giây",
    milliseconds: "Mili giây",
    timestamp: "Dấu thời gian Unix",
    localDate: "Ngày giờ địa phương",
    now: "Dùng thời gian hiện tại",
    result: "Kết quả chuyển đổi",
    empty: "Kết quả chuyển đổi sẽ hiện ở đây.",
    copy: "Sao chép kết quả",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    localDisclosure:
      "Ngày giờ địa phương đầu vào và đầu ra dùng múi giờ hiện tại của trình duyệt.",
  },
} as const;

function localDateTimeValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function TimestampTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [direction, setDirection] = useState<Direction>("timestamp-to-date");
  const [unit, setUnit] = useState<TimestampUnit>("auto");
  const [timestamp, setTimestamp] = useState("0");
  const [localDate, setLocalDate] = useState(() =>
    localDateTimeValue(new Date()),
  );
  const result = useMemo(() => {
    try {
      if (direction === "timestamp-to-date") {
        const value = parseUnixTimestamp(timestamp, unit);
        return {
          output: [
            `ISO 8601: ${value.iso}`,
            `UTC: ${value.utc}`,
            `Local: ${value.local}`,
            `Unix seconds: ${value.seconds}`,
            `Unix milliseconds: ${value.milliseconds}`,
          ].join("\n"),
          error: "",
        };
      }
      const value = dateTimeToTimestamp(localDate);
      return {
        output: [
          `ISO 8601: ${value.iso}`,
          `Unix seconds: ${value.seconds}`,
          `Unix milliseconds: ${value.milliseconds}`,
        ].join("\n"),
        error: "",
      };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [direction, localDate, timestamp, unit]);

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.direction}
          <select
            aria-label={t.direction}
            value={direction}
            onChange={(event) => setDirection(event.target.value as Direction)}
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)]"
          >
            <option value="timestamp-to-date">{t.timestampToDate}</option>
            <option value="date-to-timestamp">{t.dateToTimestamp}</option>
          </select>
        </label>
        {direction === "timestamp-to-date" ? (
          <label className="text-xs font-semibold text-[var(--vt-text-2)]">
            {t.unit}
            <select
              aria-label={t.unit}
              value={unit}
              onChange={(event) =>
                setUnit(event.target.value as TimestampUnit)
              }
              className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)]"
            >
              <option value="auto">{t.auto}</option>
              <option value="seconds">{t.seconds}</option>
              <option value="milliseconds">{t.milliseconds}</option>
            </select>
          </label>
        ) : null}
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel
          title={
            direction === "timestamp-to-date" ? t.timestamp : t.localDate
          }
        >
          {direction === "timestamp-to-date" ? (
            <>
              <label className="block">
                <span className="sr-only">{t.timestamp}</span>
                <input
                  aria-label={t.timestamp}
                  value={timestamp}
                  onChange={(event) => setTimestamp(event.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2.5 font-mono text-sm text-[var(--vt-text)]"
                />
              </label>
              <button
                type="button"
                aria-label={t.now}
                onClick={() => {
                  setTimestamp(String(Math.floor(Date.now() / 1000)));
                  setUnit("seconds");
                }}
                className="mt-3 rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]"
              >
                {t.now}
              </button>
            </>
          ) : (
            <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
              {t.localDate}
              <input
                type="datetime-local"
                aria-label={t.localDate}
                value={localDate}
                onChange={(event) => setLocalDate(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2.5 text-sm text-[var(--vt-text)]"
              />
            </label>
          )}
          <p className="mt-3 text-xs leading-5 text-[var(--vt-text-3)]">
            {t.localDisclosure}
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
          <div className="mt-3">
            <CopyButton
              value={result.output}
              label={t.copy}
              copiedLabel={t.copied}
              failedLabel={t.copyFailed}
            />
          </div>
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

