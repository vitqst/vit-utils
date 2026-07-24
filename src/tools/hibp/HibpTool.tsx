import { useEffect, useRef, useState } from "react";

import { ToolActions, ToolPanel, ToolWorkspace } from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  HIBP_RANGE_ORIGIN,
  derivePwnedPasswordRange,
  parsePwnedRangeResponse,
} from "./hibp";

const copy = {
  en: {
    title: "Breach check (HIBP)",
    description: "Check Pwned Passwords with a disclosed k-anonymity prefix request.",
    input: "Password check",
    password: "Password",
    show: "Show password",
    hide: "Hide password",
    check: "Check HIBP",
    cancel: "Cancel request",
    clear: "Clear",
    disclosureTitle: "One network request",
    disclosure:
      "Only the first 5 characters of the locally calculated SHA-1 hash are sent to api.pwnedpasswords.com. The password and full hash never leave this browser.",
    padded: "Response padding is requested; comparison happens locally.",
    checking: "Checking HIBP…",
    result: "Result",
    empty: "No check has run.",
    found: (count: number) =>
      `Found in ${count.toLocaleString("en")} known breach records. Do not use this password.`,
    safe:
      "Not found in the current Pwned Passwords corpus. This does not prove the password is safe.",
    rate: "HIBP rate limit reached. Wait before trying again.",
    unavailable: "HIBP is temporarily unavailable.",
    failed: "The HIBP request failed. Check your connection and try again.",
  },
  vi: {
    title: "Kiểm tra rò rỉ (HIBP)",
    description: "Kiểm tra Pwned Passwords bằng yêu cầu tiền tố k-anonymity được công khai.",
    input: "Kiểm tra mật khẩu",
    password: "Mật khẩu",
    show: "Hiện mật khẩu",
    hide: "Ẩn mật khẩu",
    check: "Kiểm tra HIBP",
    cancel: "Hủy yêu cầu",
    clear: "Xóa",
    disclosureTitle: "Một yêu cầu mạng",
    disclosure:
      "Chỉ 5 ký tự đầu của hash SHA-1 được tính cục bộ được gửi tới api.pwnedpasswords.com. Mật khẩu và hash đầy đủ không rời khỏi trình duyệt.",
    padded: "Có yêu cầu đệm phản hồi; việc so sánh diễn ra cục bộ.",
    checking: "Đang kiểm tra HIBP…",
    result: "Kết quả",
    empty: "Chưa chạy kiểm tra.",
    found: (count: number) =>
      `Đã thấy trong ${count.toLocaleString("vi")} bản ghi rò rỉ. Không dùng mật khẩu này.`,
    safe:
      "Không thấy trong kho Pwned Passwords hiện tại. Điều này không chứng minh mật khẩu an toàn.",
    rate: "Đã chạm giới hạn HIBP. Hãy đợi trước khi thử lại.",
    unavailable: "HIBP tạm thời không khả dụng.",
    failed: "Yêu cầu HIBP thất bại. Hãy kiểm tra kết nối và thử lại.",
  },
} as const;

export default function HibpTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const operationRef = useRef(0);

  const cancel = () => {
    operationRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    setRunning(false);
    setStatus("");
  };
  useEffect(() => () => controllerRef.current?.abort(), []);

  const check = async () => {
    setError("");
    setCount(null);
    let range;
    try {
      range = derivePwnedPasswordRange(password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return;
    }
    cancel();
    const id = operationRef.current + 1;
    operationRef.current = id;
    const controller = new AbortController();
    controllerRef.current = controller;
    setRunning(true);
    setStatus(t.checking);
    try {
      const response = await fetch(`${HIBP_RANGE_ORIGIN}/range/${range.prefix}`, {
        method: "GET",
        headers: { "Add-Padding": "true" },
        cache: "no-store",
        credentials: "omit",
        mode: "cors",
        redirect: "error",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      });
      if (response.status === 429) throw new Error("rate-limit");
      if (response.status >= 500) throw new Error("unavailable");
      if (!response.ok) throw new Error(`HIBP returned HTTP ${response.status}.`);
      const responseText = await response.text();
      if (operationRef.current !== id) return;
      setCount(parsePwnedRangeResponse(responseText, range.suffix));
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      const message = cause instanceof Error ? cause.message : "";
      setError(
        message === "rate-limit"
          ? t.rate
          : message === "unavailable"
            ? t.unavailable
            : t.failed,
      );
    } finally {
      if (operationRef.current === id) {
        controllerRef.current = null;
        setRunning(false);
        setStatus("");
      }
    }
  };

  const clear = () => {
    cancel();
    setPassword("");
    setVisible(false);
    setCount(null);
    setError("");
  };

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <ToolPanel title={t.input}>
          <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.password}
            <input aria-label={t.password} type={visible ? "text" : "password"} value={password} autoComplete="new-password" onChange={(event) => { setPassword(event.target.value); setCount(null); setError(""); }} className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm" />
          </label>
          <button type="button" onClick={() => setVisible((current) => !current)} className="mt-2 text-xs font-semibold text-[var(--vt-accent)]">{visible ? t.hide : t.show}</button>
          <section aria-label={t.disclosureTitle} className="mt-4 rounded-xl border border-[var(--vt-yellow)]/40 bg-[var(--vt-yellow)]/5 p-3">
            <h2 className="text-sm font-semibold text-[var(--vt-text)]">{t.disclosureTitle}</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--vt-text-2)]">{t.disclosure}</p>
            <p className="mt-1 text-xs text-[var(--vt-text-3)]">{t.padded}</p>
          </section>
          {error ? <p role="alert" className="mt-3 rounded-lg border border-[var(--vt-red)]/40 p-3 text-xs text-[var(--vt-red)]">{error}</p> : null}
          <ToolActions>
            <button type="button" onClick={() => void check()} disabled={running} className="rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{t.check}</button>
            <button type="button" onClick={cancel} disabled={!running} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold disabled:opacity-50">{t.cancel}</button>
            <button type="button" onClick={clear} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold">{t.clear}</button>
          </ToolActions>
        </ToolPanel>
        <ToolPanel title={t.result}>
          {status ? <p role="status" aria-live="polite" className="text-sm">{status}</p> : null}
          {!status && count === null ? <p className="text-sm text-[var(--vt-text-3)]">{t.empty}</p> : null}
          {count !== null ? (
            <p role="status" aria-live="polite" className={`rounded-xl border p-4 text-sm font-semibold ${count > 0 ? "border-[var(--vt-red)]/40 bg-[var(--vt-red)]/5 text-[var(--vt-red)]" : "border-[var(--vt-green)]/40 bg-[var(--vt-green)]/5 text-[var(--vt-green)]"}`}>
              {count > 0 ? t.found(count) : t.safe}
            </p>
          ) : null}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

