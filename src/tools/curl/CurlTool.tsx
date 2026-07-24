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
import { convertCurl, type CurlTarget } from "./curl";

const copy = {
  en: {
    title: "curl → code",
    description:
      "Parse a safe curl subset and generate request code locally without making a request.",
    target: "Code target",
    browser: "Browser Fetch",
    node: "Node Fetch",
    python: "Python Requests",
    php: "PHP cURL",
    input: "curl command",
    output: "Generated code",
    placeholder: "curl https://api.example.com/data",
    empty: "Generated request code appears here.",
    copy: "Copy code",
    copied: "Copied",
    copyFailed: "Copy failed",
    download: "Download code",
    safety:
      "This parser never executes the command or sends a network request. Unsupported shell syntax is rejected.",
  },
  vi: {
    title: "curl → mã nguồn",
    description:
      "Phân tích tập con curl an toàn và tạo mã yêu cầu cục bộ mà không gửi yêu cầu.",
    target: "Mã đích",
    browser: "Fetch trình duyệt",
    node: "Node Fetch",
    python: "Python Requests",
    php: "PHP cURL",
    input: "Lệnh curl",
    output: "Mã đã tạo",
    placeholder: "curl https://api.example.com/data",
    empty: "Mã yêu cầu đã tạo sẽ hiện ở đây.",
    copy: "Sao chép mã",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    download: "Tải mã",
    safety:
      "Trình phân tích không bao giờ chạy lệnh hoặc gửi yêu cầu mạng. Cú pháp shell không hỗ trợ sẽ bị từ chối.",
  },
} as const;

const targets: Array<{
  id: CurlTarget;
  label: keyof Pick<typeof copy.en, "browser" | "node" | "python" | "php">;
  filename: string;
}> = [
  { id: "browser-fetch", label: "browser", filename: "request.js" },
  { id: "node-fetch", label: "node", filename: "request.js" },
  { id: "python", label: "python", filename: "request.py" },
  { id: "php", label: "php", filename: "request.php" },
];

export default function CurlTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [source, setSource] = useState("");
  const [target, setTarget] = useState<CurlTarget>("browser-fetch");
  const result = useMemo(() => {
    if (!source.trim()) return { output: "", error: "" };
    try {
      return { output: convertCurl(source, target), error: "" };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [source, target]);
  const selectedTarget = targets.find((item) => item.id === target) ?? targets[0];
  const downloadHref = result.output
    ? `data:text/plain;charset=utf-8,${encodeURIComponent(result.output)}`
    : "";

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        <label className="text-xs font-semibold text-[var(--vt-text-2)]">
          {t.target}
          <select
            aria-label={t.target}
            value={target}
            onChange={(event) => setTarget(event.target.value as CurlTarget)}
            className="ml-2 h-9 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-sm text-[var(--vt-text)]"
          >
            {targets.map((item) => (
              <option key={item.id} value={item.id}>
                {t[item.label]}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs leading-5 text-[var(--vt-text-3)]">{t.safety}</p>
      </div>
      <ToolGrid>
        <ToolPanel title={t.input}>
          <ToolTextArea
            label={t.input}
            value={source}
            onChange={setSource}
            placeholder={t.placeholder}
          />
        </ToolPanel>
        <ToolPanel title={t.output}>
          {result.error ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs leading-5 text-[var(--vt-red)]"
            >
              {result.error}
            </p>
          ) : (
            <ToolOutput
              label={t.output}
              value={result.output}
              emptyLabel={t.empty}
            />
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CopyButton
              value={result.output}
              label={t.copy}
              copiedLabel={t.copied}
              failedLabel={t.copyFailed}
            />
            {downloadHref ? (
              <a
                href={downloadHref}
                download={selectedTarget.filename}
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

