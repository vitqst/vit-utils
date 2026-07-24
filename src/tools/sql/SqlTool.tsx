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
import {
  formatSql,
  SQL_DIALECTS,
  type SqlDialect,
  type SqlKeywordCase,
} from "./sql";

const copy = {
  en: {
    title: "SQL formatter",
    description:
      "Format common SQL dialects locally without executing or sending your query.",
    dialect: "Dialect",
    keywordCase: "Keyword case",
    preserve: "Preserve",
    upper: "Uppercase",
    lower: "Lowercase",
    indentation: "Indentation",
    spaces2: "2 spaces",
    spaces4: "4 spaces",
    input: "SQL input",
    output: "Formatted SQL",
    placeholder: "Paste a SQL query…",
    empty: "Formatted SQL appears here.",
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Copy failed",
    download: "Download SQL",
  },
  vi: {
    title: "Định dạng SQL",
    description:
      "Định dạng các phương ngữ SQL phổ biến cục bộ mà không chạy hoặc gửi truy vấn.",
    dialect: "Phương ngữ",
    keywordCase: "Kiểu chữ từ khóa",
    preserve: "Giữ nguyên",
    upper: "Chữ hoa",
    lower: "Chữ thường",
    indentation: "Thụt lề",
    spaces2: "2 khoảng trắng",
    spaces4: "4 khoảng trắng",
    input: "SQL đầu vào",
    output: "SQL đã định dạng",
    placeholder: "Dán truy vấn SQL…",
    empty: "SQL đã định dạng sẽ hiện ở đây.",
    copy: "Sao chép kết quả",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    download: "Tải SQL",
  },
} as const;

export default function SqlTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [source, setSource] = useState("");
  const [dialect, setDialect] = useState<SqlDialect>("sql");
  const [keywordCase, setKeywordCase] =
    useState<SqlKeywordCase>("preserve");
  const [indent, setIndent] = useState<2 | 4>(2);
  const result = useMemo(
    () => formatSql(source, { dialect, indent, keywordCase }),
    [dialect, indent, keywordCase, source],
  );
  const output = result.ok ? result.value : "";
  const downloadHref = output
    ? `data:text/sql;charset=utf-8,${encodeURIComponent(output)}`
    : "";

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.dialect}
          <select
            aria-label={t.dialect}
            value={dialect}
            onChange={(event) => setDialect(event.target.value as SqlDialect)}
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)]"
          >
            {SQL_DIALECTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item[locale]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.keywordCase}
          <select
            aria-label={t.keywordCase}
            value={keywordCase}
            onChange={(event) =>
              setKeywordCase(event.target.value as SqlKeywordCase)
            }
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)]"
          >
            <option value="preserve">{t.preserve}</option>
            <option value="upper">{t.upper}</option>
            <option value="lower">{t.lower}</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.indentation}
          <select
            aria-label={t.indentation}
            value={indent}
            onChange={(event) =>
              setIndent(Number(event.target.value) as 2 | 4)
            }
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)]"
          >
            <option value={2}>{t.spaces2}</option>
            <option value={4}>{t.spaces4}</option>
          </select>
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
        </ToolPanel>
        <ToolPanel title={t.output}>
          {!result.ok ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs leading-5 text-[var(--vt-red)]"
            >
              {result.error}
            </p>
          ) : (
            <ToolOutput
              label={t.output}
              value={output}
              emptyLabel={t.empty}
            />
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CopyButton
              value={output}
              label={t.copy}
              copiedLabel={t.copied}
              failedLabel={t.copyFailed}
            />
            {downloadHref ? (
              <a
                href={downloadHref}
                download="formatted.sql"
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

