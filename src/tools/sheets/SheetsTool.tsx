import { useEffect, useRef, useState } from "react";

import { ToolActions, ToolPanel, ToolWorkspace } from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { type SheetMode, validateSheetFile } from "./sheets";

const copy = {
  en: {
    title: "CSV ↔ XLSX",
    description: "Convert local spreadsheets and preview their first rows.",
    settings: "Conversion",
    csvToXlsx: "CSV to XLSX",
    xlsxToCsv: "XLSX to CSV",
    csvFile: "CSV file",
    xlsxFile: "XLSX file",
    convert: "Convert",
    cancel: "Cancel processing",
    reset: "Reset",
    privacy: "The selected spreadsheet does not leave your browser.",
    processing: "Converting spreadsheet…",
    ready: "Conversion is ready.",
    result: "Result",
    preview: "Preview",
    empty: "Converted output and a preview will appear here.",
    download: (name: string) => `Download ${name}`,
    failed: "Could not convert the spreadsheet.",
  },
  vi: {
    title: "CSV ↔ XLSX",
    description: "Chuyển đổi bảng tính cục bộ và xem trước các hàng đầu tiên.",
    settings: "Chuyển đổi",
    csvToXlsx: "CSV sang XLSX",
    xlsxToCsv: "XLSX sang CSV",
    csvFile: "Tệp CSV",
    xlsxFile: "Tệp XLSX",
    convert: "Chuyển đổi",
    cancel: "Hủy xử lý",
    reset: "Đặt lại",
    privacy: "Bảng tính đã chọn không rời khỏi trình duyệt.",
    processing: "Đang chuyển đổi bảng tính…",
    ready: "Kết quả chuyển đổi đã sẵn sàng.",
    result: "Kết quả",
    preview: "Xem trước",
    empty: "Kết quả và bản xem trước sẽ hiện ở đây.",
    download: (name: string) => `Tải ${name}`,
    failed: "Không thể chuyển đổi bảng tính.",
  },
} as const;

type Response =
  | { type: "result"; id: number; bytes: ArrayBuffer; name: string; mimeType: string; preview: unknown[][] }
  | { type: "cancelled"; id: number }
  | { type: "error"; id: number; message: string };

export default function SheetsTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [mode, setMode] = useState<SheetMode>("csv-to-xlsx");
  const [file, setFile] = useState<File | null>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<unknown[][]>([]);
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
  const reset = (nextMode: SheetMode = "csv-to-xlsx") => {
    operationRef.current += 1;
    terminate();
    revoke();
    setMode(nextMode);
    setFile(null);
    setRunning(false);
    setStatus("");
    setError("");
    setPreview([]);
  };

  const convert = async () => {
    setError("");
    try {
      validateSheetFile(file ?? undefined, mode);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return;
    }
    if (!file) return;
    revoke();
    terminate();
    setPreview([]);
    const id = operationRef.current + 1;
    operationRef.current = id;
    setRunning(true);
    setStatus(t.processing);
    try {
      const bytes = await file.arrayBuffer();
      if (operationRef.current !== id) return;
      const worker = new Worker(new URL("./sheets.worker.ts", import.meta.url), {
        type: "module",
      });
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<Response>) => {
        const response = event.data;
        if (response.id !== id) return;
        setRunning(false);
        if (response.type === "result") {
          const url = URL.createObjectURL(new Blob([response.bytes], { type: response.mimeType }));
          urlRef.current = url;
          setResult({ url, name: response.name });
          setPreview(response.preview);
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
      worker.postMessage({ type: "convert", id, mode, bytes }, [bytes]);
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
            {(["csv-to-xlsx", "xlsx-to-csv"] as const).map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input type="radio" name="sheet-mode" checked={mode === value} onChange={() => reset(value)} />
                {value === "csv-to-xlsx" ? t.csvToXlsx : t.xlsxToCsv}
              </label>
            ))}
          </fieldset>
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {mode === "csv-to-xlsx" ? t.csvFile : t.xlsxFile}
            <input
              aria-label={mode === "csv-to-xlsx" ? t.csvFile : t.xlsxFile}
              type="file"
              accept={mode === "csv-to-xlsx" ? ".csv,text/csv" : ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setError("");
                setPreview([]);
                revoke();
              }}
              className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--vt-border-2)] file:px-3 file:py-2 file:text-xs"
            />
          </label>
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
          {preview.length ? (
            <div className="mt-4 overflow-auto">
              <table aria-label={t.preview} className="min-w-full border-collapse text-left text-xs">
                <caption className="mb-2 text-left font-semibold">{t.preview}</caption>
                <tbody>
                  {preview.map((row, rowIndex) => (
                    <tr key={rowIndex}>{row.map((cell, columnIndex) => <td key={columnIndex} className="border border-[var(--vt-border)] px-2 py-1.5">{String(cell ?? "")}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

