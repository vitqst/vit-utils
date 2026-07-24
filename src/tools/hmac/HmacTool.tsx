import { useState } from "react";

import { CopyButton, ToolActions, ToolOutput, ToolPanel, ToolTextArea, ToolWorkspace } from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  computeHmacBytes,
  decodeHmacValue,
  encodeHmacValue,
  verifyHmac,
  type HmacAlgorithm,
  type HmacEncoding,
  type HmacOutputEncoding,
} from "./hmac";

const copy = {
  en: {
    title: "HMAC",
    description: "Calculate and verify a keyed message signature with Web Crypto.",
    settings: "Signature settings",
    key: "Secret key",
    show: "Show key",
    hide: "Hide key",
    keyEncoding: "Key encoding",
    message: "Message",
    messageEncoding: "Message encoding",
    algorithm: "Algorithm",
    outputEncoding: "Output encoding",
    expected: "Expected signature",
    calculate: "Calculate HMAC",
    clear: "Clear",
    privacy: "The secret key and message do not leave your browser.",
    result: "HMAC result",
    empty: "The signature will appear here.",
    match: "Signature matches.",
    mismatch: "Signature does not match.",
    copy: "Copy signature",
    copied: "Copied",
    copyFailed: "Copy failed",
    download: "Download signature",
    failed: "Could not calculate HMAC.",
  },
  vi: {
    title: "HMAC",
    description: "Tính và xác minh chữ ký thông điệp có khóa bằng Web Crypto.",
    settings: "Cài đặt chữ ký",
    key: "Khóa bí mật",
    show: "Hiện khóa",
    hide: "Ẩn khóa",
    keyEncoding: "Mã hóa khóa",
    message: "Thông điệp",
    messageEncoding: "Mã hóa thông điệp",
    algorithm: "Thuật toán",
    outputEncoding: "Mã hóa đầu ra",
    expected: "Chữ ký mong đợi",
    calculate: "Tính HMAC",
    clear: "Xóa",
    privacy: "Khóa bí mật và thông điệp không rời khỏi trình duyệt.",
    result: "Kết quả HMAC",
    empty: "Chữ ký sẽ hiện ở đây.",
    match: "Chữ ký khớp.",
    mismatch: "Chữ ký không khớp.",
    copy: "Sao chép chữ ký",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    download: "Tải chữ ký",
    failed: "Không thể tính HMAC.",
  },
} as const;

export default function HmacTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [keyValue, setKeyValue] = useState("");
  const [keyVisible, setKeyVisible] = useState(false);
  const [keyEncoding, setKeyEncoding] = useState<HmacEncoding>("utf8");
  const [message, setMessage] = useState("");
  const [messageEncoding, setMessageEncoding] = useState<HmacEncoding>("utf8");
  const [algorithm, setAlgorithm] = useState<HmacAlgorithm>("SHA-256");
  const [outputEncoding, setOutputEncoding] = useState<HmacOutputEncoding>("hex");
  const [expected, setExpected] = useState("");
  const [result, setResult] = useState("");
  const [verification, setVerification] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const calculate = async () => {
    setError("");
    setResult("");
    setVerification(null);
    setRunning(true);
    try {
      const bytes = await computeHmacBytes({
        algorithm,
        key: keyValue,
        keyEncoding,
        message,
        messageEncoding,
      });
      const output = encodeHmacValue(bytes, outputEncoding);
      setResult(output);
      if (expected.trim()) {
        const expectedBytes = decodeHmacValue(expected.trim(), outputEncoding, true);
        setVerification(verifyHmac(bytes, expectedBytes));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.failed);
    } finally {
      setRunning(false);
    }
  };
  const clear = () => {
    setKeyValue("");
    setKeyVisible(false);
    setKeyEncoding("utf8");
    setMessage("");
    setMessageEncoding("utf8");
    setAlgorithm("SHA-256");
    setOutputEncoding("hex");
    setExpected("");
    setResult("");
    setVerification(null);
    setError("");
  };
  const select = (label: string, value: string, onChange: (value: string) => void, options: string[]) => <label className="block text-xs font-semibold text-[var(--vt-text-2)]">{label}<select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm">{options.map((option) => <option key={option} value={option}>{option.toUpperCase()}</option>)}</select></label>;

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[440px_1fr]">
        <ToolPanel title={t.settings}>
          <label className="block text-xs font-semibold text-[var(--vt-text-2)]">{t.key}<input aria-label={t.key} type={keyVisible ? "text" : "password"} value={keyValue} autoComplete="off" onChange={(event) => { setKeyValue(event.target.value); setResult(""); }} className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm" /></label>
          <button type="button" onClick={() => setKeyVisible((current) => !current)} className="mt-2 text-xs font-semibold text-[var(--vt-accent)]">{keyVisible ? t.hide : t.show}</button>
          <div className="mt-4">{select(t.keyEncoding, keyEncoding, (value) => setKeyEncoding(value as HmacEncoding), ["utf8", "hex", "base64"])}</div>
          <div className="mt-4"><ToolTextArea label={t.message} value={message} onChange={(value) => { setMessage(value); setResult(""); }} rows={5} /></div>
          <div className="mt-4 grid grid-cols-2 gap-3">{select(t.messageEncoding, messageEncoding, (value) => setMessageEncoding(value as HmacEncoding), ["utf8", "hex", "base64"])}{select(t.algorithm, algorithm, (value) => setAlgorithm(value as HmacAlgorithm), ["SHA-256", "SHA-384", "SHA-512"])}</div>
          <div className="mt-4">{select(t.outputEncoding, outputEncoding, (value) => setOutputEncoding(value as HmacOutputEncoding), ["hex", "base64"])}</div>
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">{t.expected}<textarea aria-label={t.expected} value={expected} onChange={(event) => { setExpected(event.target.value); setVerification(null); }} rows={3} className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 font-mono text-xs" /></label>
          <p className="mt-4 text-xs text-[var(--vt-text-3)]">{t.privacy}</p>
          {error ? <p role="alert" className="mt-3 text-xs text-[var(--vt-red)]">{error}</p> : null}
          <ToolActions><button type="button" onClick={() => void calculate()} disabled={running} className="rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{t.calculate}</button><button type="button" onClick={clear} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold">{t.clear}</button></ToolActions>
        </ToolPanel>
        <ToolPanel title={t.result}>
          <ToolOutput label={t.result} value={result} emptyLabel={t.empty} />
          {verification !== null ? <p className={`mt-3 text-sm font-semibold ${verification ? "text-[var(--vt-green)]" : "text-[var(--vt-red)]"}`}>{verification ? t.match : t.mismatch}</p> : null}
          {result ? <ToolActions><CopyButton value={result} label={t.copy} copiedLabel={t.copied} failedLabel={t.copyFailed} /><a href={`data:text/plain;charset=utf-8,${encodeURIComponent(`${result}\n`)}`} download={`hmac-${algorithm.toLowerCase()}.txt`} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]">{t.download}</a></ToolActions> : null}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

