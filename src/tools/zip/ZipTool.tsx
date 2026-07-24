import { useEffect, useRef, useState } from "react";

import { ToolActions, ToolPanel, ToolWorkspace } from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { type ZipMode, validateZipSelection } from "./zip";

const copy = {
  en: {
    title: "Zip / unzip",
    description: "Create archives or safely inspect and repackage a ZIP locally.",
    settings: "Archive operation",
    create: "Create ZIP",
    extract: "Safe extraction",
    files: "Files",
    zipFile: "ZIP file",
    createAction: "Create ZIP",
    extractAction: "Inspect and extract",
    cancel: "Cancel processing",
    reset: "Reset",
    privacy: "Selected files do not leave your browser.",
    processing: "Processing archive…",
    ready: "Archive is ready.",
    result: "Result",
    empty: "The archive result and entry list will appear here.",
    entries: "Archive entries",
    download: (name: string) => `Download ${name}`,
    failed: "Could not process the archive.",
  },
  vi: {
    title: "Nén / giải nén ZIP",
    description: "Tạo tệp nén hoặc kiểm tra và đóng gói lại ZIP an toàn cục bộ.",
    settings: "Thao tác tệp nén",
    create: "Tạo ZIP",
    extract: "Giải nén an toàn",
    files: "Các tệp",
    zipFile: "Tệp ZIP",
    createAction: "Tạo ZIP",
    extractAction: "Kiểm tra và giải nén",
    cancel: "Hủy xử lý",
    reset: "Đặt lại",
    privacy: "Tệp đã chọn không rời khỏi trình duyệt.",
    processing: "Đang xử lý tệp nén…",
    ready: "Tệp nén đã sẵn sàng.",
    result: "Kết quả",
    empty: "Kết quả và danh sách tệp sẽ hiện ở đây.",
    entries: "Các mục trong tệp nén",
    download: (name: string) => `Tải ${name}`,
    failed: "Không thể xử lý tệp nén.",
  },
} as const;

type Response =
  | { type: "progress"; id: number; completed: number; total: number }
  | { type: "result"; id: number; bytes: ArrayBuffer; name: string; entries: string[] }
  | { type: "cancelled"; id: number }
  | { type: "error"; id: number; message: string };

export default function ZipTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [mode, setMode] = useState<ZipMode>("create");
  const [files, setFiles] = useState<File[]>([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<string[]>([]);
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
  const reset = (nextMode: ZipMode = "create") => {
    operationRef.current += 1;
    terminate();
    revoke();
    setMode(nextMode);
    setFiles([]);
    setRunning(false);
    setStatus("");
    setError("");
    setEntries([]);
  };
  const process = async () => {
    setError("");
    try {
      validateZipSelection(files, mode);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return;
    }
    revoke();
    terminate();
    setEntries([]);
    const id = operationRef.current + 1;
    operationRef.current = id;
    setRunning(true);
    setStatus(t.processing);
    try {
      const payload = await Promise.all(
        files.map(async (file) => ({ name: file.name, bytes: await file.arrayBuffer() })),
      );
      if (operationRef.current !== id) return;
      const worker = new Worker(new URL("./zip.worker.ts", import.meta.url), { type: "module" });
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<Response>) => {
        const response = event.data;
        if (response.id !== id) return;
        if (response.type === "progress") {
          setStatus(t.processing);
          return;
        }
        setRunning(false);
        if (response.type === "result") {
          const url = URL.createObjectURL(new Blob([response.bytes], { type: "application/zip" }));
          urlRef.current = url;
          setResult({ url, name: response.name });
          setEntries(response.entries);
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
        { type: "process", id, mode, files: payload },
        payload.map((item) => item.bytes),
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
            {(["create", "extract"] as const).map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input type="radio" name="zip-mode" checked={mode === value} onChange={() => reset(value)} />
                {value === "create" ? t.create : t.extract}
              </label>
            ))}
          </fieldset>
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {mode === "create" ? t.files : t.zipFile}
            <input
              aria-label={mode === "create" ? t.files : t.zipFile}
              type="file"
              accept={mode === "extract" ? ".zip,application/zip" : undefined}
              multiple={mode === "create"}
              onChange={(event) => {
                setFiles(Array.from(event.target.files ?? []));
                setError("");
                setEntries([]);
                revoke();
              }}
              className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--vt-border-2)] file:px-3 file:py-2 file:text-xs"
            />
          </label>
          <p className="mt-4 text-xs text-[var(--vt-text-3)]">{t.privacy}</p>
          {error ? <p role="alert" className="mt-3 rounded-lg border border-[var(--vt-red)]/40 p-3 text-xs text-[var(--vt-red)]">{error}</p> : null}
          <ToolActions>
            <button type="button" onClick={() => void process()} disabled={running} className="rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{mode === "create" ? t.createAction : t.extractAction}</button>
            <button type="button" onClick={() => workerRef.current?.postMessage({ type: "cancel", id: operationRef.current })} disabled={!running} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold disabled:opacity-50">{t.cancel}</button>
            <button type="button" onClick={() => reset()} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold">{t.reset}</button>
          </ToolActions>
        </ToolPanel>
        <ToolPanel title={t.result}>
          {status ? <p role="status" aria-live="polite" className="text-sm">{status}</p> : <p className="text-sm text-[var(--vt-text-3)]">{t.empty}</p>}
          {result.url ? <a href={result.url} download={result.name} className="mt-4 inline-flex rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white">{t.download(result.name)}</a> : null}
          {entries.length ? <ul aria-label={t.entries} className="mt-4 max-h-64 list-inside list-disc overflow-auto text-xs text-[var(--vt-text-2)]">{entries.map((entry) => <li key={entry}>{entry}</li>)}</ul> : null}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

