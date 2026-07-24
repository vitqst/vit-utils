import { useEffect, useRef, useState } from "react";

import {
  CopyButton,
  ToolActions,
  ToolOutput,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  type ChecksumAlgorithm,
  parseExpectedChecksum,
  validateChecksumFile,
  verifyChecksum,
} from "./checksum";

const CHUNK_BYTES = 1024 * 1024;

const copy = {
  en: {
    title: "File checksum",
    description: "Calculate and verify a local file checksum in bounded chunks.",
    settings: "Checksum settings",
    file: "File",
    algorithm: "Algorithm",
    legacy: "legacy",
    expected: "Expected checksum",
    expectedHint: "Bare hex, GNU, and BSD checksum formats are accepted.",
    calculate: "Calculate checksum",
    cancel: "Cancel processing",
    reset: "Reset",
    privacy: "The selected file does not leave your browser.",
    processing: (percent: number) => `Hashing… ${percent}%`,
    result: "Checksum result",
    empty: "The checksum will appear here.",
    match: "Checksum matches.",
    mismatch: "Checksum does not match.",
    copy: "Copy checksum",
    copied: "Copied",
    copyFailed: "Copy failed",
    download: "Download checksum file",
    failed: "Could not calculate the checksum.",
  },
  vi: {
    title: "Checksum tệp",
    description: "Tính và xác minh checksum tệp cục bộ theo từng khối có giới hạn.",
    settings: "Cài đặt checksum",
    file: "Tệp",
    algorithm: "Thuật toán",
    legacy: "cũ",
    expected: "Checksum mong đợi",
    expectedHint: "Chấp nhận hex thuần và định dạng checksum GNU, BSD.",
    calculate: "Tính checksum",
    cancel: "Hủy xử lý",
    reset: "Đặt lại",
    privacy: "Tệp đã chọn không rời khỏi trình duyệt.",
    processing: (percent: number) => `Đang băm… ${percent}%`,
    result: "Kết quả checksum",
    empty: "Checksum sẽ hiện ở đây.",
    match: "Checksum khớp.",
    mismatch: "Checksum không khớp.",
    copy: "Sao chép checksum",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    download: "Tải tệp checksum",
    failed: "Không thể tính checksum.",
  },
} as const;

type Response =
  | { type: "ready"; id: number }
  | { type: "progress"; id: number; processed: number; total: number }
  | { type: "result"; id: number; hash: string }
  | { type: "cancelled"; id: number }
  | { type: "error"; id: number; message: string };

export default function ChecksumTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState<ChecksumAlgorithm>("sha256");
  const [expectedInput, setExpectedInput] = useState("");
  const [expectedHash, setExpectedHash] = useState("");
  const [hash, setHash] = useState("");
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const operationRef = useRef(0);
  const ackRef = useRef<(() => void) | null>(null);
  const cancelledRef = useRef(false);

  const terminate = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    ackRef.current?.();
    ackRef.current = null;
  };
  useEffect(() => () => terminate(), []);

  const reset = () => {
    operationRef.current += 1;
    cancelledRef.current = true;
    terminate();
    setFile(null);
    setAlgorithm("sha256");
    setExpectedInput("");
    setExpectedHash("");
    setHash("");
    setRunning(false);
    setStatus("");
    setError("");
  };

  const calculate = async () => {
    setError("");
    let normalizedExpected = "";
    try {
      validateChecksumFile(file ?? undefined);
      if (expectedInput.trim()) {
        normalizedExpected = parseExpectedChecksum(expectedInput, algorithm);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return;
    }
    if (!file) return;
    terminate();
    const id = operationRef.current + 1;
    operationRef.current = id;
    cancelledRef.current = false;
    setExpectedHash(normalizedExpected);
    setHash("");
    setRunning(true);
    setStatus(t.processing(0));

    const worker = new Worker(new URL("./checksum.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;
    const waitForAck = () =>
      new Promise<void>((resolve) => {
        ackRef.current = resolve;
      });
    worker.onmessage = (event: MessageEvent<Response>) => {
      const response = event.data;
      if (response.id !== id) return;
      if (response.type === "ready" || response.type === "progress") {
        if (response.type === "progress") {
          const percent = response.total
            ? Math.round((response.processed / response.total) * 100)
            : 100;
          setStatus(t.processing(percent));
        }
        ackRef.current?.();
        ackRef.current = null;
      } else if (response.type === "result") {
        setHash(response.hash);
        setRunning(false);
        setStatus("");
      } else if (response.type === "cancelled") {
        cancelledRef.current = true;
        setRunning(false);
        setStatus("");
        ackRef.current?.();
        ackRef.current = null;
      } else {
        cancelledRef.current = true;
        setRunning(false);
        setStatus("");
        setError(response.message || t.failed);
        ackRef.current?.();
        ackRef.current = null;
      }
    };
    worker.onerror = () => {
      cancelledRef.current = true;
      setRunning(false);
      setStatus("");
      setError(t.failed);
      ackRef.current?.();
      ackRef.current = null;
    };

    try {
      let acknowledgement = waitForAck();
      worker.postMessage({ type: "start", id, algorithm, total: file.size });
      await acknowledgement;
      for (let offset = 0; offset < file.size; offset += CHUNK_BYTES) {
        if (cancelledRef.current || operationRef.current !== id) return;
        const end = Math.min(file.size, offset + CHUNK_BYTES);
        const bytes = await file.slice(offset, end).arrayBuffer();
        if (cancelledRef.current || operationRef.current !== id) return;
        acknowledgement = waitForAck();
        worker.postMessage(
          { type: "chunk", id, bytes, processed: end, total: file.size },
          [bytes],
        );
        await acknowledgement;
      }
      if (!cancelledRef.current && operationRef.current === id) {
        worker.postMessage({ type: "finish", id });
      }
    } catch (cause) {
      setRunning(false);
      setStatus("");
      setError(cause instanceof Error ? cause.message : t.failed);
    }
  };

  const cancel = () => {
    if (!running) return;
    cancelledRef.current = true;
    workerRef.current?.postMessage({ type: "cancel", id: operationRef.current });
  };

  const verification =
    hash && expectedHash
      ? verifyChecksum(hash, expectedHash)
        ? t.match
        : t.mismatch
      : "";
  const checksumFile = hash && file ? `${hash} *${file.name}\n` : "";

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <ToolPanel title={t.settings}>
          <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.file}
            <input aria-label={t.file} type="file" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setHash(""); setError(""); }} className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--vt-border-2)] file:px-3 file:py-2 file:text-xs" />
          </label>
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.algorithm}
            <select aria-label={t.algorithm} value={algorithm} onChange={(event) => { setAlgorithm(event.target.value as ChecksumAlgorithm); setHash(""); }} className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm">
              <option value="sha256">SHA-256</option>
              <option value="sha384">SHA-384</option>
              <option value="sha512">SHA-512</option>
              <option value="sha1">SHA-1 ({t.legacy})</option>
              <option value="md5">MD5 ({t.legacy})</option>
            </select>
          </label>
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.expected}
            <textarea aria-label={t.expected} value={expectedInput} onChange={(event) => { setExpectedInput(event.target.value); setHash(""); }} rows={3} className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 font-mono text-xs" />
            <span className="mt-1 block font-normal text-[var(--vt-text-3)]">{t.expectedHint}</span>
          </label>
          <p className="mt-4 text-xs text-[var(--vt-text-3)]">{t.privacy}</p>
          {error ? <p role="alert" className="mt-3 rounded-lg border border-[var(--vt-red)]/40 p-3 text-xs text-[var(--vt-red)]">{error}</p> : null}
          <ToolActions>
            <button type="button" onClick={() => void calculate()} disabled={running} className="rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{t.calculate}</button>
            <button type="button" onClick={cancel} disabled={!running} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold disabled:opacity-50">{t.cancel}</button>
            <button type="button" onClick={reset} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold">{t.reset}</button>
          </ToolActions>
        </ToolPanel>
        <ToolPanel title={t.result}>
          {status ? <p role="status" aria-live="polite" className="mb-3 text-sm">{status}</p> : null}
          <ToolOutput label={t.result} value={hash} emptyLabel={t.empty} />
          {verification ? <p className={`mt-3 text-sm font-semibold ${verification === t.match ? "text-[var(--vt-green)]" : "text-[var(--vt-red)]"}`}>{verification}</p> : null}
          {hash ? (
            <ToolActions>
              <CopyButton value={hash} label={t.copy} copiedLabel={t.copied} failedLabel={t.copyFailed} />
              <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(checksumFile)}`} download={`${file?.name ?? "file"}.${algorithm}`} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]">{t.download}</a>
            </ToolActions>
          ) : null}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

