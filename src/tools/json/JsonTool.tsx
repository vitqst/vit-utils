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
import { transformJson, type JsonMode } from "./json";

const copy = {
  en: {
    title: "JSON formatter",
    description:
      "Validate, format, sort, or minify JSON locally with useful error locations.",
    input: "JSON input",
    output: "JSON output",
    mode: "Output mode",
    format: "Format",
    minify: "Minify",
    indent: "Indentation",
    twoSpaces: "2 spaces",
    fourSpaces: "4 spaces",
    sort: "Sort object keys",
    placeholder: 'Paste JSON, for example {"ok": true}',
    empty: "Valid JSON output appears here.",
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Copy failed",
    line: "Line",
    column: "column",
    duplicate:
      "Duplicate keys follow native JSON behavior: the last value is kept.",
  },
  vi: {
    title: "Định dạng JSON",
    description:
      "Kiểm tra, định dạng, sắp xếp hoặc thu gọn JSON cục bộ với vị trí lỗi hữu ích.",
    input: "JSON đầu vào",
    output: "JSON đầu ra",
    mode: "Kiểu đầu ra",
    format: "Định dạng",
    minify: "Thu gọn",
    indent: "Thụt lề",
    twoSpaces: "2 khoảng trắng",
    fourSpaces: "4 khoảng trắng",
    sort: "Sắp xếp khóa đối tượng",
    placeholder: 'Dán JSON, ví dụ {"ok": true}',
    empty: "JSON hợp lệ sẽ hiện ở đây.",
    copy: "Sao chép kết quả",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    line: "Dòng",
    column: "cột",
    duplicate:
      "Khóa trùng theo hành vi JSON gốc: giá trị cuối cùng được giữ lại.",
  },
} as const;

export default function JsonTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<JsonMode>("format");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const result = useMemo(
    () => transformJson(source, { mode, indent, sortKeys }),
    [indent, mode, sortKeys, source],
  );

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.mode}
          <select
            aria-label={t.mode}
            value={mode}
            onChange={(event) => setMode(event.target.value as JsonMode)}
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)]"
          >
            <option value="format">{t.format}</option>
            <option value="minify">{t.minify}</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.indent}
          <select
            aria-label={t.indent}
            value={indent}
            disabled={mode === "minify"}
            onChange={(event) =>
              setIndent(Number(event.target.value) as 2 | 4)
            }
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)] disabled:opacity-50"
          >
            <option value={2}>{t.twoSpaces}</option>
            <option value={4}>{t.fourSpaces}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--vt-text)]">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(event) => setSortKeys(event.target.checked)}
          />
          {t.sort}
        </label>
      </div>
      <ToolGrid>
        <ToolPanel title={t.input}>
          <ToolTextArea
            label={t.input}
            value={source}
            onChange={setSource}
            placeholder={t.placeholder}
          />
          <p className="mt-2 text-[11px] leading-5 text-[var(--vt-text-3)]">
            {t.duplicate}
          </p>
        </ToolPanel>
        <ToolPanel title={t.output}>
          {result.error ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs leading-5 text-[var(--vt-red)]"
            >
              {result.error.message}
              {result.error.line && result.error.column
                ? ` — ${t.line} ${result.error.line}, ${t.column} ${result.error.column}`
                : ""}
            </p>
          ) : (
            <>
              <ToolOutput
                label={t.output}
                value={result.output}
                emptyLabel={t.empty}
              />
              <div className="mt-3">
                <CopyButton
                  value={result.output}
                  label={t.copy}
                  copiedLabel={t.copied}
                  failedLabel={t.copyFailed}
                />
              </div>
            </>
          )}
        </ToolPanel>
      </ToolGrid>
    </ToolWorkspace>
  );
}

