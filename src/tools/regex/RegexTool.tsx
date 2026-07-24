import { useMemo, useState } from "react";

import {
  ToolGrid,
  ToolPanel,
  ToolTextArea,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { testRegex } from "./regex";

const copy = {
  en: {
    title: "Regex tester",
    description:
      "Test JavaScript regular expressions with match offsets and capture groups. Complex patterns can still run slowly.",
    pattern: "Pattern",
    text: "Test text",
    matches: "Matches",
    placeholder: "Enter text to test…",
    noMatches: "No matches.",
    emptyMatch: "(empty match)",
    capture: "Capture",
    named: "Named",
    flags: {
      g: "Global",
      i: "Case-insensitive",
      m: "Multiline",
      s: "Dot matches newline",
      u: "Unicode",
    },
  },
  vi: {
    title: "Kiểm thử Regex",
    description:
      "Kiểm thử biểu thức chính quy JavaScript với vị trí và nhóm bắt. Mẫu phức tạp vẫn có thể chạy chậm.",
    pattern: "Mẫu Regex",
    text: "Văn bản kiểm thử",
    matches: "Kết quả khớp",
    placeholder: "Nhập văn bản cần kiểm thử…",
    noMatches: "Không có kết quả khớp.",
    emptyMatch: "(kết quả rỗng)",
    capture: "Nhóm",
    named: "Nhóm tên",
    flags: {
      g: "Toàn bộ",
      i: "Không phân biệt hoa thường",
      m: "Nhiều dòng",
      s: "Dấu chấm khớp xuống dòng",
      u: "Unicode",
    },
  },
} as const;

const flagNames = ["g", "i", "m", "s", "u"] as const;

export default function RegexTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [pattern, setPattern] = useState("");
  const [text, setText] = useState("");
  const [flags, setFlags] = useState(() => new Set<string>(["g"]));
  const flagString = flagNames.filter((flag) => flags.has(flag)).join("");
  const result = useMemo(
    () => testRegex(pattern, text, flagString),
    [flagString, pattern, text],
  );

  const toggleFlag = (flag: string, checked: boolean) => {
    setFlags((current) => {
      const next = new Set(current);
      if (checked) next.add(flag);
      else next.delete(flag);
      return next;
    });
  };

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
        <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
          {t.pattern}
          <div className="mt-1.5 flex items-center rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] focus-within:border-[var(--vt-accent)]">
            <span className="pl-3 font-mono text-[var(--vt-text-3)]">/</span>
            <input
              aria-label={t.pattern}
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              className="h-10 min-w-0 flex-1 bg-transparent px-2 font-mono text-sm text-[var(--vt-text)] outline-none"
            />
            <span className="pr-3 font-mono text-[var(--vt-text-3)]">
              /{flagString}
            </span>
          </div>
        </label>
        <fieldset className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          <legend className="sr-only">Flags</legend>
          {flagNames.map((flag) => (
            <label
              key={flag}
              className="flex items-center gap-2 text-xs text-[var(--vt-text-2)]"
            >
              <input
                type="checkbox"
                aria-label={t.flags[flag]}
                checked={flags.has(flag)}
                onChange={(event) => toggleFlag(flag, event.target.checked)}
              />
              <code className="text-[var(--vt-accent)]">{flag}</code>
              {t.flags[flag]}
            </label>
          ))}
        </fieldset>
      </div>
      <ToolGrid>
        <ToolPanel title={t.text}>
          <ToolTextArea
            label={t.text}
            value={text}
            onChange={setText}
            placeholder={t.placeholder}
          />
        </ToolPanel>
        <section
          aria-label={t.matches}
          className="min-w-0 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4"
        >
          <h2 className="mb-3 text-sm font-semibold text-[var(--vt-text)]">
            {result.error
              ? t.matches
              : `${result.matches.length} ${t.matches.toLocaleLowerCase(locale)}`}
          </h2>
          {result.error ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs text-[var(--vt-red)]"
            >
              {result.error}
            </p>
          ) : result.matches.length ? (
            <ol className="space-y-2">
              {result.matches.map((match, index) => (
                <li
                  key={`${match.index}-${index}`}
                  className="rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] p-3"
                >
                  <div className="flex items-start gap-3">
                    <code className="min-w-0 flex-1 break-all text-sm text-[var(--vt-accent)]">
                      {match.value || t.emptyMatch}
                    </code>
                    <span className="font-mono text-[10px] text-[var(--vt-text-3)]">
                      {match.index}–{match.end}
                    </span>
                  </div>
                  {match.groups.length ? (
                    <ul className="mt-2 space-y-1 text-xs text-[var(--vt-text-2)]">
                      {match.groups.map((group, groupIndex) => (
                        <li key={groupIndex}>
                          {t.capture} {groupIndex + 1}:{" "}
                          <code>{group ?? "undefined"}</code>
                        </li>
                      ))}
                      {Object.entries(match.namedGroups).map(([name, value]) => (
                        <li key={name}>
                          {t.named} {name}: <code>{value ?? "undefined"}</code>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-[var(--vt-text-3)]">{t.noMatches}</p>
          )}
        </section>
      </ToolGrid>
    </ToolWorkspace>
  );
}
