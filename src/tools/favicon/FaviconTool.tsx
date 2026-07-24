import { useEffect, useRef, useState } from "react";

import {
  ToolActions,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  FAVICON_MIME_TYPES,
  FAVICON_OUTPUTS,
  MAX_FAVICON_SOURCE_BYTES,
  validateFaviconOptions,
} from "./favicon";

const copy = {
  en: {
    title: "Favicon set",
    description:
      "Turn one local image into a complete, downloadable favicon package.",
    settings: "Source and settings",
    source: "Source image",
    accepted: "PNG, JPEG, or WebP up to 20 MB.",
    appName: "Application name",
    theme: "Theme color",
    generate: "Generate favicon set",
    cancel: "Cancel processing",
    reset: "Reset",
    privacy: "The selected image does not leave your browser.",
    invalidType: "Choose a PNG, JPEG, or WebP image.",
    tooLarge: "The source image must be 20 MB or smaller.",
    required: "Choose a source image first.",
    processing: "Generating",
    progress: (done: number, total: number) => `${done} of ${total} icons complete`,
    cancelled: "Generation cancelled.",
    ready: "Your favicon package is ready.",
    download: "Download favicon-set.zip",
    output: "Package",
    contents: "Includes six PNG icons, a web manifest, browser config, and HTML links.",
    failed: "Could not generate the favicon set.",
  },
  vi: {
    title: "Bộ favicon",
    description:
      "Biến một ảnh cục bộ thành bộ favicon hoàn chỉnh có thể tải xuống.",
    settings: "Ảnh nguồn và cài đặt",
    source: "Ảnh nguồn",
    accepted: "PNG, JPEG hoặc WebP, tối đa 20 MB.",
    appName: "Tên ứng dụng",
    theme: "Màu chủ đề",
    generate: "Tạo bộ favicon",
    cancel: "Hủy xử lý",
    reset: "Đặt lại",
    privacy: "Ảnh đã chọn không rời khỏi trình duyệt.",
    invalidType: "Hãy chọn ảnh PNG, JPEG hoặc WebP.",
    tooLarge: "Ảnh nguồn phải có dung lượng từ 20 MB trở xuống.",
    required: "Hãy chọn ảnh nguồn trước.",
    processing: "Đang tạo",
    progress: (done: number, total: number) => `Đã xong ${done} trên ${total} biểu tượng`,
    cancelled: "Đã hủy tạo.",
    ready: "Bộ favicon đã sẵn sàng.",
    download: "Tải favicon-set.zip",
    output: "Gói tệp",
    contents: "Gồm sáu biểu tượng PNG, web manifest, cấu hình trình duyệt và liên kết HTML.",
    failed: "Không thể tạo bộ favicon.",
  },
} as const;

type WorkerResponse =
  | { type: "progress"; id: number; completed: number; total: number }
  | { type: "result"; id: number; bytes: ArrayBuffer }
  | { type: "cancelled"; id: number }
  | { type: "error"; id: number; message: string };

export default function FaviconTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [file, setFile] = useState<File | null>(null);
  const [appName, setAppName] = useState("Vịt Tools");
  const [themeColor, setThemeColor] = useState("#6d5dfc");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef("");
  const operationRef = useRef(0);

  const revokeDownload = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = "";
    setDownloadUrl("");
  };

  const stopWorker = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
  };

  useEffect(
    () => () => {
      stopWorker();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const selectFile = (next: File | null) => {
    setError("");
    revokeDownload();
    if (!next) {
      setFile(null);
      return;
    }
    if (!(FAVICON_MIME_TYPES as readonly string[]).includes(next.type)) {
      setFile(null);
      setError(t.invalidType);
      return;
    }
    if (next.size > MAX_FAVICON_SOURCE_BYTES) {
      setFile(null);
      setError(t.tooLarge);
      return;
    }
    setFile(next);
  };

  const generate = async () => {
    setError("");
    if (!file) {
      setError(t.required);
      return;
    }
    let options: ReturnType<typeof validateFaviconOptions>;
    try {
      options = validateFaviconOptions(appName, themeColor);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return;
    }

    revokeDownload();
    stopWorker();
    const id = operationRef.current + 1;
    operationRef.current = id;
    setRunning(true);
    setStatus(`${t.processing}…`);
    try {
      const bytes = await file.arrayBuffer();
      if (operationRef.current !== id) return;
      const worker = new Worker(new URL("./favicon.worker.ts", import.meta.url), {
        type: "module",
      });
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const response = event.data;
        if (response.id !== id) return;
        if (response.type === "progress") {
          setStatus(t.progress(response.completed, response.total));
          return;
        }
        setRunning(false);
        if (response.type === "result") {
          const nextUrl = URL.createObjectURL(
            new Blob([response.bytes], { type: "application/zip" }),
          );
          urlRef.current = nextUrl;
          setDownloadUrl(nextUrl);
          setStatus(t.ready);
        } else if (response.type === "cancelled") {
          setStatus(t.cancelled);
        } else {
          setError(response.message || t.failed);
          setStatus("");
        }
      };
      worker.onerror = () => {
        setRunning(false);
        setStatus("");
        setError(t.failed);
      };
      worker.postMessage(
        {
          type: "generate",
          id,
          bytes,
          mimeType: file.type,
          appName: options.appName,
          themeColor: options.themeColor,
        },
        [bytes],
      );
    } catch (cause) {
      setRunning(false);
      setStatus("");
      setError(cause instanceof Error ? cause.message : t.failed);
    }
  };

  const cancel = () => {
    if (!running) return;
    workerRef.current?.postMessage({
      type: "cancel",
      id: operationRef.current,
    });
  };

  const reset = () => {
    operationRef.current += 1;
    stopWorker();
    revokeDownload();
    setFile(null);
    setAppName("Vịt Tools");
    setThemeColor("#6d5dfc");
    setError("");
    setStatus("");
    setRunning(false);
  };

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <ToolPanel title={t.settings}>
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
              {t.source}
              <input
                aria-label={t.source}
                type="file"
                accept={FAVICON_MIME_TYPES.join(",")}
                onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
                className="mt-1.5 block w-full text-sm text-[var(--vt-text-2)] file:mr-3 file:rounded-lg file:border file:border-[var(--vt-border-2)] file:bg-[var(--vt-bg-1)] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[var(--vt-text)]"
              />
              <span className="mt-1 block font-normal text-[var(--vt-text-3)]">
                {t.accepted}
              </span>
            </label>
            <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
              {t.appName}
              <input
                aria-label={t.appName}
                value={appName}
                maxLength={80}
                onChange={(event) => setAppName(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
              />
            </label>
            <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
              {t.theme}
              <input
                aria-label={t.theme}
                type="color"
                value={themeColor}
                onChange={(event) => setThemeColor(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] p-1"
              />
            </label>
          </div>
          <p className="mt-4 text-xs text-[var(--vt-text-3)]">{t.privacy}</p>
          {error ? (
            <p role="alert" className="mt-3 rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 text-xs text-[var(--vt-red)]">
              {error}
            </p>
          ) : null}
          <ToolActions>
            <button
              type="button"
              onClick={() => void generate()}
              disabled={running}
              className="rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {t.generate}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={!running}
              className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-text)] disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-text)]"
            >
              {t.reset}
            </button>
          </ToolActions>
        </ToolPanel>
        <ToolPanel title={t.output}>
          <p className="text-sm text-[var(--vt-text-2)]">{t.contents}</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--vt-text-3)] sm:grid-cols-3">
            {FAVICON_OUTPUTS.map((output) => (
              <li key={output.name}>{output.size}×{output.size} PNG</li>
            ))}
          </ul>
          {status ? (
            <p role="status" aria-live="polite" className="mt-4 text-sm font-medium text-[var(--vt-text)]">
              {status}
            </p>
          ) : null}
          {downloadUrl ? (
            <a
              href={downloadUrl}
              download="favicon-set.zip"
              className="mt-4 inline-flex rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white"
            >
              {t.download}
            </a>
          ) : null}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

