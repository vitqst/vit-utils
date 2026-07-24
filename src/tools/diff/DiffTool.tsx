import { useMemo, useState } from "react";

import {
  ToolGrid,
  ToolPanel,
  ToolTextArea,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { diffLines, type DiffLineType } from "./diff";

const copy = {
  en: {
    title: "Text diff",
    description:
      "Compare two texts line by line. Additions and removals are computed entirely in your browser.",
    before: "Original text",
    after: "Changed text",
    result: "Diff result",
    beforePlaceholder: "Paste the original text…",
    afterPlaceholder: "Paste the changed text…",
    empty: "Enter text on either side to compare it.",
  },
  vi: {
    title: "So sánh văn bản",
    description:
      "So sánh hai văn bản theo từng dòng. Phần thêm và xóa được tính hoàn toàn trong trình duyệt.",
    before: "Văn bản gốc",
    after: "Văn bản đã sửa",
    result: "Kết quả so sánh",
    beforePlaceholder: "Dán văn bản gốc…",
    afterPlaceholder: "Dán văn bản đã sửa…",
    empty: "Nhập văn bản ở cả hai bên để so sánh.",
  },
} as const;

const rowStyles: Record<DiffLineType, string> = {
  equal: "text-[var(--vt-text-2)]",
  delete: "bg-[color-mix(in_srgb,var(--vt-red)_12%,transparent)] text-[var(--vt-red)]",
  insert:
    "bg-[color-mix(in_srgb,var(--vt-green)_12%,transparent)] text-[var(--vt-green)]",
};

const symbols: Record<DiffLineType, string> = {
  equal: " ",
  delete: "−",
  insert: "+",
};

export default function DiffTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const result = useMemo(() => diffLines(before, after), [after, before]);

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <ToolGrid>
        <ToolPanel title={t.before}>
          <ToolTextArea
            label={t.before}
            value={before}
            onChange={setBefore}
            placeholder={t.beforePlaceholder}
            rows={9}
          />
        </ToolPanel>
        <ToolPanel title={t.after}>
          <ToolTextArea
            label={t.after}
            value={after}
            onChange={setAfter}
            placeholder={t.afterPlaceholder}
            rows={9}
          />
        </ToolPanel>
      </ToolGrid>
      <section
        aria-label={t.result}
        className="mt-4 min-h-52 overflow-x-auto rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4"
      >
        <h2 className="mb-3 text-sm font-semibold text-[var(--vt-text)]">
          {t.result}
        </h2>
        {result.length ? (
          <ol className="overflow-hidden rounded-lg border border-[var(--vt-border)] font-mono text-xs">
            {result.map((line, index) => (
              <li
                key={`${index}-${line.type}`}
                className={`grid min-h-7 grid-cols-[3rem_3rem_1.5rem_minmax(0,1fr)] items-start border-b border-[var(--vt-border)]/60 last:border-b-0 ${rowStyles[line.type]}`}
              >
                <span className="px-2 py-1 text-right text-[var(--vt-text-3)]">
                  {line.oldLine ?? ""}
                </span>
                <span className="border-l border-[var(--vt-border)]/60 px-2 py-1 text-right text-[var(--vt-text-3)]">
                  {line.newLine ?? ""}
                </span>
                <span
                  aria-hidden="true"
                  className="border-l border-[var(--vt-border)]/60 py-1 text-center font-bold"
                >
                  {symbols[line.type]}
                </span>
                <code className="whitespace-pre-wrap break-words py-1 pr-2">
                  {line.value}
                </code>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-[var(--vt-text-3)]">{t.empty}</p>
        )}
      </section>
    </ToolWorkspace>
  );
}
