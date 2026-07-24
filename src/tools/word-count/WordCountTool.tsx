import { useMemo, useState } from "react";

import {
  ToolPanel,
  ToolTextArea,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { countText } from "./word-count";

const copy = {
  en: {
    title: "Word & character count",
    description:
      "Count Unicode-aware words, characters, sentences, and lines as you type.",
    input: "Text to count",
    placeholder: "Type or paste text…",
    words: "Words",
    characters: "Characters",
    noWhitespace: "Without whitespace",
    sentences: "Sentences",
    lines: "Lines",
    reading: "Reading time",
    minute: "min",
  },
  vi: {
    title: "Đếm từ & ký tự",
    description:
      "Đếm từ, ký tự Unicode, câu và dòng ngay khi bạn nhập.",
    input: "Văn bản cần đếm",
    placeholder: "Nhập hoặc dán văn bản…",
    words: "Từ",
    characters: "Ký tự",
    noWhitespace: "Không tính khoảng trắng",
    sentences: "Câu",
    lines: "Dòng",
    reading: "Thời gian đọc",
    minute: "phút",
  },
} as const;

export default function WordCountTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [value, setValue] = useState("");
  const counts = useMemo(() => countText(value, locale), [locale, value]);
  const metrics = [
    [t.words, counts.words],
    [t.characters, counts.characters],
    [t.noWhitespace, counts.charactersNoWhitespace],
    [t.sentences, counts.sentences],
    [t.lines, counts.lines],
    [t.reading, `${counts.readingMinutes} ${t.minute}`],
  ] as const;

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <dl
        aria-live="polite"
        className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        {metrics.map(([label, count]) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-3"
          >
            <dt className="text-xs leading-5 text-[var(--vt-text-3)]">
              {label}
            </dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-[var(--vt-accent)]">
              {count}
            </dd>
          </div>
        ))}
      </dl>
      <ToolPanel title={t.input}>
        <ToolTextArea
          label={t.input}
          value={value}
          onChange={setValue}
          placeholder={t.placeholder}
          rows={14}
        />
      </ToolPanel>
    </ToolWorkspace>
  );
}

