import { useEffect, useRef, useState } from "react";

import { ToolActions, ToolPanel, ToolWorkspace } from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { type PdfMode, validatePdfFiles } from "./pdf";

const copy = {
  en: {
    title: "Merge / split PDF",
    description: "Merge PDFs or extract selected pages entirely in your browser.",
    settings: "PDF operation",
    merge: "Merge files",
    split: "Split pages",
    files: "PDF files",
    oneFile: "PDF file",
    fileHelpMerge: "Choose 2–20 PDFs; the selected order is preserved.",
    fileHelpSplit: "Choose one PDF, up to 100 MB.",
    selected: (count: number) => `${count} file${count === 1 ? "" : "s"} selected`,
    range: "Page range",
    rangeHint: "Examples: 1-3, 5, last. Empty selects every page.",
    rotation: "Clockwise rotation",
    process: "Process PDF",
    cancel: "Cancel processing",
    reset: "Reset",
    privacy: "Selected PDFs do not leave your browser.",
    processing: "Processing PDF…",
    progress: (count: number) => `${count} pages processed`,
    ready: (count: number) => `${count} pages are ready.`,
    downloadMerge: "Download merged.pdf",
    downloadSplit: "Download extracted.pdf",
    result: "Result",
    empty: "The processed PDF will appear here.",
    failed: "Could not process the PDF.",
  },
  vi: {
    title: "Gộp / tách PDF",
    description: "Gộp PDF hoặc trích xuất các trang đã chọn ngay trong trình duyệt.",
    settings: "Thao tác PDF",
    merge: "Gộp tệp",
    split: "Tách trang",
    files: "Các tệp PDF",
    oneFile: "Tệp PDF",
    fileHelpMerge: "Chọn 2–20 PDF; thứ tự đã chọn được giữ nguyên.",
    fileHelpSplit: "Chọn một PDF, tối đa 100 MB.",
    selected: (count: number) => `Đã chọn ${count} tệp`,
    range: "Phạm vi trang",
    rangeHint: "Ví dụ: 1-3, 5, last. Để trống để chọn mọi trang.",
    rotation: "Xoay theo chiều kim đồng hồ",
    process: "Xử lý PDF",
    cancel: "Hủy xử lý",
    reset: "Đặt lại",
    privacy: "PDF đã chọn không rời khỏi trình duyệt.",
    processing: "Đang xử lý PDF…",
    progress: (count: number) => `Đã xử lý ${count} trang`,
    ready: (count: number) => `${count} trang đã sẵn sàng.`,
    downloadMerge: "Tải merged.pdf",
    downloadSplit: "Tải extracted.pdf",
    result: "Kết quả",
    empty: "PDF đã xử lý sẽ hiện ở đây.",
    failed: "Không thể xử lý PDF.",
  },
} as const;

type Response =
  | { type: "progress"; id: number; completed: number }
  | { type: "result"; id: number; bytes: ArrayBuffer; pageCount: number }
  | { type: "cancelled"; id: number }
  | { type: "error"; id: number; message: string };

export default function PdfTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [mode, setMode] = useState<PdfMode>("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [range, setRange] = useState("");
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef("");
  const operationRef = useRef(0);

  const revoke = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = "";
    setDownloadUrl("");
  };
  const terminate = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
  };
  useEffect(
    () => () => {
      terminate();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const changeMode = (next: PdfMode) => {
    operationRef.current += 1;
    terminate();
    revoke();
    setMode(next);
    setFiles([]);
    setRunning(false);
    setStatus("");
    setError("");
  };

  const process = async () => {
    setError("");
    try {
      validatePdfFiles(files, mode);
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
        files.map(async (file) => ({ name: file.name, bytes: await file.arrayBuffer() })),
      );
      if (operationRef.current !== id) return;
      const worker = new Worker(new URL("./pdf.worker.ts", import.meta.url), {
        type: "module",
      });
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<Response>) => {
        const response = event.data;
        if (response.id !== id) return;
        if (response.type === "progress") {
          setStatus(t.progress(response.completed));
          return;
        }
        setRunning(false);
        if (response.type === "result") {
          const nextUrl = URL.createObjectURL(
            new Blob([response.bytes], { type: "application/pdf" }),
          );
          urlRef.current = nextUrl;
          setDownloadUrl(nextUrl);
          setStatus(t.ready(response.pageCount));
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
        {
          type: "process",
          id,
          mode,
          files: entries,
          range,
          rotation,
        },
        entries.map((entry) => entry.bytes),
      );
    } catch (cause) {
      setRunning(false);
      setStatus("");
      setError(cause instanceof Error ? cause.message : t.failed);
    }
  };

  const reset = () => {
    operationRef.current += 1;
    terminate();
    revoke();
    setMode("merge");
    setFiles([]);
    setRange("");
    setRotation(0);
    setRunning(false);
    setStatus("");
    setError("");
  };

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <ToolPanel title={t.settings}>
          <fieldset className="flex gap-4">
            <legend className="sr-only">{t.settings}</legend>
            {(["merge", "split"] as const).map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm text-[var(--vt-text)]">
                <input
                  type="radio"
                  name="pdf-mode"
                  checked={mode === value}
                  onChange={() => changeMode(value)}
                />
                {value === "merge" ? t.merge : t.split}
              </label>
            ))}
          </fieldset>
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {mode === "merge" ? t.files : t.oneFile}
            <input
              aria-label={mode === "merge" ? t.files : t.oneFile}
              type="file"
              accept=".pdf,application/pdf"
              multiple={mode === "merge"}
              onChange={(event) => {
                setFiles(Array.from(event.target.files ?? []));
                setError("");
                revoke();
              }}
              className="mt-1.5 block w-full text-sm text-[var(--vt-text-2)] file:mr-3 file:rounded-lg file:border file:border-[var(--vt-border-2)] file:bg-[var(--vt-bg-1)] file:px-3 file:py-2 file:text-xs file:font-semibold"
            />
            <span className="mt-1 block font-normal text-[var(--vt-text-3)]">
              {mode === "merge" ? t.fileHelpMerge : t.fileHelpSplit}
            </span>
          </label>
          {files.length ? (
            <p className="mt-2 text-xs text-[var(--vt-text-2)]">{t.selected(files.length)}</p>
          ) : null}
          {mode === "split" ? (
            <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
              {t.range}
              <input
                aria-label={t.range}
                value={range}
                onChange={(event) => setRange(event.target.value)}
                placeholder="1-3, 5, last"
                className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm"
              />
              <span className="mt-1 block font-normal text-[var(--vt-text-3)]">{t.rangeHint}</span>
            </label>
          ) : null}
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.rotation}
            <select
              aria-label={t.rotation}
              value={rotation}
              onChange={(event) => setRotation(Number(event.target.value) as 0 | 90 | 180 | 270)}
              className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm"
            >
              {[0, 90, 180, 270].map((value) => <option key={value} value={value}>{value}°</option>)}
            </select>
          </label>
          <p className="mt-4 text-xs text-[var(--vt-text-3)]">{t.privacy}</p>
          {error ? <p role="alert" className="mt-3 rounded-lg border border-[var(--vt-red)]/40 p-3 text-xs text-[var(--vt-red)]">{error}</p> : null}
          <ToolActions>
            <button type="button" onClick={() => void process()} disabled={running} className="rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{t.process}</button>
            <button
              type="button"
              onClick={() => workerRef.current?.postMessage({ type: "cancel", id: operationRef.current })}
              disabled={!running}
              className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold disabled:opacity-50"
            >{t.cancel}</button>
            <button type="button" onClick={reset} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold">{t.reset}</button>
          </ToolActions>
        </ToolPanel>
        <ToolPanel title={t.result}>
          {status ? <p role="status" aria-live="polite" className="text-sm text-[var(--vt-text)]">{status}</p> : <p className="text-sm text-[var(--vt-text-3)]">{t.empty}</p>}
          {downloadUrl ? (
            <a
              href={downloadUrl}
              download={mode === "merge" ? "merged.pdf" : "extracted.pdf"}
              className="mt-4 inline-flex rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white"
            >
              {mode === "merge" ? t.downloadMerge : t.downloadSplit}
            </a>
          ) : null}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

