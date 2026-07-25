import { useState } from "react";

import {
  CopyButton,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  generateIdentifiers,
  type IdentifierType,
} from "./ids";

const copy = {
  en: {
    title: "UUID / ULID / NanoID",
    description:
      "Generate cryptographically random identifiers locally in configurable batches.",
    settings: "Generator settings",
    type: "Identifier type",
    count: "Count",
    length: "NanoID length",
    generate: "Generate identifiers",
    results: "Generated identifiers",
    empty: "Generate identifiers to see them here.",
    copyOne: "Copy identifier",
    copyAll: "Copy all",
    copied: "Copied",
    copyFailed: "Copy failed",
    download: "Download text",
    disclosure:
      "UUID v7 values and ULIDs include their millisecond creation time. All random bytes come from Web Crypto.",
  },
  vi: {
    title: "UUID / ULID / NanoID",
    description:
      "Tạo định danh ngẫu nhiên mật mã cục bộ theo số lượng tùy chỉnh.",
    settings: "Cài đặt trình tạo",
    type: "Loại định danh",
    count: "Số lượng",
    length: "Độ dài NanoID",
    generate: "Tạo định danh",
    results: "Định danh đã tạo",
    empty: "Tạo định danh để xem tại đây.",
    copyOne: "Sao chép định danh",
    copyAll: "Sao chép tất cả",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    download: "Tải tệp văn bản",
    disclosure:
      "UUID v7 và ULID chứa thời gian tạo theo mili giây. Mọi byte ngẫu nhiên đều lấy từ Web Crypto.",
  },
} as const;

export default function IdsTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [type, setType] = useState<IdentifierType>("uuid");
  const [count, setCount] = useState("6");
  const [length, setLength] = useState("21");
  const [values, setValues] = useState<string[]>([]);
  const [error, setError] = useState("");
  const joined = values.join("\n");

  const generate = () => {
    try {
      setValues(
        generateIdentifiers(type, Number(count), Number(length)),
      );
      setError("");
    } catch (generationError) {
      setValues([]);
      setError(
        generationError instanceof Error
          ? generationError.message
          : String(generationError),
      );
    }
  };

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <ToolPanel title={t.settings}>
          <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.type}
            <select
              aria-label={t.type}
              value={type}
              onChange={(event) =>
                setType(event.target.value as IdentifierType)
              }
              className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
            >
              <option value="uuid">UUID v4</option>
              <option value="uuid-v7">UUID v7</option>
              <option value="ulid">ULID</option>
              <option value="nanoid">NanoID</option>
            </select>
          </label>
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.count}
            <input
              type="number"
              aria-label={t.count}
              min={1}
              max={1000}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 font-mono text-sm text-[var(--vt-text)]"
            />
          </label>
          {type === "nanoid" ? (
            <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
              {t.length}
              <input
                type="number"
                aria-label={t.length}
                min={1}
                max={256}
                value={length}
                onChange={(event) => setLength(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 font-mono text-sm text-[var(--vt-text)]"
              />
            </label>
          ) : null}
          <button
            type="button"
            aria-label={t.generate}
            onClick={generate}
            className="mt-4 w-full rounded-lg bg-[var(--vt-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--vt-accent-ink)]"
          >
            {t.generate}
          </button>
          <p className="mt-4 text-xs leading-5 text-[var(--vt-text-3)]">
            {t.disclosure}
          </p>
        </ToolPanel>
        <ToolPanel title={t.results}>
          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs text-[var(--vt-red)]"
            >
              {error}
            </p>
          ) : values.length ? (
            <ol
              aria-label={t.results}
              className="space-y-2"
            >
              {values.map((value, index) => (
                <li
                  key={`${value}-${index}`}
                  className="flex min-w-0 items-center gap-2 rounded-lg bg-[var(--vt-bg-0)] px-3 py-2"
                >
                  <code className="min-w-0 flex-1 overflow-x-auto text-xs text-[var(--vt-text)]">
                    {value}
                  </code>
                  <button
                    type="button"
                    aria-label={t.copyOne}
                    onClick={() => void navigator.clipboard.writeText(value)}
                    className="shrink-0 rounded-md border border-[var(--vt-border-2)] px-2 py-1 text-xs text-[var(--vt-accent)]"
                  >
                    {t.copyOne}
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-[var(--vt-text-3)]">{t.empty}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CopyButton
              value={joined}
              label={t.copyAll}
              copiedLabel={t.copied}
              failedLabel={t.copyFailed}
            />
            {joined ? (
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(joined)}`}
                download="identifiers.txt"
                className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]"
              >
                {t.download}
              </a>
            ) : null}
          </div>
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}
