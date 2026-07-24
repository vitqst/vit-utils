import { useMemo, useState } from "react";

import {
  CopyButton,
  ToolOutput,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { generateLorem, type LoremUnit } from "./lorem";

const copy = {
  en: {
    title: "Lorem Ipsum",
    description:
      "Generate deterministic placeholder words, sentences, or paragraphs without an external service.",
    unit: "Unit",
    amount: "Amount",
    words: "Words",
    sentences: "Sentences",
    paragraphs: "Paragraphs",
    start: "Start with Lorem ipsum",
    result: "Generated text",
    empty: "Generated text appears here.",
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Copy failed",
  },
  vi: {
    title: "Tạo Lorem Ipsum",
    description:
      "Tạo từ, câu hoặc đoạn văn mẫu cố định mà không cần dịch vụ bên ngoài.",
    unit: "Đơn vị",
    amount: "Số lượng",
    words: "Từ",
    sentences: "Câu",
    paragraphs: "Đoạn văn",
    start: "Bắt đầu bằng Lorem ipsum",
    result: "Văn bản đã tạo",
    empty: "Văn bản đã tạo sẽ hiện ở đây.",
    copy: "Sao chép kết quả",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
  },
} as const;

const maximums: Record<LoremUnit, number> = {
  words: 1000,
  sentences: 100,
  paragraphs: 20,
};

export default function LoremTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const result = useMemo(
    () => generateLorem({ unit, count, startWithLorem }),
    [count, startWithLorem, unit],
  );

  const changeUnit = (nextUnit: LoremUnit) => {
    setUnit(nextUnit);
    setCount((current) => Math.min(current, maximums[nextUnit]));
  };

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.unit}
          <select
            aria-label={t.unit}
            value={unit}
            onChange={(event) => changeUnit(event.target.value as LoremUnit)}
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)]"
          >
            <option value="words">{t.words}</option>
            <option value="sentences">{t.sentences}</option>
            <option value="paragraphs">{t.paragraphs}</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.amount}
          <input
            type="number"
            aria-label={t.amount}
            min={1}
            max={maximums[unit]}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            className="ml-2 h-9 w-24 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 font-mono text-sm text-[var(--vt-text)]"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--vt-text)]">
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={(event) => setStartWithLorem(event.target.checked)}
          />
          {t.start}
        </label>
      </div>
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
    </ToolWorkspace>
  );
}

