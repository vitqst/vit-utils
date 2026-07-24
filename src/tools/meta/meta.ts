export interface MetaInput {
  title: string;
  description: string;
  url: string;
  image: string;
  siteName: string;
  type: string;
  locale: string;
  robots: string;
  twitterCard: string;
}

function assertHttpUrl(value: string, label: string) {
  if (!value) return;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute HTTP or HTTPS URL.`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${label} must be an absolute HTTP or HTTPS URL.`);
  }
}

export function validateMetaInput(input: MetaInput) {
  if (!input.title.trim()) throw new Error("Page title is required.");
  if (input.title.length > 300) throw new Error("Page title is too long.");
  if (input.description.length > 1000) {
    throw new Error("Meta description cannot exceed 1,000 characters.");
  }
  assertHttpUrl(input.url, "Canonical URL");
  assertHttpUrl(input.image, "Image URL");
  return input;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function meta(attribute: "name" | "property", key: string, value: string) {
  return `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(value)}">`;
}

export function generateMetaTags(input: MetaInput) {
  const value = validateMetaInput(input);
  const lines = [
    `<title>${escapeHtml(value.title.trim())}</title>`,
    ...(value.description
      ? [meta("name", "description", value.description)]
      : []),
    ...(value.robots ? [meta("name", "robots", value.robots)] : []),
    ...(value.url
      ? [`<link rel="canonical" href="${escapeHtml(value.url)}">`]
      : []),
    meta("property", "og:title", value.title.trim()),
    ...(value.description
      ? [meta("property", "og:description", value.description)]
      : []),
    ...(value.url ? [meta("property", "og:url", value.url)] : []),
    ...(value.image ? [meta("property", "og:image", value.image)] : []),
    ...(value.siteName
      ? [meta("property", "og:site_name", value.siteName)]
      : []),
    ...(value.type ? [meta("property", "og:type", value.type)] : []),
    ...(value.locale ? [meta("property", "og:locale", value.locale)] : []),
    ...(value.twitterCard
      ? [meta("name", "twitter:card", value.twitterCard)]
      : []),
    meta("name", "twitter:title", value.title.trim()),
    ...(value.description
      ? [meta("name", "twitter:description", value.description)]
      : []),
    ...(value.image ? [meta("name", "twitter:image", value.image)] : []),
  ];
  return lines.join("\n");
}

