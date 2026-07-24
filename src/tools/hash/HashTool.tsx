import { useMemo, useState } from "react";

import {
  CopyButton,
  ToolActions,
  ToolOutput,
  ToolPanel,
  ToolTextArea,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  hashText,
  identifyHashFormats,
  type TextHashAlgorithm,
} from "./hash";

const copy = {
  en: {
    title: "SHA / MD5 hashes",
    description: "Hash exact UTF-8 text and identify likely digest formats locally.",
    input: "Text and algorithm",
    text: "Text to hash",
    algorithm: "Algorithm",
    legacy: "legacy",
    digest: "Digest",
    empty: "The digest will appear here.",
    identify: "Identify digest",
    likely: "Likely formats",
    unknown: "No recognized hexadecimal digest length.",
    caveat: "Format identification is a length-based hint, not proof.",
    privacy: "Text and digests do not leave your browser.",
    reset: "Reset",
    copy: "Copy digest",
    copied: "Copied",
    copyFailed: "Copy failed",
    download: "Download digest",
  },
  vi: {
    title: "Băm SHA / MD5",
    description: "Băm chính xác văn bản UTF-8 và nhận diện định dạng digest cục bộ.",
    input: "Văn bản và thuật toán",
    text: "Văn bản cần băm",
    algorithm: "Thuật toán",
    legacy: "cũ",
    digest: "Digest",
    empty: "Digest sẽ hiện ở đây.",
    identify: "Nhận diện digest",
    likely: "Định dạng có thể",
    unknown: "Không nhận ra độ dài digest hex.",
    caveat: "Nhận diện chỉ dựa trên độ dài, không phải bằng chứng.",
    privacy: "Văn bản và digest không rời khỏi trình duyệt.",
    reset: "Đặt lại",
    copy: "Sao chép digest",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    download: "Tải digest",
  },
} as const;

export default function HashTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [text, setText] = useState("");
  const [algorithm, setAlgorithm] = useState<TextHashAlgorithm>("sha256");
  const [candidate, setCandidate] = useState("");
  const result = useMemo(() => {
    try {
      return { hash: hashText(algorithm, text), error: "" };
    } catch (cause) {
      return {
        hash: "",
        error: cause instanceof Error ? cause.message : String(cause),
      };
    }
  }, [algorithm, text]);
  const likely = identifyHashFormats(candidate);

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <ToolPanel title={t.input}>
          <ToolTextArea label={t.text} value={text} onChange={setText} rows={10} />
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.algorithm}
            <select aria-label={t.algorithm} value={algorithm} onChange={(event) => setAlgorithm(event.target.value as TextHashAlgorithm)} className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm">
              <option value="sha256">SHA-256</option>
              <option value="sha384">SHA-384</option>
              <option value="sha512">SHA-512</option>
              <option value="sha1">SHA-1 ({t.legacy})</option>
              <option value="md5">MD5 ({t.legacy})</option>
            </select>
          </label>
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.identify}
            <textarea aria-label={t.identify} value={candidate} onChange={(event) => setCandidate(event.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 font-mono text-xs" />
          </label>
          {candidate ? (
            <div className="mt-3">
              <p className="text-xs font-semibold text-[var(--vt-text-2)]">{t.likely}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {likely.length ? likely.map((format) => <span key={format} className="rounded-full border border-[var(--vt-border-2)] px-2 py-1 font-mono text-xs">{format}</span>) : <span className="text-xs text-[var(--vt-text-3)]">{t.unknown}</span>}
              </div>
              <p className="mt-2 text-xs text-[var(--vt-text-3)]">{t.caveat}</p>
            </div>
          ) : null}
          <p className="mt-4 text-xs text-[var(--vt-text-3)]">{t.privacy}</p>
          {result.error ? <p role="alert" className="mt-3 text-xs text-[var(--vt-red)]">{result.error}</p> : null}
          <ToolActions>
            <button type="button" onClick={() => { setText(""); setAlgorithm("sha256"); setCandidate(""); }} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold">{t.reset}</button>
          </ToolActions>
        </ToolPanel>
        <ToolPanel title={t.digest}>
          <ToolOutput label={t.digest} value={result.hash} emptyLabel={t.empty} />
          <ToolActions>
            <CopyButton value={result.hash} label={t.copy} copiedLabel={t.copied} failedLabel={t.copyFailed} />
            <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(`${result.hash}\n`)}`} download={`${algorithm}.txt`} className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]">{t.download}</a>
          </ToolActions>
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

