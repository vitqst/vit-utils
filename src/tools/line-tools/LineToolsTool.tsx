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
import { transformLines, type LineOrder } from "./line-tools";

const copy = {
  en: {
    title: "Sort & dedupe lines",
    description:
      "Clean, sort, reverse, and remove duplicate lines while keeping the original text intact.",
    source: "Source lines",
    result: "Processed lines",
    order: "Line order",
    original: "Original order",
    asc: "Ascending",
    desc: "Descending",
    reverse: "Reverse",
    trim: "Trim each line",
    blanks: "Remove blank lines",
    dedupe: "Remove duplicates",
    caseSensitive: "Case-sensitive duplicates",
    placeholder: "Paste one item per line…",
    empty: "Processed lines appear here.",
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Copy failed",
  },
  vi: {
    title: "Sắp xếp & lọc dòng",
    description:
      "Làm sạch, sắp xếp, đảo và loại dòng trùng mà vẫn giữ nguyên văn bản gốc.",
    source: "Các dòng gốc",
    result: "Các dòng đã xử lý",
    order: "Thứ tự dòng",
    original: "Thứ tự ban đầu",
    asc: "Tăng dần",
    desc: "Giảm dần",
    reverse: "Đảo ngược",
    trim: "Cắt khoảng trắng mỗi dòng",
    blanks: "Loại dòng trống",
    dedupe: "Loại dòng trùng",
    caseSensitive: "Phân biệt hoa thường khi lọc trùng",
    placeholder: "Dán mỗi mục trên một dòng…",
    empty: "Các dòng đã xử lý sẽ hiện ở đây.",
    copy: "Sao chép kết quả",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
  },
} as const;

export default function LineToolsTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [source, setSource] = useState("");
  const [order, setOrder] = useState<LineOrder>("original");
  const [trim, setTrim] = useState(false);
  const [removeBlank, setRemoveBlank] = useState(false);
  const [dedupe, setDedupe] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const result = useMemo(
    () =>
      transformLines(source, {
        order,
        trim,
        removeBlank,
        dedupe,
        caseSensitive,
        locale,
      }),
    [caseSensitive, dedupe, locale, order, removeBlank, source, trim],
  );

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.order}
          <select
            aria-label={t.order}
            value={order}
            onChange={(event) => setOrder(event.target.value as LineOrder)}
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)]"
          >
            <option value="original">{t.original}</option>
            <option value="asc">{t.asc}</option>
            <option value="desc">{t.desc}</option>
            <option value="reverse">{t.reverse}</option>
          </select>
        </label>
        {(
          [
            [t.trim, trim, setTrim, false],
            [t.blanks, removeBlank, setRemoveBlank, false],
            [t.dedupe, dedupe, setDedupe, false],
            [t.caseSensitive, caseSensitive, setCaseSensitive, !dedupe],
          ] as const
        ).map(([label, checked, update, disabled]) => (
          <label
            key={label}
            className="flex items-center gap-2 text-sm text-[var(--vt-text)]"
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={(event) => update(event.target.checked)}
            />
            {label}
          </label>
        ))}
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

