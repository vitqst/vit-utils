import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Messages } from "../i18n";
import type { Locale, ToolDefinition } from "../registry/types";
import { ApertureIcon, SearchIcon } from "./icons";

interface CommandPaletteProps {
  locale: Locale;
  messages: Messages;
  open: boolean;
  tools: readonly ToolDefinition[];
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function CommandPalette({
  locale,
  messages,
  open,
  tools,
  onClose,
  onNavigate,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    if (!needle) return tools;
    return tools.filter((tool) =>
      [tool.name[locale], tool.description[locale], ...tool.keywords[locale]]
        .join(" ")
        .toLocaleLowerCase(locale)
        .includes(needle),
    );
  }, [locale, query, tools]);

  return (
    <Dialog
      initialFocus={inputRef}
      open={open}
      onClose={onClose}
      className="relative z-[100]"
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-start justify-center p-4 pt-[12vh]">
        <DialogPanel className="w-full max-w-[600px] overflow-hidden rounded-[14px] border border-[var(--vt-border-2)] bg-[var(--vt-bg-1)] shadow-2xl">
          <DialogTitle className="sr-only">{messages.paletteTitle}</DialogTitle>
          <div className="flex items-center gap-3 border-b border-[var(--vt-border)] px-4">
            <SearchIcon className="h-5 w-5 text-[var(--vt-text-3)]" />
            <input
              ref={inputRef}
              role="combobox"
              aria-label={messages.search}
              aria-expanded="true"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={messages.paletteHint}
              className="h-14 flex-1 bg-transparent text-[16px] text-[var(--vt-text)] outline-none placeholder:text-[var(--vt-text-3)]"
            />
            <kbd className="rounded border border-[var(--vt-border)] px-2 py-1 font-mono text-[10px] text-[var(--vt-text-3)]">
              ESC
            </kbd>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {matches.length ? (
              matches.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    onNavigate(tool.path);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-[9px] px-3 py-3 text-left hover:bg-[var(--vt-bg-2)]"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--vt-border-2)] bg-[var(--vt-bg-2)] text-[var(--vt-accent)]">
                    <ApertureIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[var(--vt-text)]">
                      {tool.name[locale]}
                    </span>
                    <span className="block text-xs text-[var(--vt-text-3)]">
                      {messages.groups[tool.group]}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-10 text-center text-sm text-[var(--vt-text-3)]">
                {messages.noResults}
              </p>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
