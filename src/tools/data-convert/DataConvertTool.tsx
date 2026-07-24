import { useMemo, useState } from "react";

import {
  CopyButton,
  ToolGrid,
  ToolOutput,
  ToolPanel,
  ToolTextArea,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { convertData, type DataFormat } from "./data-convert";

const copy = {
  en: {
    title: "JSON ↔ YAML ↔ CSV",
    description:
      "Convert structured data locally with strict JSON, safe YAML, and quoted CSV handling.",
    sourceFormat: "Source format",
    targetFormat: "Target format",
    swap: "Swap formats",
    source: "Source data",
    result: "Converted data",
    placeholder: "Paste structured data…",
    empty: "Converted data appears here.",
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Copy failed",
    download: "Download result",
  },
  vi: {
    title: "JSON ↔ YAML ↔ CSV",
    description:
      "Chuyển đổi dữ liệu cục bộ với JSON nghiêm ngặt, YAML an toàn và CSV có trích dẫn.",
    sourceFormat: "Định dạng nguồn",
    targetFormat: "Định dạng đích",
    swap: "Hoán đổi định dạng",
    source: "Dữ liệu nguồn",
    result: "Dữ liệu đã chuyển",
    placeholder: "Dán dữ liệu có cấu trúc…",
    empty: "Dữ liệu đã chuyển sẽ hiện ở đây.",
    copy: "Sao chép kết quả",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    download: "Tải kết quả",
  },
} as const;

const formats: DataFormat[] = ["json", "yaml", "csv"];
const mimeTypes: Record<DataFormat, string> = {
  json: "application/json",
  yaml: "application/yaml",
  csv: "text/csv",
};

export default function DataConvertTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [from, setFrom] = useState<DataFormat>("json");
  const [to, setTo] = useState<DataFormat>("yaml");
  const [source, setSource] = useState("");
  const conversion = useMemo(() => {
    try {
      return { output: convertData(source, from, to), error: "" };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [from, source, to]);
  const downloadHref = conversion.output
    ? `data:${mimeTypes[to]};charset=utf-8,${encodeURIComponent(conversion.output)}`
    : "";

  const swap = () => {
    const previousFrom = from;
    setFrom(to);
    setTo(previousFrom);
    if (conversion.output) setSource(conversion.output);
  };

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        {(
          [
            [t.sourceFormat, from, setFrom],
            [t.targetFormat, to, setTo],
          ] as const
        ).map(([label, value, update]) => (
          <label
            key={label}
            className="text-xs font-semibold text-[var(--vt-text-2)]"
          >
            {label}
            <select
              aria-label={label}
              value={value}
              onChange={(event) => update(event.target.value as DataFormat)}
              className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm uppercase text-[var(--vt-text)]"
            >
              {formats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button
          type="button"
          onClick={swap}
          aria-label={t.swap}
          className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]"
        >
          ⇄ {t.swap}
        </button>
      </div>
      <ToolGrid>
        <ToolPanel title={t.source}>
          <ToolTextArea
            label={t.source}
            value={source}
            onChange={setSource}
            placeholder={t.placeholder}
          />
        </ToolPanel>
        <ToolPanel title={t.result}>
          {conversion.error ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs leading-5 text-[var(--vt-red)]"
            >
              {conversion.error}
            </p>
          ) : (
            <ToolOutput
              label={t.result}
              value={conversion.output}
              emptyLabel={t.empty}
            />
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CopyButton
              value={conversion.output}
              label={t.copy}
              copiedLabel={t.copied}
              failedLabel={t.copyFailed}
            />
            {downloadHref ? (
              <a
                href={downloadHref}
                download={`converted.${to}`}
                className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]"
              >
                {t.download}
              </a>
            ) : null}
          </div>
        </ToolPanel>
      </ToolGrid>
    </ToolWorkspace>
  );
}

