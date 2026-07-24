import { useMemo, useState } from "react";

import {
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  BARCODE_FORMATS,
  renderBarcodeSvg,
  type BarcodeFormat,
  type BarcodeOptions,
} from "./barcode";

const copy = {
  en: {
    title: "Barcode",
    description:
      "Generate validated Code 128, EAN-13, UPC-A, Code 39, and ITF-14 barcodes locally.",
    settings: "Barcode settings",
    format: "Barcode format",
    data: "Barcode data",
    width: "Bar width",
    height: "Bar height",
    margin: "Margin",
    foreground: "Foreground",
    background: "Background",
    display: "Show readable text",
    preview: "Barcode preview",
    imageAlt: "Generated barcode",
    download: "Download SVG",
    gs1: "Generation does not confirm that a GS1 number has been officially issued.",
  },
  vi: {
    title: "Mã vạch",
    description:
      "Tạo cục bộ mã vạch Code 128, EAN-13, UPC-A, Code 39 và ITF-14 đã kiểm tra.",
    settings: "Cài đặt mã vạch",
    format: "Định dạng mã vạch",
    data: "Dữ liệu mã vạch",
    width: "Độ rộng vạch",
    height: "Chiều cao vạch",
    margin: "Lề",
    foreground: "Màu vạch",
    background: "Màu nền",
    display: "Hiện văn bản dễ đọc",
    preview: "Xem trước mã vạch",
    imageAlt: "Mã vạch đã tạo",
    download: "Tải SVG",
    gs1: "Việc tạo mã không xác nhận số GS1 đã được cấp chính thức.",
  },
} as const;

export default function BarcodeTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [value, setValue] = useState("ABC-123");
  const [options, setOptions] = useState<BarcodeOptions>({
    format: "CODE128",
    width: 2,
    height: 80,
    margin: 10,
    foreground: "#111111",
    background: "#ffffff",
    displayValue: true,
  });
  const result = useMemo(() => {
    try {
      return { svg: renderBarcodeSvg(value, options), error: "" };
    } catch (error) {
      return {
        svg: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [options, value]);
  const href = result.svg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.svg)}`
    : "";

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        <ToolPanel title={t.settings}>
          <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.format}
            <select
              aria-label={t.format}
              value={options.format}
              onChange={(event) =>
                setOptions((current) => ({
                  ...current,
                  format: event.target.value as BarcodeFormat,
                }))
              }
              className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
            >
              {BARCODE_FORMATS.map((format) => (
                <option key={format.id} value={format.id}>{format[locale]}</option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.data}
            <input
              aria-label={t.data}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 font-mono text-sm text-[var(--vt-text)]"
            />
          </label>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(
              [
                [t.width, "width", options.width, 1, 4],
                [t.height, "height", options.height, 20, 300],
                [t.margin, "margin", options.margin, 0, 50],
              ] as const
            ).map(([label, key, currentValue, min, max]) => (
              <label key={key} className="text-xs font-semibold text-[var(--vt-text-2)]">
                {label}
                <input
                  type="number"
                  aria-label={label}
                  value={currentValue}
                  min={min}
                  max={max}
                  onChange={(event) =>
                    setOptions((current) => ({
                      ...current,
                      [key]: Number(event.target.value),
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-2 py-2 font-mono text-sm text-[var(--vt-text)]"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(
              [
                [t.foreground, "foreground", options.foreground],
                [t.background, "background", options.background],
              ] as const
            ).map(([label, key, currentValue]) => (
              <label key={key} className="text-xs font-semibold text-[var(--vt-text-2)]">
                {label}
                <input
                  type="color"
                  aria-label={label}
                  value={currentValue}
                  onChange={(event) =>
                    setOptions((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  className="mt-1.5 h-10 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] p-1"
                />
              </label>
            ))}
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-[var(--vt-text)]">
            <input
              type="checkbox"
              checked={options.displayValue}
              onChange={(event) =>
                setOptions((current) => ({
                  ...current,
                  displayValue: event.target.checked,
                }))
              }
            />
            {t.display}
          </label>
          <p className="mt-4 text-xs leading-5 text-[var(--vt-text-3)]">{t.gs1}</p>
        </ToolPanel>
        <ToolPanel title={t.preview}>
          {result.error ? (
            <p role="alert" className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 text-xs text-[var(--vt-red)]">
              {result.error}
            </p>
          ) : (
            <>
              <img
                src={href}
                alt={t.imageAlt}
                className="max-h-[360px] w-full rounded-lg bg-white p-4 object-contain"
              />
              <a
                href={href}
                download="barcode.svg"
                className="mt-4 inline-flex rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]"
              >
                {t.download}
              </a>
            </>
          )}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

