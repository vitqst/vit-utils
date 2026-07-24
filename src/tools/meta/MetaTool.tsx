import { useMemo, useState } from "react";

import {
  CopyButton,
  ToolOutput,
  ToolPanel,
  ToolTextArea,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import { generateMetaTags, type MetaInput } from "./meta";

const copy = {
  en: {
    title: "Meta tags & OG preview",
    description:
      "Build escaped page metadata and preview a social card locally without fetching its image.",
    fields: "Page metadata",
    pageTitle: "Page title",
    descriptionLabel: "Description",
    url: "Canonical URL",
    image: "Image URL",
    siteName: "Site name",
    type: "Open Graph type",
    locale: "Content locale",
    robots: "Robots",
    twitter: "Twitter card",
    preview: "Social card preview",
    noImage: "No image URL",
    noFetch: "This local preview does not fetch the image URL.",
    characters: "characters",
    output: "Generated meta tags",
    empty: "Generated tags appear here.",
    copy: "Copy tags",
    copied: "Copied",
    copyFailed: "Copy failed",
    download: "Download HTML",
  },
  vi: {
    title: "Meta tags & OG preview",
    description:
      "Tạo metadata trang đã escape và xem trước thẻ mạng xã hội cục bộ mà không tải ảnh.",
    fields: "Metadata trang",
    pageTitle: "Tiêu đề trang",
    descriptionLabel: "Mô tả",
    url: "URL chính tắc",
    image: "URL ảnh",
    siteName: "Tên trang",
    type: "Loại Open Graph",
    locale: "Ngôn ngữ nội dung",
    robots: "Robots",
    twitter: "Thẻ Twitter",
    preview: "Xem trước thẻ mạng xã hội",
    noImage: "Chưa có URL ảnh",
    noFetch: "Bản xem trước cục bộ không tải URL ảnh.",
    characters: "ký tự",
    output: "Meta tags đã tạo",
    empty: "Tags đã tạo sẽ hiện ở đây.",
    copy: "Sao chép tags",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    download: "Tải HTML",
  },
} as const;

export default function MetaTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [value, setValue] = useState<MetaInput>({
    title: "Vịt Tools",
    description: "Small, private browser tools.",
    url: "",
    image: "",
    siteName: "Vịt Tools",
    type: "website",
    locale: locale === "vi" ? "vi_VN" : "en_US",
    robots: "index,follow",
    twitterCard: "summary_large_image",
  });
  const result = useMemo(() => {
    try {
      return { output: generateMetaTags(value), error: "" };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [value]);

  const update = (key: keyof MetaInput, next: string) =>
    setValue((current) => ({ ...current, [key]: next }));
  const field = (key: keyof MetaInput, label: string) => (
    <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
      {label}
      <input
        aria-label={label}
        value={value[key]}
        onChange={(event) => update(key, event.target.value)}
        className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
      />
    </label>
  );

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[380px_1fr]">
        <ToolPanel title={t.fields}>
          {field("title", t.pageTitle)}
          <p className="mt-1 text-right text-xs text-[var(--vt-text-3)]">
            {value.title.length} {t.characters}
          </p>
          <div className="mt-3">
            <ToolTextArea
              label={t.descriptionLabel}
              value={value.description}
              onChange={(next) => update("description", next)}
              rows={4}
            />
          </div>
          <p className="mt-1 text-right text-xs text-[var(--vt-text-3)]">
            {value.description.length} {t.characters}
          </p>
          <div className="mt-3 space-y-3">
            {field("url", t.url)}
            {field("image", t.image)}
            {field("siteName", t.siteName)}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.type}
              <select
                aria-label={t.type}
                value={value.type}
                onChange={(event) => update("type", event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
              >
                <option value="website">website</option>
                <option value="article">article</option>
                <option value="profile">profile</option>
                <option value="product">product</option>
              </select>
            </label>
            {field("locale", t.locale)}
            {field("robots", t.robots)}
            <label className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.twitter}
              <select
                aria-label={t.twitter}
                value={value.twitterCard}
                onChange={(event) => update("twitterCard", event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
              >
                <option value="summary_large_image">summary_large_image</option>
                <option value="summary">summary</option>
              </select>
            </label>
          </div>
        </ToolPanel>
        <div className="space-y-4">
          <ToolPanel title={t.preview}>
            <section
              aria-label={t.preview}
              className="overflow-hidden rounded-xl border border-[var(--vt-border-2)] bg-[var(--vt-bg-0)]"
            >
              <div className="flex min-h-40 items-center justify-center bg-[var(--vt-bg-2)] p-4 text-center font-mono text-xs text-[var(--vt-text-3)]">
                {value.image || t.noImage}
              </div>
              <div className="p-4">
                <p className="text-xs uppercase text-[var(--vt-text-3)]">
                  {value.siteName || value.url || "example.com"}
                </p>
                <p className="mt-1 font-semibold text-[var(--vt-text)]">
                  {value.title}
                </p>
                <p className="mt-1 text-sm text-[var(--vt-text-2)]">
                  {value.description}
                </p>
              </div>
            </section>
            <p className="mt-2 text-xs text-[var(--vt-text-3)]">{t.noFetch}</p>
          </ToolPanel>
          <ToolPanel title={t.output}>
            {result.error ? (
              <p role="alert" className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 text-xs text-[var(--vt-red)]">
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
              {result.output ? (
                <a
                  href={`data:text/html;charset=utf-8,${encodeURIComponent(result.output)}`}
                  download="meta-tags.html"
                  className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]"
                >
                  {t.download}
                </a>
              ) : null}
            </div>
          </ToolPanel>
        </div>
      </div>
    </ToolWorkspace>
  );
}

