import { useEffect, useRef, useState } from "react";

import { ToolActions, ToolPanel, ToolTextArea, ToolWorkspace } from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  certificateBytesFromPem,
  validateCertificateBytes,
  type CertificateValidity,
} from "./certificate";

const copy = {
  en: {
    title: "X.509 decoder",
    description: "Inspect one PEM or DER certificate locally without establishing trust.",
    input: "Certificate input",
    pemMode: "Paste PEM",
    fileMode: "Certificate file",
    pem: "PEM certificate",
    file: "Certificate file",
    decode: "Decode certificate",
    cancel: "Cancel decoding",
    reset: "Reset",
    privacy: "Certificate bytes do not leave your browser.",
    warning: "Decoded fields do not establish trust, revocation, hostname validity, or a trusted chain.",
    processing: "Decoding certificate…",
    result: "Certificate fields",
    empty: "Decoded fields will appear here.",
    subject: "Subject",
    issuer: "Issuer",
    serial: "Serial number",
    notBefore: "Not before",
    notAfter: "Not after",
    validity: "Current validity",
    signature: "Signature algorithm",
    publicKey: "Public key",
    fingerprint: "SHA-256 fingerprint",
    selfSigned: "Self-signed",
    yes: "Yes",
    no: "No",
    extensions: "Extensions",
    states: { valid: "Valid now", expired: "Expired", "not-yet-valid": "Not yet valid" },
    failed: "Could not decode the certificate.",
  },
  vi: {
    title: "Giải mã chứng chỉ X.509",
    description: "Xem một chứng chỉ PEM hoặc DER cục bộ mà không xác lập tin cậy.",
    input: "Đầu vào chứng chỉ",
    pemMode: "Dán PEM",
    fileMode: "Tệp chứng chỉ",
    pem: "Chứng chỉ PEM",
    file: "Tệp chứng chỉ",
    decode: "Giải mã chứng chỉ",
    cancel: "Hủy giải mã",
    reset: "Đặt lại",
    privacy: "Dữ liệu chứng chỉ không rời khỏi trình duyệt.",
    warning: "Các trường đã giải mã không xác lập độ tin cậy, thu hồi, hostname hay chuỗi gốc tin cậy.",
    processing: "Đang giải mã chứng chỉ…",
    result: "Các trường chứng chỉ",
    empty: "Các trường đã giải mã sẽ hiện ở đây.",
    subject: "Chủ thể",
    issuer: "Nhà phát hành",
    serial: "Số sê-ri",
    notBefore: "Có hiệu lực từ",
    notAfter: "Có hiệu lực đến",
    validity: "Hiệu lực hiện tại",
    signature: "Thuật toán chữ ký",
    publicKey: "Khóa công khai",
    fingerprint: "Fingerprint SHA-256",
    selfSigned: "Tự ký",
    yes: "Có",
    no: "Không",
    extensions: "Phần mở rộng",
    states: { valid: "Đang hợp lệ", expired: "Đã hết hạn", "not-yet-valid": "Chưa có hiệu lực" },
    failed: "Không thể giải mã chứng chỉ.",
  },
} as const;

type CertificateResult = {
  subject: string;
  issuer: string;
  serialNumber: string;
  notBefore: string;
  notAfter: string;
  validity: CertificateValidity;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  fingerprint: string;
  selfSigned: boolean;
  extensions: { oid: string; critical: boolean }[];
};
type Response =
  | { type: "result"; id: number; certificate: CertificateResult }
  | { type: "error"; id: number; message: string };

export default function CertificateTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [mode, setMode] = useState<"pem" | "file">("pem");
  const [pem, setPem] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CertificateResult | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const operationRef = useRef(0);
  const terminate = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
  };
  useEffect(() => () => terminate(), []);
  const reset = (nextMode: "pem" | "file" = "pem") => {
    operationRef.current += 1;
    terminate();
    setMode(nextMode);
    setPem("");
    setFile(null);
    setRunning(false);
    setStatus("");
    setError("");
    setResult(null);
  };

  const decode = async () => {
    setError("");
    setResult(null);
    let bytes: Uint8Array;
    try {
      if (mode === "pem") {
        bytes = certificateBytesFromPem(pem);
      } else {
        if (!file) throw new Error("Choose a certificate file.");
        if (file.size > 5 * 1024 * 1024) throw new Error("Certificate must be 5 MB or smaller.");
        const raw = new Uint8Array(await file.arrayBuffer());
        const startsWithPem = new TextDecoder().decode(raw.subarray(0, 32)).includes("-----BEGIN");
        bytes = startsWithPem
          ? certificateBytesFromPem(new TextDecoder().decode(raw))
          : validateCertificateBytes(raw);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return;
    }
    terminate();
    const id = operationRef.current + 1;
    operationRef.current = id;
    setRunning(true);
    setStatus(t.processing);
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const worker = new Worker(new URL("./certificate.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<Response>) => {
      if (event.data.id !== id) return;
      setRunning(false);
      setStatus("");
      if (event.data.type === "result") setResult(event.data.certificate);
      else setError(event.data.message || t.failed);
    };
    worker.onerror = () => {
      setRunning(false);
      setStatus("");
      setError(t.failed);
    };
    worker.postMessage({ type: "decode", id, bytes: buffer }, [buffer]);
  };

  const fields = result
    ? [
        [t.subject, result.subject],
        [t.issuer, result.issuer],
        [t.serial, result.serialNumber],
        [t.notBefore, result.notBefore],
        [t.notAfter, result.notAfter],
        [t.validity, t.states[result.validity]],
        [t.signature, result.signatureAlgorithm],
        [t.publicKey, result.publicKeyAlgorithm],
        [t.fingerprint, result.fingerprint],
        [t.selfSigned, result.selfSigned ? t.yes : t.no],
      ]
    : [];

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[440px_1fr]">
        <ToolPanel title={t.input}>
          <fieldset className="flex gap-4">
            <legend className="sr-only">{t.input}</legend>
            {(["pem", "file"] as const).map((value) => <label key={value} className="flex items-center gap-2 text-sm"><input type="radio" name="cert-mode" checked={mode === value} onChange={() => reset(value)} />{value === "pem" ? t.pemMode : t.fileMode}</label>)}
          </fieldset>
          <div className="mt-4">
            {mode === "pem" ? <ToolTextArea label={t.pem} value={pem} onChange={(value) => { setPem(value); setError(""); setResult(null); }} rows={12} /> : <label className="block text-xs font-semibold text-[var(--vt-text-2)]">{t.file}<input aria-label={t.file} type="file" accept=".pem,.crt,.cer,application/pkix-cert" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(""); setResult(null); }} className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--vt-border-2)] file:px-3 file:py-2 file:text-xs" /></label>}
          </div>
          <p className="mt-4 text-xs text-[var(--vt-text-3)]">{t.privacy}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--vt-yellow)]">{t.warning}</p>
          {error ? <p role="alert" className="mt-3 rounded-lg border border-[var(--vt-red)]/40 p-3 text-xs text-[var(--vt-red)]">{error}</p> : null}
          <ToolActions>
            <button type="button" onClick={() => void decode()} disabled={running} className="rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{t.decode}</button>
            <button type="button" onClick={() => reset(mode)} disabled={!running} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold disabled:opacity-50">{t.cancel}</button>
            <button type="button" onClick={() => reset()} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold">{t.reset}</button>
          </ToolActions>
        </ToolPanel>
        <ToolPanel title={t.result}>
          {status ? <p role="status" aria-live="polite" className="text-sm">{status}</p> : null}
          {!status && !result ? <p className="text-sm text-[var(--vt-text-3)]">{t.empty}</p> : null}
          {result ? <div><dl className="space-y-3">{fields.map(([label, value]) => <div key={label}><dt className="text-xs font-semibold text-[var(--vt-text-3)]">{label}</dt><dd className="mt-1 break-all font-mono text-sm">{value}</dd></div>)}</dl><h2 className="mt-5 text-sm font-semibold">{t.extensions}</h2><ul className="mt-2 space-y-1 font-mono text-xs text-[var(--vt-text-2)]">{result.extensions.map((extension) => <li key={extension.oid}>{extension.oid}{extension.critical ? " · critical" : ""}</li>)}</ul></div> : null}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

