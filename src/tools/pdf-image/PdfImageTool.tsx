import { useEffect, useRef, useState } from "react";

import { ToolActions, ToolPanel, ToolWorkspace } from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  type ImagePdfLayout,
  type PdfImageMode,
  validateImageFiles,
  validatePdfImageFile,
} from "./pdf-image";

const copy = {
  en: {
    title: "PDF ↔ image",
    description: "Render PDF pages as PNG or combine images into a PDF locally.",
    settings: "Conversion",
    pdfToImage: "PDF to PNG",
    imageToPdf: "Images to PDF",
    pdfFile: "PDF file",
    images: "Images",
    range: "Page range",
    rangeHint: "Examples: 1-3, 5, last. Up to 50 pages.",
    scale: "Render scale",
    layout: "PDF page layout",
    original: "Original image size",
    a4: "A4 contain",
    convert: "Convert",
    cancel: "Cancel processing",
    reset: "Reset",
    privacy: "Selected files do not leave your browser.",
    processing: "Converting…",
    progress: (done: number, total: number) => `${done} of ${total} complete`,
    ready: "Conversion is ready.",
    download: (name: string) => `Download ${name}`,
    result: "Result",
    empty: "Converted output will appear here.",
    failed: "Could not convert the selected files.",
  },
  vi: {
    title: "PDF ↔ ảnh",
    description: "Kết xuất trang PDF thành PNG hoặc ghép ảnh thành PDF cục bộ.",
    settings: "Chuyển đổi",
    pdfToImage: "PDF sang PNG",
    imageToPdf: "Ảnh sang PDF",
    pdfFile: "Tệp PDF",
    images: "Các ảnh",
    range: "Phạm vi trang",
    rangeHint: "Ví dụ: 1-3, 5, last. Tối đa 50 trang.",
    scale: "Tỷ lệ kết xuất",
    layout: "Bố cục trang PDF",
    original: "Kích thước ảnh gốc",
    a4: "Vừa trong A4",
    convert: "Chuyển đổi",
    cancel: "Hủy xử lý",
    reset: "Đặt lại",
    privacy: "Tệp đã chọn không rời khỏi trình duyệt.",
    processing: "Đang chuyển đổi…",
    progress: (done: number, total: number) => `Đã xong ${done} trên ${total}`,
    ready: "Kết quả chuyển đổi đã sẵn sàng.",
    download: (name: string) => `Tải ${name}`,
    result: "Kết quả",
    empty: "Kết quả chuyển đổi sẽ hiện ở đây.",
    failed: "Không thể chuyển đổi các tệp đã chọn.",
  },
} as const;

type Response =
  | { type: "progress"; id: number; completed: number; total: number }
  | { type: "result"; id: number; bytes: ArrayBuffer; name: string; mimeType: string }
  | { type: "cancelled"; id: number }
  | { type: "error"; id: number; message: string };

export default function PdfImageTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [mode, setMode] = useState<PdfImageMode>("pdf-to-image");
  const [files, setFiles] = useState<File[]>([]);
  const [range, setRange] = useState("");
  const [scale, setScale] = useState(1.5);
  const [layout, setLayout] = useState<ImagePdfLayout>("a4");
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState({ url: "", name: "" });
  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef("");
  const operationRef = useRef(0);

  const revoke = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = "";
    setResult({ url: "", name: "" });
  };
  const terminate = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
  };
  useEffect(() => () => {
    terminate();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  const reset = (nextMode: PdfImageMode = "pdf-to-image") => {
    operationRef.current += 1;
    terminate();
    revoke();
    setMode(nextMode);
    setFiles([]);
    setRange("");
    setScale(1.5);
    setLayout("a4");
    setRunning(false);
    setStatus("");
    setError("");
  };

  const convert = async () => {
    setError("");
    try {
      if (mode === "pdf-to-image") validatePdfImageFile(files[0]);
      else validateImageFiles(files);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return;
    }
    revoke();
    terminate();
    const id = operationRef.current + 1;
    operationRef.current = id;
    setRunning(true);
    setStatus(t.processing);
    try {
      const entries = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          type: file.type,
          bytes: await file.arrayBuffer(),
        })),
      );
      if (operationRef.current !== id) return;
      const worker = new Worker(new URL("./pdf-image.worker.ts", import.meta.url), {
        type: "module",
      });
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<Response>) => {
        const response = event.data;
        if (response.id !== id) return;
        if (response.type === "progress") {
          setStatus(t.progress(response.completed, response.total));
          return;
        }
        setRunning(false);
        if (response.type === "result") {
          const url = URL.createObjectURL(
            new Blob([response.bytes], { type: response.mimeType }),
          );
          urlRef.current = url;
          setResult({ url, name: response.name });
          setStatus(t.ready);
        } else if (response.type === "cancelled") {
          setStatus("");
        } else {
          setStatus("");
          setError(response.message || t.failed);
        }
      };
      worker.onerror = () => {
        setRunning(false);
        setStatus("");
        setError(t.failed);
      };
      worker.postMessage(
        { type: "convert", id, mode, files: entries, range, scale, layout },
        entries.map((entry) => entry.bytes),
      );
    } catch (cause) {
      setRunning(false);
      setStatus("");
      setError(cause instanceof Error ? cause.message : t.failed);
    }
  };

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <ToolPanel title={t.settings}>
          <fieldset className="flex gap-4">
            <legend className="sr-only">{t.settings}</legend>
            {(["pdf-to-image", "image-to-pdf"] as const).map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="conversion-mode"
                  checked={mode === value}
                  onChange={() => reset(value)}
                />
                {value === "pdf-to-image" ? t.pdfToImage : t.imageToPdf}
              </label>
            ))}
          </fieldset>
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {mode === "pdf-to-image" ? t.pdfFile : t.images}
            <input
              aria-label={mode === "pdf-to-image" ? t.pdfFile : t.images}
              type="file"
              accept={mode === "pdf-to-image" ? ".pdf,application/pdf" : "image/png,image/jpeg"}
              multiple={mode === "image-to-pdf"}
              onChange={(event) => {
                setFiles(Array.from(event.target.files ?? []));
                setError("");
                revoke();
              }}
              className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--vt-border-2)] file:px-3 file:py-2 file:text-xs"
            />
          </label>
          {mode === "pdf-to-image" ? (
            <>
              <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
                {t.range}
                <input aria-label={t.range} value={range} onChange={(event) => setRange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm" />
                <span className="mt-1 block font-normal text-[var(--vt-text-3)]">{t.rangeHint}</span>
              </label>
              <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
                {t.scale}
                <select aria-label={t.scale} value={scale} onChange={(event) => setScale(Number(event.target.value))} className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm">
                  <option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option>
                </select>
              </label>
            </>
          ) : (
            <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
              {t.layout}
              <select aria-label={t.layout} value={layout} onChange={(event) => setLayout(event.target.value as ImagePdfLayout)} className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm">
                <option value="a4">{t.a4}</option><option value="original">{t.original}</option>
              </select>
            </label>
          )}
          <p className="mt-4 text-xs text-[var(--vt-text-3)]">{t.privacy}</p>
          {error ? <p role="alert" className="mt-3 rounded-lg border border-[var(--vt-red)]/40 p-3 text-xs text-[var(--vt-red)]">{error}</p> : null}
          <ToolActions>
            <button type="button" onClick={() => void convert()} disabled={running} className="rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{t.convert}</button>
            <button type="button" onClick={() => workerRef.current?.postMessage({ type: "cancel", id: operationRef.current })} disabled={!running} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold disabled:opacity-50">{t.cancel}</button>
            <button type="button" onClick={() => reset()} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold">{t.reset}</button>
          </ToolActions>
        </ToolPanel>
        <ToolPanel title={t.result}>
          {status ? <p role="status" aria-live="polite" className="text-sm">{status}</p> : <p className="text-sm text-[var(--vt-text-3)]">{t.empty}</p>}
          {result.url ? <a href={result.url} download={result.name} className="mt-4 inline-flex rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white">{t.download(result.name)}</a> : null}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

