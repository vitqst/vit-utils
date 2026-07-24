import { useEffect, useRef, useState } from "react";

import { ToolActions, ToolPanel, ToolWorkspace } from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  localizedStrengthSuggestions,
  scoreLabel,
  validateStrengthPassword,
} from "./strength";

const copy = {
  en: {
    title: "Password strength",
    description: "Estimate guess resistance locally and get practical suggestions.",
    settings: "Password",
    password: "Password",
    show: "Show password",
    hide: "Hide password",
    check: "Check strength",
    cancel: "Cancel evaluation",
    reset: "Reset",
    privacy: "The password is not sent, logged, or stored.",
    processing: "Evaluating password…",
    result: "Strength estimate",
    empty: "Run an evaluation to see the estimate.",
    score: "Score",
    guesses: "Estimated guesses",
    crackTime: "Offline-fast crack time",
    patterns: "Detected pattern types",
    suggestions: "Suggestions",
    disclaimer: "This estimate is guidance, not a guarantee or breach check.",
    failed: "Could not evaluate the password.",
  },
  vi: {
    title: "Độ mạnh mật khẩu",
    description: "Ước tính khả năng chống đoán cục bộ và nhận gợi ý thực tế.",
    settings: "Mật khẩu",
    password: "Mật khẩu",
    show: "Hiện mật khẩu",
    hide: "Ẩn mật khẩu",
    check: "Đánh giá độ mạnh",
    cancel: "Hủy đánh giá",
    reset: "Đặt lại",
    privacy: "Mật khẩu không được gửi hoặc lưu.",
    processing: "Đang đánh giá mật khẩu…",
    result: "Ước tính độ mạnh",
    empty: "Hãy chạy đánh giá để xem kết quả.",
    score: "Điểm",
    guesses: "Số lần đoán ước tính",
    crackTime: "Thời gian bẻ khóa ngoại tuyến nhanh",
    patterns: "Loại mẫu đã phát hiện",
    suggestions: "Gợi ý",
    disclaimer: "Ước tính này chỉ để tham khảo, không bảo đảm và không kiểm tra rò rỉ.",
    failed: "Không thể đánh giá mật khẩu.",
  },
} as const;

type Result = {
  score: number;
  guesses: number;
  crackTime: string;
  warning: string | null;
  suggestions: string[];
  patterns: string[];
};
type Response =
  | ({ type: "result"; id: number } & Result)
  | { type: "error"; id: number; message: string };

export default function StrengthTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const operationRef = useRef(0);
  const terminate = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
  };
  useEffect(() => () => terminate(), []);

  const check = () => {
    setError("");
    try {
      validateStrengthPassword(password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return;
    }
    terminate();
    const id = operationRef.current + 1;
    operationRef.current = id;
    setRunning(true);
    setStatus(t.processing);
    setResult(null);
    const worker = new Worker(new URL("./strength.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<Response>) => {
      if (event.data.id !== id) return;
      setRunning(false);
      setStatus("");
      if (event.data.type === "result") {
        const { type: _type, id: _id, ...safeResult } = event.data;
        setResult(safeResult);
      } else {
        setError(event.data.message || t.failed);
      }
    };
    worker.onerror = () => {
      setRunning(false);
      setStatus("");
      setError(t.failed);
    };
    worker.postMessage({ type: "check", id, password });
  };

  const cancel = () => {
    operationRef.current += 1;
    terminate();
    setRunning(false);
    setStatus("");
  };
  const reset = () => {
    cancel();
    setPassword("");
    setVisible(false);
    setError("");
    setResult(null);
  };
  const suggestions = result
    ? localizedStrengthSuggestions(result.score, locale)
    : [];

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <ToolPanel title={t.settings}>
          <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.password}
            <input aria-label={t.password} type={visible ? "text" : "password"} value={password} autoComplete="new-password" onChange={(event) => { setPassword(event.target.value); setResult(null); setError(""); }} className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm" />
          </label>
          <button type="button" onClick={() => setVisible((current) => !current)} className="mt-2 text-xs font-semibold text-[var(--vt-accent)]">{visible ? t.hide : t.show}</button>
          <p className="mt-4 text-xs text-[var(--vt-text-3)]">{t.privacy}</p>
          {error ? <p role="alert" className="mt-3 rounded-lg border border-[var(--vt-red)]/40 p-3 text-xs text-[var(--vt-red)]">{error}</p> : null}
          <ToolActions>
            <button type="button" onClick={check} disabled={running} className="rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{t.check}</button>
            <button type="button" onClick={cancel} disabled={!running} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold disabled:opacity-50">{t.cancel}</button>
            <button type="button" onClick={reset} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold">{t.reset}</button>
          </ToolActions>
        </ToolPanel>
        <ToolPanel title={t.result}>
          {status ? <p role="status" aria-live="polite" className="text-sm">{status}</p> : null}
          {!status && !result ? <p className="text-sm text-[var(--vt-text-3)]">{t.empty}</p> : null}
          {result ? (
            <div>
              <p className="text-2xl font-bold text-[var(--vt-text)]">{scoreLabel(result.score, locale)}</p>
              <p className="mt-1 font-mono text-xs text-[var(--vt-text-3)]">{t.score}: {result.score}/4</p>
              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><dt className="text-xs text-[var(--vt-text-3)]">{t.guesses}</dt><dd className="mt-1 font-mono text-sm">{result.guesses.toLocaleString(locale)}</dd></div>
                <div><dt className="text-xs text-[var(--vt-text-3)]">{t.crackTime}</dt><dd className="mt-1 text-sm">{result.crackTime}</dd></div>
              </dl>
              {result.patterns.length ? <p className="mt-4 text-xs text-[var(--vt-text-2)]"><b>{t.patterns}:</b> {result.patterns.join(", ")}</p> : null}
              <h2 className="mt-4 text-sm font-semibold">{t.suggestions}</h2>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--vt-text-2)]">{suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ul>
              <p className="mt-4 text-xs text-[var(--vt-text-3)]">{t.disclaimer}</p>
            </div>
          ) : null}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

