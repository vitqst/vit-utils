import { useMemo, useState } from "react";

import {
  CopyButton,
  ToolGrid,
  ToolOutput,
  ToolPanel,
  ToolTextArea,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { decodeJwt, type TimeClaimStatus } from "./jwt";

const copy = {
  en: {
    title: "JWT decoder",
    description:
      "Inspect JWT header, payload, and time claims locally. This tool does not verify signatures.",
    input: "JWT token",
    placeholder: "Paste a compact JWT…",
    header: "Header",
    payload: "Payload",
    emptyHeader: "Decoded header appears here.",
    emptyPayload: "Decoded payload appears here.",
    warning:
      "Signature has not been verified. Do not use this output to make authorization decisions.",
    claims: "Time claims",
    signature: "Signature segment",
    noSignature: "(empty)",
    copyHeader: "Copy header",
    copyPayload: "Copy payload",
    copied: "Copied",
    copyFailed: "Copy failed",
    statuses: {
      expired: "Expired",
      active: "Active",
      future: "Not active yet",
      issued: "Issued",
    },
  },
  vi: {
    title: "Giải mã JWT",
    description:
      "Soi header, payload và claim thời gian JWT cục bộ. Công cụ không xác minh chữ ký.",
    input: "Token JWT",
    placeholder: "Dán JWT dạng compact…",
    header: "Header",
    payload: "Payload",
    emptyHeader: "Header đã giải mã sẽ hiện ở đây.",
    emptyPayload: "Payload đã giải mã sẽ hiện ở đây.",
    warning:
      "Chữ ký chưa được xác minh. Không dùng kết quả này để quyết định phân quyền.",
    claims: "Claim thời gian",
    signature: "Đoạn chữ ký",
    noSignature: "(rỗng)",
    copyHeader: "Sao chép header",
    copyPayload: "Sao chép payload",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    statuses: {
      expired: "Đã hết hạn",
      active: "Đang hiệu lực",
      future: "Chưa hiệu lực",
      issued: "Đã phát hành",
    },
  },
} as const;

export default function JwtTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [token, setToken] = useState("");
  const decoded = useMemo(() => {
    if (!token.trim()) return { value: null, error: "" };
    try {
      return { value: decodeJwt(token), error: "" };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [token]);
  const header = decoded.value
    ? JSON.stringify(decoded.value.header, null, 2)
    : "";
  const payload = decoded.value
    ? JSON.stringify(decoded.value.payload, null, 2)
    : "";

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <p
        role="alert"
        className="mb-4 rounded-xl border border-[var(--vt-accent)]/40 bg-[var(--vt-accent)]/10 p-3 text-sm text-[var(--vt-accent)]"
      >
        {t.warning}
      </p>
      <ToolPanel title={t.input}>
        <ToolTextArea
          label={t.input}
          value={token}
          onChange={setToken}
          placeholder={t.placeholder}
          rows={5}
        />
        {decoded.error ? (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs text-[var(--vt-red)]"
          >
            {decoded.error}
          </p>
        ) : null}
      </ToolPanel>
      <div className="mt-4">
        <ToolGrid>
          <ToolPanel title={t.header}>
            <ToolOutput
              label={t.header}
              value={header}
              emptyLabel={t.emptyHeader}
            />
            <div className="mt-3">
              <CopyButton
                value={header}
                label={t.copyHeader}
                copiedLabel={t.copied}
                failedLabel={t.copyFailed}
              />
            </div>
          </ToolPanel>
          <ToolPanel title={t.payload}>
            <ToolOutput
              label={t.payload}
              value={payload}
              emptyLabel={t.emptyPayload}
            />
            <div className="mt-3">
              <CopyButton
                value={payload}
                label={t.copyPayload}
                copiedLabel={t.copied}
                failedLabel={t.copyFailed}
              />
            </div>
          </ToolPanel>
        </ToolGrid>
      </div>
      {decoded.value ? (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
            <h2 className="mb-3 text-sm font-semibold">{t.claims}</h2>
            {decoded.value.timeClaims.length ? (
              <dl className="space-y-2">
                {decoded.value.timeClaims.map((claim) => (
                  <div
                    key={claim.name}
                    className="grid grid-cols-[3rem_1fr_auto] gap-3 rounded-lg bg-[var(--vt-bg-0)] p-3 text-xs"
                  >
                    <dt className="font-mono text-[var(--vt-accent)]">
                      {claim.name}
                    </dt>
                    <dd className="text-[var(--vt-text-2)]">
                      {claim.date.toLocaleString(locale)}
                    </dd>
                    <dd className="font-semibold text-[var(--vt-text)]">
                      {t.statuses[claim.status as TimeClaimStatus]}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-xs text-[var(--vt-text-3)]">—</p>
            )}
          </section>
          <section className="rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
            <h2 className="mb-3 text-sm font-semibold">{t.signature}</h2>
            <code className="block break-all rounded-lg bg-[var(--vt-bg-0)] p-3 text-xs text-[var(--vt-text-2)]">
              {decoded.value.signature || t.noSignature}
            </code>
          </section>
        </div>
      ) : null}
    </ToolWorkspace>
  );
}

