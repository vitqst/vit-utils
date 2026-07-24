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
import { removeVietnameseDiacritics, slugify } from "./slugify";

type OutputMode = "slug" | "accents";

const copy = {
  en: {
    title: "Slug & Vietnamese accents",
    description:
      "Build clean URL slugs or remove Vietnamese diacritics without uploading text.",
    source: "Source text",
    result: "Result",
    slug: "URL slug",
    accents: "Remove accents",
    separator: "Separator",
    unicode: "Keep Unicode letters",
    placeholder: "Example: Đặng Thái Sơn & Café",
    empty: "Your result appears here.",
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Copy failed",
  },
  vi: {
    title: "Slug & bỏ dấu",
    description:
      "Tạo slug URL gọn hoặc bỏ dấu tiếng Việt mà không tải văn bản lên mạng.",
    source: "Văn bản gốc",
    result: "Kết quả",
    slug: "Slug URL",
    accents: "Bỏ dấu",
    separator: "Ký tự phân cách",
    unicode: "Giữ ký tự Unicode",
    placeholder: "Ví dụ: Đặng Thái Sơn & Café",
    empty: "Kết quả sẽ hiện ở đây.",
    copy: "Sao chép kết quả",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
  },
} as const;

export default function SlugifyTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<OutputMode>("slug");
  const [separator, setSeparator] = useState<"-" | "_">("-");
  const [keepUnicode, setKeepUnicode] = useState(false);
  const result = useMemo(
    () =>
      mode === "accents"
        ? removeVietnameseDiacritics(source)
        : slugify(source, { ascii: !keepUnicode, separator }),
    [keepUnicode, mode, separator, source],
  );

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        <fieldset className="flex gap-4">
          <legend className="sr-only">{t.result}</legend>
          {(
            [
              ["slug", t.slug],
              ["accents", t.accents],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 text-sm text-[var(--vt-text)]"
            >
              <input
                type="radio"
                name="slug-output-mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.separator}
          <select
            aria-label={t.separator}
            value={separator}
            disabled={mode !== "slug"}
            onChange={(event) =>
              setSeparator(event.target.value as "-" | "_")
            }
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)] disabled:opacity-50"
          >
            <option value="-">-</option>
            <option value="_">_</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--vt-text)]">
          <input
            type="checkbox"
            checked={keepUnicode}
            disabled={mode !== "slug"}
            onChange={(event) => setKeepUnicode(event.target.checked)}
          />
          {t.unicode}
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
