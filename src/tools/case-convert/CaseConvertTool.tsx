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
import { convertCase, type CaseStyle } from "./case-convert";

const copy = {
  en: {
    title: "Case converter",
    description:
      "Convert prose and identifiers between common case styles. Unicode letters stay on your device.",
    source: "Source text",
    result: "Converted text",
    style: "Case style",
    placeholder: "Type or paste text…",
    empty: "Your converted text appears here.",
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Copy failed",
  },
  vi: {
    title: "Đổi kiểu chữ",
    description:
      "Đổi văn bản và tên định danh giữa các kiểu chữ phổ biến. Ký tự Unicode luôn ở trên thiết bị.",
    source: "Văn bản gốc",
    result: "Văn bản đã đổi",
    style: "Kiểu chữ",
    placeholder: "Nhập hoặc dán văn bản…",
    empty: "Văn bản đã đổi sẽ hiện ở đây.",
    copy: "Sao chép kết quả",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
  },
} as const;

const styles: CaseStyle[] = [
  "sentence",
  "title",
  "upper",
  "lower",
  "camel",
  "pascal",
  "snake",
  "kebab",
  "constant",
];

const styleLabels: Record<"en" | "vi", Record<CaseStyle, string>> = {
  en: {
    sentence: "Sentence case",
    title: "Title Case",
    upper: "UPPER CASE",
    lower: "lower case",
    camel: "camelCase",
    pascal: "PascalCase",
    snake: "snake_case",
    kebab: "kebab-case",
    constant: "CONSTANT_CASE",
  },
  vi: {
    sentence: "Kiểu câu",
    title: "Kiểu Tiêu Đề",
    upper: "CHỮ HOA",
    lower: "chữ thường",
    camel: "camelCase",
    pascal: "PascalCase",
    snake: "snake_case",
    kebab: "kebab-case",
    constant: "CONSTANT_CASE",
  },
};

export default function CaseConvertTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [source, setSource] = useState("");
  const [style, setStyle] = useState<CaseStyle>("sentence");
  const result = useMemo(
    () => convertCase(source, style, locale),
    [locale, source, style],
  );

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 max-w-xs">
        <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
          {t.style}
          <select
            aria-label={t.style}
            value={style}
            onChange={(event) => setStyle(event.target.value as CaseStyle)}
            className="mt-1.5 h-10 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-1)] px-3 text-sm text-[var(--vt-text)] outline-none focus:border-[var(--vt-accent)]"
          >
            {styles.map((value) => (
              <option key={value} value={value}>
                {styleLabels[locale][value]}
              </option>
            ))}
          </select>
        </label>
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
          <ToolOutput label={t.result} value={result} emptyLabel={t.empty} />
          <div className="mt-3">
            <CopyButton
              value={result}
              label={t.copy}
              copiedLabel={t.copied}
              failedLabel={t.copyFailed}
            />
          </div>
        </ToolPanel>
      </ToolGrid>
    </ToolWorkspace>
  );
}
