import { useMemo, useState } from "react";

import {
  ToolOutput,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { convertTimeZones, getSupportedTimeZones } from "./timezone";

const copy = {
  en: {
    title: "Timezone converter",
    description:
      "Interpret a wall time in one IANA zone and compare the same instant across other zones.",
    input: "Source time",
    localDate: "Local date and time",
    source: "Source time zone",
    firstTarget: "First target zone",
    secondTarget: "Second target zone",
    output: "Converted times",
    empty: "Converted zone times appear here.",
    ambiguous:
      "This local time occurs twice. The earlier matching instant is shown.",
    disclosure:
      "Offsets and daylight-saving rules come from your browser's installed IANA time-zone data.",
  },
  vi: {
    title: "Đổi múi giờ",
    description:
      "Diễn giải giờ địa phương trong một múi giờ IANA và so sánh cùng thời điểm ở các múi giờ khác.",
    input: "Thời gian nguồn",
    localDate: "Ngày giờ địa phương",
    source: "Múi giờ nguồn",
    firstTarget: "Múi giờ đích thứ nhất",
    secondTarget: "Múi giờ đích thứ hai",
    output: "Thời gian đã đổi",
    empty: "Thời gian ở các múi giờ sẽ hiện ở đây.",
    ambiguous:
      "Giờ địa phương này xuất hiện hai lần. Kết quả sớm hơn được hiển thị.",
    disclosure:
      "Độ lệch và quy tắc giờ mùa hè lấy từ dữ liệu múi giờ IANA của trình duyệt.",
  },
} as const;

export default function TimezoneTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const zones = useMemo(() => getSupportedTimeZones(), []);
  const [dateTime, setDateTime] = useState("2026-01-01T07:00");
  const [sourceZone, setSourceZone] = useState("Asia/Ho_Chi_Minh");
  const [firstTarget, setFirstTarget] = useState("UTC");
  const [secondTarget, setSecondTarget] = useState("America/New_York");
  const result = useMemo(() => {
    try {
      const conversion = convertTimeZones(
        dateTime,
        sourceZone,
        [firstTarget, secondTarget],
        locale,
      );
      return {
        output: [
          `ISO 8601: ${conversion.iso}`,
          ...conversion.targets.map(
            (target) =>
              `${target.zone} (${target.offset}): ${target.formatted}`,
          ),
        ].join("\n"),
        ambiguous: conversion.ambiguous,
        error: "",
      };
    } catch (error) {
      return {
        output: "",
        ambiguous: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [dateTime, firstTarget, locale, secondTarget, sourceZone]);

  const zoneSelect = (
    label: string,
    value: string,
    update: (value: string) => void,
  ) => (
    <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => update(event.target.value)}
        className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
      >
        {zones.map((zone) => (
          <option key={zone} value={zone}>
            {zone}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel title={t.input}>
          <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.localDate}
            <input
              type="datetime-local"
              aria-label={t.localDate}
              value={dateTime}
              onChange={(event) => setDateTime(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
            />
          </label>
          <div className="mt-4">{zoneSelect(t.source, sourceZone, setSourceZone)}</div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {zoneSelect(t.firstTarget, firstTarget, setFirstTarget)}
            {zoneSelect(t.secondTarget, secondTarget, setSecondTarget)}
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--vt-text-3)]">
            {t.disclosure}
          </p>
        </ToolPanel>
        <ToolPanel title={t.output}>
          {result.error ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs text-[var(--vt-red)]"
            >
              {result.error}
            </p>
          ) : (
            <>
              {result.ambiguous ? (
                <p
                  role="status"
                  className="mb-3 rounded-lg border border-[var(--vt-yellow)]/40 bg-[var(--vt-yellow)]/10 p-3 text-xs text-[var(--vt-text)]"
                >
                  {t.ambiguous}
                </p>
              ) : null}
              <ToolOutput
                label={t.output}
                value={result.output}
                emptyLabel={t.empty}
              />
            </>
          )}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

