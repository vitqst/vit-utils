import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CopyButton,
  ToolGrid,
  ToolOutput,
  ToolPanel,
  ToolTextArea,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { decodeBase64Text, encodeBase64Text } from "./base64";

type Direction = "encode" | "decode";
type InputKind = "text" | "file";

interface DownloadResult {
  blob: Blob;
  name: string;
}

const copy = {
  en: {
    title: "Base64",
    description:
      "Encode or decode UTF-8 text and local files. File bytes never leave your browser.",
    encode: "Encode",
    decode: "Decode",
    text: "Text",
    file: "File",
    urlSafe: "Base64url",
    input: "Input text",
    fileInput: "Choose file",
    result: "Result",
    placeholderEncode: "Type UTF-8 text to encode…",
    placeholderDecode: "Paste Base64 to decode…",
    empty: "Converted output appears here.",
    local: "Selected file content never leaves your browser.",
    cancel: "Cancel conversion",
    reset: "Reset",
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Copy failed",
    download: "Download result",
    processing: "Processing file…",
    bytesReady: "Decoded binary file is ready to download.",
  },
  vi: {
    title: "Base64",
    description:
      "Mã hóa hoặc giải mã văn bản UTF-8 và tệp cục bộ. Dữ liệu tệp không rời khỏi trình duyệt.",
    encode: "Mã hóa",
    decode: "Giải mã",
    text: "Văn bản",
    file: "Tệp",
    urlSafe: "Base64url",
    input: "Văn bản đầu vào",
    fileInput: "Chọn tệp",
    result: "Kết quả",
    placeholderEncode: "Nhập văn bản UTF-8 cần mã hóa…",
    placeholderDecode: "Dán Base64 cần giải mã…",
    empty: "Kết quả chuyển đổi sẽ hiện ở đây.",
    local: "Nội dung tệp đã chọn không rời khỏi trình duyệt.",
    cancel: "Hủy xử lý",
    reset: "Đặt lại",
    copy: "Sao chép kết quả",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    download: "Tải kết quả",
    processing: "Đang xử lý tệp…",
    bytesReady: "Tệp nhị phân đã giải mã sẵn sàng để tải xuống.",
  },
} as const;

export default function Base64Tool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [direction, setDirection] = useState<Direction>("encode");
  const [kind, setKind] = useState<InputKind>("text");
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState("");
  const [fileKey, setFileKey] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileResult, setFileResult] = useState("");
  const [fileError, setFileError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [download, setDownload] = useState<DownloadResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const operationId = useRef(0);

  const textConversion = useMemo(() => {
    if (kind !== "text" || !input) return { value: "", error: "" };
    try {
      const value =
        direction === "encode"
          ? encodeBase64Text(input, urlSafe)
          : decodeBase64Text(input, urlSafe);
      return { value, error: "" };
    } catch (caught) {
      return {
        value: "",
        error: caught instanceof Error ? caught.message : String(caught),
      };
    }
  }, [direction, input, kind, urlSafe]);

  useEffect(() => {
    if (!download) {
      setDownloadUrl("");
      return;
    }
    const url = URL.createObjectURL(download.blob);
    setDownloadUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [download]);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
    },
    [],
  );

  const stopWorker = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: "cancel",
        id: operationId.current,
      });
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setBusy(false);
    setProgress(0);
  };

  const reset = () => {
    stopWorker();
    setInput("");
    setFileName("");
    setFileResult("");
    setFileError("");
    setDownload(null);
    setFileKey((current) => current + 1);
  };

  const convertFile = async (file: File) => {
    stopWorker();
    setFileName(file.name);
    setFileResult("");
    setDownload(null);
    setFileError("");
    setBusy(true);
    setProgress(0);

    const id = operationId.current + 1;
    operationId.current = id;
    const worker = new Worker(new URL("./base64.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    worker.addEventListener("message", (event) => {
      if (event.data.id !== id) return;
      if (event.data.type === "progress") {
        setProgress(event.data.value);
      } else if (event.data.type === "encoded") {
        const value = String(event.data.value);
        setFileResult(value);
        setDownload({
          blob: new Blob([value], { type: "text/plain;charset=utf-8" }),
          name: `${file.name}.base64.txt`,
        });
        stopWorker();
      } else if (event.data.type === "decoded") {
        const bytes = new Uint8Array(event.data.bytes);
        setFileResult(t.bytesReady);
        setDownload({
          blob: new Blob([bytes], { type: "application/octet-stream" }),
          name: file.name.replace(/\.(?:b64|base64|txt)$/iu, "") || "decoded.bin",
        });
        stopWorker();
      } else if (event.data.type === "error") {
        setFileError(String(event.data.message));
        stopWorker();
      }
    });

    if (direction === "encode") {
      const bytes = await file.arrayBuffer();
      worker.postMessage(
        { type: "encode", id, bytes, urlSafe },
        [bytes],
      );
    } else {
      worker.postMessage({
        type: "decode",
        id,
        value: await file.text(),
        urlSafe,
      });
    }
  };

  const textResult = textConversion.value;
  const result = kind === "text" ? textResult : fileResult;
  const activeError = kind === "text" ? textConversion.error : fileError;

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 flex flex-wrap gap-5 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        <fieldset className="flex gap-4">
          <legend className="sr-only">Direction</legend>
          {(
            [
              ["encode", t.encode],
              ["decode", t.decode],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="base64-direction"
                checked={direction === value}
                onChange={() => {
                  setDirection(value);
                  setFileError("");
                  setFileResult("");
                  setDownload(null);
                }}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <fieldset className="flex gap-4">
          <legend className="sr-only">Input kind</legend>
          {(
            [
              ["text", t.text],
              ["file", t.file],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="base64-input-kind"
                checked={kind === value}
                onChange={() => {
                  stopWorker();
                  setKind(value);
                  setFileError("");
                }}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(event) => setUrlSafe(event.target.checked)}
          />
          {t.urlSafe}
        </label>
        <button
          type="button"
          onClick={reset}
          className="ml-auto rounded-lg border border-[var(--vt-border)] px-3 py-1.5 text-xs font-semibold"
        >
          {t.reset}
        </button>
      </div>
      <ToolGrid>
        <ToolPanel title={kind === "text" ? t.input : t.fileInput}>
          {kind === "text" ? (
            <ToolTextArea
              label={t.input}
              value={input}
              onChange={setInput}
              placeholder={
                direction === "encode"
                  ? t.placeholderEncode
                  : t.placeholderDecode
              }
            />
          ) : (
            <div className="space-y-3">
              <label className="block rounded-lg border border-dashed border-[var(--vt-border-2)] p-5 text-center text-sm text-[var(--vt-text-2)]">
                <span>{t.fileInput}</span>
                <input
                  key={fileKey}
                  type="file"
                  aria-label={t.fileInput}
                  className="mt-3 block w-full text-xs"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void convertFile(file);
                  }}
                />
              </label>
              {fileName ? (
                <p className="break-all font-mono text-xs">{fileName}</p>
              ) : null}
              <p className="text-xs text-[var(--vt-text-3)]">{t.local}</p>
              {busy ? (
                <p role="status" className="text-xs text-[var(--vt-accent)]">
                  {t.processing} {Math.round(progress * 100)}%
                </p>
              ) : null}
              <button
                type="button"
                disabled={!busy}
                onClick={stopWorker}
                className="rounded-lg border border-[var(--vt-border)] px-3 py-2 text-xs font-semibold disabled:opacity-50"
              >
                {t.cancel}
              </button>
            </div>
          )}
        </ToolPanel>
        <ToolPanel title={t.result}>
          {activeError ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs text-[var(--vt-red)]"
            >
              {activeError}
            </p>
          ) : (
            <ToolOutput label={t.result} value={result} emptyLabel={t.empty} />
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {kind === "text" ? (
              <CopyButton
                value={textResult}
                label={t.copy}
                copiedLabel={t.copied}
                failedLabel={t.copyFailed}
              />
            ) : null}
            {downloadUrl && download ? (
              <a
                href={downloadUrl}
                download={download.name}
                className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]"
              >
                {t.download}
              </a>
            ) : null}
          </div>
        </ToolPanel>
      </ToolGrid>
    </ToolWorkspace>
  );
}
