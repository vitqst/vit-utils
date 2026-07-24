import { useMemo, useState } from "react";

import {
  ToolPanel,
  ToolTextArea,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  inspectUnicode,
  type UnicodeCategory,
} from "./unicode";

const copy = {
  en: {
    title: "Unicode inspector",
    description:
      "Inspect graphemes, code points, UTF-16 units, invisible characters, and broad Unicode categories.",
    input: "Text to inspect",
    placeholder: "Type or paste Unicode text…",
    graphemes: "Graphemes",
    codePoints: "Code points",
    utf16Units: "UTF-16 units",
    details: "Code point details",
    character: "Character",
    codePoint: "Code point",
    decimal: "Decimal",
    utf16: "UTF-16",
    index: "Index",
    category: "Category",
    name: "Name",
    unavailable: "Name unavailable in browser",
    empty: "Enter text to inspect its details.",
  },
  vi: {
    title: "Soi Unicode",
    description:
      "Soi cụm ký tự, mã Unicode, đơn vị UTF-16, ký tự vô hình và nhóm Unicode.",
    input: "Văn bản cần soi",
    placeholder: "Nhập hoặc dán văn bản Unicode…",
    graphemes: "Cụm ký tự",
    codePoints: "Mã Unicode",
    utf16Units: "Đơn vị UTF-16",
    details: "Chi tiết mã Unicode",
    character: "Ký tự",
    codePoint: "Mã",
    decimal: "Thập phân",
    utf16: "UTF-16",
    index: "Vị trí",
    category: "Nhóm",
    name: "Tên",
    unavailable: "Trình duyệt không cung cấp tên",
    empty: "Nhập văn bản để xem chi tiết.",
  },
} as const;

const categoryCopy: Record<
  "en" | "vi",
  Record<UnicodeCategory, string>
> = {
  en: {
    letter: "Letter",
    mark: "Mark",
    number: "Number",
    punctuation: "Punctuation",
    symbol: "Symbol",
    separator: "Separator",
    control: "Control",
    format: "Format",
    other: "Other",
  },
  vi: {
    letter: "Chữ cái",
    mark: "Dấu kết hợp",
    number: "Số",
    punctuation: "Dấu câu",
    symbol: "Ký hiệu",
    separator: "Phân cách",
    control: "Điều khiển",
    format: "Định dạng",
    other: "Khác",
  },
};

export default function UnicodeTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [value, setValue] = useState("");
  const inspection = useMemo(
    () => inspectUnicode(value, locale),
    [locale, value],
  );
  const metrics = [
    [t.graphemes, inspection.graphemes],
    [t.codePoints, inspection.codePoints],
    [t.utf16Units, inspection.utf16Units],
  ] as const;

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <ToolPanel title={t.input}>
        <ToolTextArea
          label={t.input}
          value={value}
          onChange={setValue}
          placeholder={t.placeholder}
          rows={5}
        />
      </ToolPanel>
      <dl
        aria-live="polite"
        className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {metrics.map(([label, count]) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-3"
          >
            <dt className="text-xs text-[var(--vt-text-3)]">{label}</dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-[var(--vt-accent)]">
              {count}
            </dd>
          </div>
        ))}
      </dl>
      {inspection.rows.length ? (
        <div className="overflow-x-auto rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)]">
          <table
            aria-label={t.details}
            className="w-full min-w-[860px] border-collapse text-left text-xs"
          >
            <thead className="bg-[var(--vt-bg-2)] text-[var(--vt-text-2)]">
              <tr>
                {[
                  t.character,
                  t.codePoint,
                  t.decimal,
                  t.utf16,
                  t.index,
                  t.category,
                  t.name,
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="border-b border-[var(--vt-border)] px-3 py-2 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inspection.rows.map((row, index) => (
                <tr
                  key={`${row.utf16Index}-${index}`}
                  className="border-b border-[var(--vt-border)] last:border-b-0"
                >
                  <td className="px-3 py-2 text-lg text-[var(--vt-text)]">
                    {row.display}
                  </td>
                  <td className="px-3 py-2 font-mono text-[var(--vt-accent)]">
                    {row.codePoint}
                  </td>
                  <td className="px-3 py-2 font-mono text-[var(--vt-text-2)]">
                    {row.decimal}
                  </td>
                  <td className="px-3 py-2 font-mono text-[var(--vt-text-2)]">
                    {row.utf16.join(" ")}
                  </td>
                  <td className="px-3 py-2 font-mono text-[var(--vt-text-2)]">
                    {row.utf16Index}
                  </td>
                  <td className="px-3 py-2 text-[var(--vt-text-2)]">
                    {categoryCopy[locale][row.category]}
                  </td>
                  <td className="px-3 py-2 font-mono text-[var(--vt-text-2)]">
                    {row.name ?? t.unavailable}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-6 text-sm text-[var(--vt-text-3)]">
          {t.empty}
        </p>
      )}
    </ToolWorkspace>
  );
}

