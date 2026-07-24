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
  jsonToTypeScript,
  type TypeDeclarationMode,
} from "./json-types";

const copy = {
  en: {
    title: "JSON → TypeScript",
    description:
      "Infer deterministic TypeScript declarations from a local JSON sample.",
    rootName: "Root type name",
    style: "Declaration style",
    interfaces: "Interfaces",
    aliases: "Type aliases",
    input: "JSON sample",
    output: "TypeScript output",
    placeholder: 'Paste JSON, for example {"id": 1}',
    empty: "Inferred TypeScript appears here.",
    copy: "Copy TypeScript",
    copied: "Copied",
    copyFailed: "Copy failed",
    download: "Download TypeScript",
  },
  vi: {
    title: "JSON → TypeScript",
    description:
      "Suy luận khai báo TypeScript ổn định từ mẫu JSON cục bộ.",
    rootName: "Tên kiểu gốc",
    style: "Kiểu khai báo",
    interfaces: "Interface",
    aliases: "Bí danh type",
    input: "Mẫu JSON",
    output: "TypeScript đầu ra",
    placeholder: 'Dán JSON, ví dụ {"id": 1}',
    empty: "TypeScript suy luận sẽ hiện ở đây.",
    copy: "Sao chép TypeScript",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    download: "Tải TypeScript",
  },
} as const;

export default function JsonTypesTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [source, setSource] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [mode, setMode] = useState<TypeDeclarationMode>("interface");
  const result = useMemo(() => {
    if (!source.trim()) return { output: "", error: "" };
    try {
      return {
        output: jsonToTypeScript(source, rootName, mode),
        error: "",
      };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [mode, rootName, source]);
  const downloadHref = result.output
    ? `data:text/typescript;charset=utf-8,${encodeURIComponent(result.output)}`
    : "";

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.rootName}
          <input
            aria-label={t.rootName}
            value={rootName}
            onChange={(event) => setRootName(event.target.value)}
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 font-mono text-sm text-[var(--vt-text)]"
          />
        </label>
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.style}
          <select
            aria-label={t.style}
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as TypeDeclarationMode)
            }
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)]"
          >
            <option value="interface">{t.interfaces}</option>
            <option value="type">{t.aliases}</option>
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
          {result.error ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs leading-5 text-[var(--vt-red)]"
            >
              {result.error}
            </p>
          ) : (
            <ToolOutput
              label={t.output}
              value={result.output}
              emptyLabel={t.empty}
            />
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CopyButton
              value={result.output}
              label={t.copy}
              copiedLabel={t.copied}
              failedLabel={t.copyFailed}
            />
            {downloadHref ? (
              <a
                href={downloadHref}
                download="types.ts"
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

