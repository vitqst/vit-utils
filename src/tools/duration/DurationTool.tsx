import { useMemo, useState } from "react";

import {
  CopyButton,
  ToolOutput,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  formatClockDuration,
  humanizeDuration,
  parseDuration,
  type DurationInputUnit,
} from "./duration";

const copy = {
  en: {
    title: "Duration humanizer",
    description:
      "Convert milliseconds, seconds, and clock notation into exact and readable duration forms.",
    inputFormat: "Input format",
    milliseconds: "Milliseconds",
    seconds: "Seconds",
    clock: "Clock notation",
    input: "Duration input",
    result: "Converted duration",
    empty: "Converted duration appears here.",
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Copy failed",
    fixedDays:
      "Readable days are fixed 24-hour periods, not calendar days or months.",
  },
  vi: {
    title: "Diễn giải thời lượng",
    description:
      "Đổi mili giây, giây và dạng đồng hồ thành các dạng thời lượng chính xác, dễ đọc.",
    inputFormat: "Định dạng đầu vào",
    milliseconds: "Mili giây",
    seconds: "Giây",
    clock: "Dạng đồng hồ",
    input: "Thời lượng đầu vào",
    result: "Thời lượng đã đổi",
    empty: "Thời lượng đã đổi sẽ hiện ở đây.",
    copy: "Sao chép kết quả",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    fixedDays:
      "Ngày dễ đọc là chu kỳ cố định 24 giờ, không phải ngày hoặc tháng theo lịch.",
  },
} as const;

export default function DurationTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [unit, setUnit] = useState<DurationInputUnit>("milliseconds");
  const [input, setInput] = useState("1500");
  const result = useMemo(() => {
    try {
      const milliseconds = parseDuration(input, unit);
      return {
        output: [
          `${milliseconds} milliseconds`,
          `${milliseconds / 1000} seconds`,
          formatClockDuration(milliseconds),
          humanizeDuration(milliseconds, locale),
        ].join("\n"),
        error: "",
      };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [input, locale, unit]);

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel title={t.input}>
          <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.inputFormat}
            <select
              aria-label={t.inputFormat}
              value={unit}
              onChange={(event) =>
                setUnit(event.target.value as DurationInputUnit)
              }
              className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
            >
              <option value="milliseconds">{t.milliseconds}</option>
              <option value="seconds">{t.seconds}</option>
              <option value="clock">{t.clock}</option>
            </select>
          </label>
          <label className="mt-4 block">
            <span className="sr-only">{t.input}</span>
            <input
              aria-label={t.input}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              inputMode={unit === "clock" ? "text" : "decimal"}
              className="w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2.5 font-mono text-sm text-[var(--vt-text)]"
            />
          </label>
          <p className="mt-4 text-xs leading-5 text-[var(--vt-text-3)]">
            {t.fixedDays}
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

