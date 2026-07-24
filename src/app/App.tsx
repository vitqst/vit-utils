import * as Tooltip from "@radix-ui/react-tooltip";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { useLocalStorage } from "../hooks/useLocalStorage";
import { messages } from "../i18n";
import {
  groupCatalog,
  plannedToolCount,
  type ToolGroupCatalog,
} from "../registry/group-catalog";
import { getToolByPath, toolRegistry } from "../registry/tool-registry";
import type { Locale, ToolDefinition, ToolGroup } from "../registry/types";
import { CommandPalette } from "./CommandPalette";
import {
  ApertureIcon,
  ArrowIcon,
  SearchIcon,
  ShieldIcon,
  StarIcon,
} from "./icons";

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const syncPath = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setPathname(path);
    window.scrollTo({ top: 0 });
  }, []);

  return [pathname, navigate] as const;
}

const groupIconPaths: Record<ToolGroup, string> = {
  text: "M4 6h16M4 12h10M4 18h16",
  developer: "M9 6l-5 6 5 6M15 6l5 6-5 6",
  "date-time": "M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z",
  generators: "M12 3l2.3 6.2L21 11l-6.7 1.8L12 21l-2.3-8.2L3 11l6.7-1.8z",
  files: "M14 3H7v18h11V8zM14 3v5h5",
  security: "M12 3l7 3v6c0 4-3 7.2-7 9-4-1.8-7-5-7-9V6z",
  media: "M4 5h16v14H4zM4 16l4.5-4.5 3 3L16 10l4 4",
};

function GroupIcon({ group, className }: { group: ToolGroup; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={groupIconPaths[group]} />
    </svg>
  );
}

function DuckLogo() {
  return (
    <svg aria-hidden="true" width="27" height="30" viewBox="0 0 30 32">
      <path
        d="M20 8.5c0-2.5-2-4.5-4.6-4.5C12.6 4 11 6 11 8.2c0 .5.1 1 .2 1.4C8.7 10 6 12.4 6 16.2 6 21 10 25 16.5 25c5 0 8.5-2.6 8.5-6.4 0-2-1-3.4-2.6-4.3.9-.9 1.6-2.2 1.6-3.8 0-.7-.1-1.4-.4-2z"
        fill="var(--vt-accent)"
      />
      <circle cx="18.4" cy="9.2" r="1.35" fill="var(--vt-accent-ink)" />
      <path d="M20.5 10.8c1.8-.4 3.4.2 3.4.2s-1 1.5-2.7 1.4" fill="var(--vt-accent)" />
      <path
        d="M11 25l-1.5 3.2M15.5 25.4l-.4 3.4"
        stroke="var(--vt-accent)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface HeaderProps {
  locale: Locale;
  onLocale: () => void;
  onHome: () => void;
  onOpenPalette: () => void;
}

function Header({ locale, onLocale, onHome, onOpenPalette }: HeaderProps) {
  const t = messages[locale];
  const [dark, setDark] = useLocalStorage("vit.theme.dark", true);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  return (
    <header className="flex h-[52px] flex-none items-center gap-4 border-b border-[var(--vt-border)] bg-[var(--vt-bg-1)] px-4 text-[var(--vt-text)]">
      <button
        type="button"
        onClick={onHome}
        className="flex w-[115px] items-center gap-2 text-left"
      >
        <DuckLogo />
        <span className="font-mono text-[16px] font-bold leading-normal tracking-[-0.5px]">
          <span className="text-[var(--vt-accent)]">vịt</span>
          <span className="text-[var(--vt-text-2)]">·</span>tools
        </span>
      </button>

      <button
        type="button"
        onClick={onOpenPalette}
        className="hidden h-[34px] w-[440px] items-center gap-[9px] rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 text-left text-[13px] text-[var(--vt-text-3)] transition hover:border-[var(--vt-accent)] sm:flex"
      >
        <SearchIcon className="h-[15px] w-[15px] text-[var(--vt-text-3)]" />
        <span className="flex-1">{t.search}</span>
        <kbd className="rounded border border-[var(--vt-border)] bg-[var(--vt-bg-2)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--vt-text-2)]">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onLocale}
          aria-label={t.languageAction}
          className="h-[34px] w-[65px] rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-2)] px-1 font-mono text-[12px] font-semibold text-[var(--vt-text)] hover:border-[var(--vt-accent)]"
        >
          {locale.toUpperCase()} <span className="text-[var(--vt-text-3)]">→</span>
          {locale === "vi" ? "EN" : "VI"}
        </button>
        <button
          type="button"
          onClick={() => setDark((value) => !value)}
          aria-label={t.theme}
          className="grid h-[34px] w-[34px] place-items-center rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-2)] text-[var(--vt-text)] hover:border-[var(--vt-accent)]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d={
                dark
                  ? "M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5L19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5L19 5M12 8a4 4 0 100 8 4 4 0 000-8z"
                  : "M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"
              }
            />
          </svg>
        </button>
        <a
          href="https://github.com"
          aria-label={t.source}
          className="grid h-[34px] w-[34px] place-items-center rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-2)] text-[var(--vt-text)] hover:border-[var(--vt-accent)]"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49v-1.7c-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.49-1.11-1.49-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
}

interface SidebarProps {
  locale: Locale;
  favorites: string[];
  recent: string[];
  activeTool?: ToolDefinition;
  onNavigate: (path: string) => void;
}

function Sidebar({
  locale,
  favorites,
  recent,
  activeTool,
  onNavigate,
}: SidebarProps) {
  const t = messages[locale];
  const [expanded, setExpanded] = useState(
    new Set<ToolGroup>(["text", "developer", "date-time"]),
  );
  const favoriteTools = favorites
    .map((id) => toolRegistry.find((tool) => tool.id === id))
    .filter(isDefined);
  const recentTools = recent
    .map((id) => toolRegistry.find((tool) => tool.id === id))
    .filter(isDefined);

  useEffect(() => {
    if (!activeTool) return;
    setExpanded((current) => new Set([...current, activeTool.group]));
  }, [activeTool]);

  const toggleGroup = (group: ToolGroup) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const shortcuts = (label: string, tools: ToolDefinition[]) =>
    tools.length ? (
      <nav aria-label={label} className="mb-1 px-2">
        <p className="px-2 pb-1 pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--vt-text-3)]">
          {label}
        </p>
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onNavigate(tool.path)}
            className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-[var(--vt-text-2)] hover:bg-[var(--vt-bg-2)] hover:text-[var(--vt-text)]"
          >
            <ApertureIcon className="h-3.5 w-3.5 text-[var(--vt-accent)]" />
            <span className="truncate">{tool.name[locale]}</span>
          </button>
        ))}
      </nav>
    ) : null;

  return (
    <aside className="hidden w-[262px] flex-none flex-col border-r border-[var(--vt-border)] bg-[var(--vt-bg-1)] lg:flex">
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {shortcuts(t.favorites, favoriteTools)}
        {shortcuts(t.recent, recentTools)}
        {groupCatalog.map((group) => {
          const open = expanded.has(group.id);
          return (
            <section key={group.id} className="mb-0.5">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={open}
                className="flex h-[30px] w-full items-center gap-[9px] rounded-md px-2 text-left text-[13px] font-semibold text-[var(--vt-text)] hover:bg-[var(--vt-bg-2)]"
              >
                <GroupIcon group={group.id} className="h-4 w-4 flex-none text-[var(--vt-accent)]" />
                <span className="flex-1 truncate">{group.name[locale]}</span>
                <span className="font-mono text-[11px] font-medium text-[var(--vt-text-3)]">
                  {group.tools.length}
                </span>
                <span className="w-3 text-center text-[10px] text-[var(--vt-text-3)]">
                  {open ? "⌄" : "›"}
                </span>
              </button>
              {open ? (
                <div className="ml-[15px] border-l border-[var(--vt-border)] py-1 pl-2">
                  {group.tools.map((catalogTool) => {
                    const ready = catalogTool.status === "ready";
                    const active = activeTool?.id === catalogTool.id;
                    return (
                      <button
                        key={catalogTool.id}
                        type="button"
                        disabled={!ready}
                        title={ready ? undefined : t.planned}
                        onClick={() => ready && onNavigate("/tools/photo-cure")}
                        className={`flex h-[27px] w-full items-center rounded-md px-2 text-left text-[12.5px] ${
                          active
                            ? "bg-[var(--vt-bg-2)] font-semibold text-[var(--vt-accent)]"
                            : ready
                              ? "text-[var(--vt-text-2)] hover:bg-[var(--vt-bg-2)]"
                              : "cursor-default text-[var(--vt-text-3)]"
                        }`}
                      >
                        <span className="flex-1 truncate">
                          {catalogTool.name[locale]}
                        </span>
                        {ready ? (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-[var(--vt-green)]"
                            title="ready"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}
        <div className="m-2 mt-4 min-h-[73px] rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-1)] px-3 py-2.5">
          <p className="flex items-center gap-[7px] font-mono text-[11px] font-semibold text-[var(--vt-green)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--vt-green)]" />
            {t.externalRequests}: <b>0</b>
          </p>
          <p className="mt-[5px] max-w-[180px] text-[11px] leading-[1.5] text-[var(--vt-text-3)]">
            {t.verifyNetwork}
          </p>
        </div>
      </div>
    </aside>
  );
}

const proofCopy = {
  en: [
    ["No uploads", "Files and text are processed in your browser and sent nowhere."],
    ["No tracking", "No analytics cookies, fingerprinting, or server-side logs."],
    ["No ads", "A focused interface with no banners or interrupting popups."],
    ["Verifiable", "Every tool page makes zero external requests. Open DevTools and see."],
  ],
  vi: [
    ["Không upload", "Tệp và văn bản được xử lý ngay trong trình duyệt, không gửi đi đâu cả."],
    ["Không theo dõi", "Không cookie phân tích, không fingerprint, không log phía server."],
    ["Không quảng cáo", "Giao diện gọn, tập trung vào việc — không banner, không popup."],
    ["Kiểm chứng được", "Mỗi trang công cụ: 0 request ra ngoài. Mở DevTools là thấy ngay."],
  ],
} as const;

const proofIcons = [
  "M12 19V6M5 12l7-7 7 7",
  "M17.94 17.94A10 10 0 016 6m2 2a10 10 0 0114 8M1 1l22 22",
  "M18 6L6 18M6 6l12 12",
  "M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z",
];

interface HomePageProps {
  locale: Locale;
  favorites: string[];
  onNavigate: (path: string) => void;
  onFavorite: (toolId: string) => void;
  onOpenPalette: () => void;
}

function GroupCard({
  group,
  locale,
  favorite,
  onNavigate,
  onFavorite,
}: {
  group: ToolGroupCatalog;
  locale: Locale;
  favorite: boolean;
  onNavigate: (path: string) => void;
  onFavorite: (toolId: string) => void;
}) {
  const t = messages[locale];
  const readyTool = group.tools.find((tool) => tool.status === "ready");
  const tall = group.id === "files" || group.id === "security";
  const cardHeight = tall ? "min-h-[121px]" : "min-h-[101px]";
  const content = (
    <>
      <div className="mb-2.5 flex items-center gap-[11px]">
        <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-[var(--vt-border)] bg-[var(--vt-bg-0)] text-[var(--vt-accent)]">
          <GroupIcon group={group.id} className="h-[18px] w-[18px]" />
        </span>
        <h3 className="flex-1 text-[15px] font-semibold text-[var(--vt-text)]">
          {group.name[locale]}
        </h3>
        <span className="font-mono text-[11px] font-medium text-[var(--vt-text-3)]">
          {group.tools.length}
        </span>
        <ArrowIcon className="h-3.5 w-3.5 text-[var(--vt-text-3)]" />
      </div>
      <p className="text-[12.5px] leading-[1.55] text-[var(--vt-text-2)]">
        {group.tools
          .slice(0, 4)
          .map((tool) => tool.name[locale])
          .join(" · ")}
      </p>
    </>
  );

  return (
    <article className="relative">
      <a
        href={readyTool ? "/tools/photo-cure" : `/groups/${group.id}`}
        onClick={(event) => {
          event.preventDefault();
          onNavigate(readyTool ? "/tools/photo-cure" : `/groups/${group.id}`);
        }}
        className={`block h-full rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] px-5 py-[18px] transition hover:-translate-y-px hover:border-[var(--vt-accent)] ${cardHeight}`}
      >
        {content}
      </a>
      {readyTool ? (
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => onFavorite(readyTool.id)}
              aria-label={favorite ? t.removeFavorite : t.addFavorite}
              className="absolute right-11 top-[17px] grid h-8 w-8 place-items-center rounded-md text-[var(--vt-text-3)] hover:bg-[var(--vt-bg-2)] hover:text-[var(--vt-accent)]"
            >
              <StarIcon filled={favorite} className="h-4 w-4" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              sideOffset={5}
              className="z-50 rounded bg-[var(--vt-bg-3)] px-2 py-1 text-[10px] text-[var(--vt-text)]"
            >
              {favorite ? t.removeFavorite : t.addFavorite}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      ) : null}
    </article>
  );
}

function HomePage({
  locale,
  favorites,
  onNavigate,
  onFavorite,
  onOpenPalette,
}: HomePageProps) {
  const t = messages[locale];

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[var(--vt-bg-0)]">
      <div className="mx-auto w-full max-w-[1040px] px-10 pb-16 pt-14 max-sm:px-5 max-sm:pt-9">
        <div className="mb-[22px] flex w-fit items-center gap-[7px] rounded-full border border-[var(--vt-border)] bg-[var(--vt-bg-1)] px-3 py-[5px] font-mono text-[11px] font-semibold leading-[13px] text-[var(--vt-green)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--vt-green)]" />
          {t.privacyPromise}
        </div>
        <h1 className="max-w-[462px] text-balance text-[44px] font-bold leading-[1.08] tracking-[-1.2px] text-[var(--vt-text)] max-sm:text-[36px]">
          {t.tagline}
        </h1>
        <p className="mb-[30px] mt-[18px] max-w-[644px] text-[17px] leading-[1.6] text-[var(--vt-text-2)]">
          {t.intro}
        </p>
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label={`${t.paletteTitle} ${t.search}`}
          className="mb-10 flex h-[52px] w-full max-w-[540px] items-center gap-[11px] rounded-xl border border-[var(--vt-border-2)] bg-[var(--vt-bg-1)] px-[18px] text-left text-[15px] text-[var(--vt-text-2)] hover:border-[var(--vt-accent)]"
        >
          <SearchIcon className="h-[18px] w-[18px]" />
          <span className="flex-1">
            {locale === "vi"
              ? "Mở bảng lệnh để tìm công cụ…"
              : "Open the command palette to find a tool…"}
          </span>
          <kbd className="rounded-md border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-2 py-[3px] font-mono text-[12px] font-semibold">
            ⌘K
          </kbd>
        </button>

        <section className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {proofCopy[locale].map(([title, body], index) => (
            <article
              key={title}
              className="min-h-36 rounded-[10px] border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4"
            >
              <svg
                aria-hidden="true"
                className="mb-2.5 h-5 w-5 text-[var(--vt-accent)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={proofIcons[index]} />
              </svg>
              <h2 className="mt-2.5 text-[14px] font-semibold text-[var(--vt-text)]">{title}</h2>
              <p className="mt-1 text-[12.5px] leading-[1.5] text-[var(--vt-text-2)]">{body}</p>
            </article>
          ))}
        </section>

        <div className="mb-4 flex items-baseline">
          <h2 className="text-[20px] font-semibold leading-[23px] text-[var(--vt-text)]">
            {t.groupHeading}
          </h2>
          <span className="ml-auto font-mono text-[12px] font-medium text-[var(--vt-text-3)]">
            {plannedToolCount} {t.toolsCount}
          </span>
        </div>
        <section className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
          {groupCatalog.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              locale={locale}
              favorite={favorites.includes("photo-cure")}
              onNavigate={onNavigate}
              onFavorite={onFavorite}
            />
          ))}
        </section>

        <section className="mt-11 flex items-center gap-[18px] rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] px-6 py-[22px]">
          <span className="grid h-[26px] w-[26px] place-items-center text-[var(--vt-accent)]">
            ✓
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold leading-[18px] text-[var(--vt-text)]">
              {locale === "vi"
                ? "Mã nguồn mở — chạy được ở máy bạn"
                : "Open source — runs on your machine"}
            </h2>
            <p className="mt-[3px] text-[13px] leading-5 text-[var(--vt-text-2)]">
              {locale === "vi"
                ? "Triển khai bằng Firebase Hosting, không backend. Xem mã, tự host, hoặc chạy offline tùy thích."
                : "Deployed on Firebase Hosting with no backend. Inspect it, self-host it, or run offline."}
            </p>
          </div>
          <a
            href="https://github.com"
            className="rounded-lg border border-[var(--vt-border-2)] bg-[var(--vt-bg-1)] px-4 py-[9px] text-[13px] font-semibold leading-[15px] text-[var(--vt-accent)] hover:border-[var(--vt-accent)]"
          >
            {t.source}
          </a>
        </section>
      </div>
    </main>
  );
}

function GroupPage({
  group,
  locale,
  onNavigate,
}: {
  group: ToolGroupCatalog;
  locale: Locale;
  onNavigate: (path: string) => void;
}) {
  const t = messages[locale];

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[var(--vt-bg-0)]">
      <div className="mx-auto w-full max-w-[960px] px-10 pb-16 pt-12 max-sm:px-5 max-sm:pt-8">
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="mb-8 text-[12px] font-semibold text-[var(--vt-text-2)] hover:text-[var(--vt-accent)]"
        >
          ← {t.allTools}
        </button>
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] text-[var(--vt-accent)]">
            <GroupIcon group={group.id} className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-[32px] font-bold tracking-[-0.7px] text-[var(--vt-text)]">
              {group.name[locale]}
            </h1>
            <p className="mt-1 font-mono text-[11px] text-[var(--vt-text-3)]">
              {group.tools.length} {t.toolsCount}
            </p>
          </div>
        </div>

        <section className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {group.tools.map((catalogTool) => {
            const readyTool = toolRegistry.find((tool) => tool.id === catalogTool.id);
            const content = (
              <>
                <span className="text-[14px] font-semibold text-[var(--vt-text)]">
                  {catalogTool.name[locale]}
                </span>
                <span
                  className={`ml-auto rounded-full border px-2 py-1 font-mono text-[9px] font-semibold ${
                    readyTool
                      ? "border-[var(--vt-green)]/30 text-[var(--vt-green)]"
                      : "border-[var(--vt-border)] text-[var(--vt-text-3)]"
                  }`}
                >
                  {readyTool ? t.offlineReady : t.planned}
                </span>
              </>
            );

            return readyTool ? (
              <a
                key={catalogTool.id}
                href={readyTool.path}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(readyTool.path);
                }}
                className="flex min-h-16 items-center rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] px-4 transition hover:border-[var(--vt-accent)]"
              >
                {content}
              </a>
            ) : (
              <article
                key={catalogTool.id}
                className="flex min-h-16 items-center rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] px-4"
              >
                {content}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function ToolPage({
  tool,
  locale,
  onNavigate,
}: {
  tool: ToolDefinition;
  locale: Locale;
  onNavigate: (path: string) => void;
}) {
  const t = messages[locale];
  const Tool = useMemo(() => lazy(tool.load), [tool]);

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--vt-bg-1)]">
      <div className="flex h-[46px] flex-none items-center gap-3 border-b border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-4">
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="text-[11px] font-semibold text-[var(--vt-text-2)] hover:text-[var(--vt-accent)]"
        >
          ← {t.back}
        </button>
        <span className="h-4 w-px bg-[var(--vt-border)]" />
        <span className="text-[11px] font-semibold text-[var(--vt-text)]">
          {tool.name[locale]}
        </span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-[var(--vt-border)] bg-[var(--vt-bg-1)] px-2.5 py-1 font-mono text-[9px] font-semibold text-[var(--vt-green)]">
          <ShieldIcon className="h-3 w-3" />
          {t.localOnly}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <Suspense
          fallback={
            <div className="grid h-full place-items-center font-mono text-[11px] text-[var(--vt-text-2)]">
              {t.loading}
            </div>
          }
        >
          <Tool />
        </Suspense>
      </div>
    </main>
  );
}

function NotFound({
  locale,
  onNavigate,
}: {
  locale: Locale;
  onNavigate: (path: string) => void;
}) {
  return (
    <main className="grid flex-1 place-items-center bg-[var(--vt-bg-0)]">
      <div className="text-center">
        <p className="font-mono text-xs text-[var(--vt-accent)]">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--vt-text)]">Tool not found</h1>
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="mt-5 rounded-lg bg-[var(--vt-accent)] px-4 py-2 text-xs font-semibold text-[var(--vt-accent-ink)]"
        >
          {messages[locale].back}
        </button>
      </div>
    </main>
  );
}

export default function App() {
  const [pathname, navigate] = usePathname();
  const [locale, setLocale] = useLocalStorage<Locale>("vit.locale", "vi");
  const [favorites, setFavorites] = useLocalStorage<string[]>("vit.favorites", []);
  const [recent, setRecent] = useLocalStorage<string[]>("vit.recent", []);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const routePath = pathname.replace(/\/+$/, "") || "/";
  const tool = getToolByPath(routePath);
  const group = groupCatalog.find(
    (candidate) => routePath === `/groups/${candidate.id}`,
  );
  const t = messages[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const openPalette = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", openPalette);
    return () => window.removeEventListener("keydown", openPalette);
  }, []);

  useEffect(() => {
    if (!tool) return;
    setRecent((current) => [tool.id, ...current.filter((id) => id !== tool.id)].slice(0, 8));
  }, [setRecent, tool]);

  const toggleFavorite = (toolId: string) => {
    setFavorites((current) =>
      current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId],
    );
  };

  return (
    <Tooltip.Provider delayDuration={250}>
      <div className="flex h-screen flex-col overflow-hidden bg-[var(--vt-bg-1)]">
        <Header
          locale={locale}
          onLocale={() => setLocale(locale === "vi" ? "en" : "vi")}
          onHome={() => navigate("/")}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <div className="flex min-h-0 flex-1">
          <Sidebar
            locale={locale}
            favorites={favorites}
            recent={recent}
            activeTool={tool}
            onNavigate={navigate}
          />
          {routePath === "/" ? (
            <HomePage
              locale={locale}
              favorites={favorites}
              onNavigate={navigate}
              onFavorite={toggleFavorite}
              onOpenPalette={() => setPaletteOpen(true)}
            />
          ) : group ? (
            <GroupPage group={group} locale={locale} onNavigate={navigate} />
          ) : tool ? (
            <ToolPage tool={tool} locale={locale} onNavigate={navigate} />
          ) : (
            <NotFound locale={locale} onNavigate={navigate} />
          )}
        </div>
        <CommandPalette
          locale={locale}
          messages={t}
          open={paletteOpen}
          tools={toolRegistry}
          onClose={() => setPaletteOpen(false)}
          onNavigate={navigate}
        />
      </div>
    </Tooltip.Provider>
  );
}
