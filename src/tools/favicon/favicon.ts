export const FAVICON_OUTPUTS = [
  { size: 16, name: "favicon-16x16.png" },
  { size: 32, name: "favicon-32x32.png" },
  { size: 48, name: "favicon-48x48.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 192, name: "android-chrome-192x192.png" },
  { size: 512, name: "android-chrome-512x512.png" },
] as const;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function validateFaviconOptions(appName: string, themeColor: string) {
  const normalizedName = appName.trim();
  const normalizedColor = themeColor.trim().toLowerCase();
  if (!normalizedName) throw new Error("Application name is required.");
  if (normalizedName.length > 80) {
    throw new Error("Application name must be 80 characters or fewer.");
  }
  if (!HEX_COLOR.test(normalizedColor)) {
    throw new Error("Theme color must be a six-digit hex color.");
  }
  return { appName: normalizedName, themeColor: normalizedColor };
}

export function buildFaviconManifest(appName: string, themeColor: string) {
  const options = validateFaviconOptions(appName, themeColor);
  return `${JSON.stringify(
    {
      name: options.appName,
      short_name: options.appName,
      icons: [
        {
          src: "android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      theme_color: options.themeColor,
      background_color: options.themeColor,
      display: "standalone",
    },
    null,
    2,
  )}\n`;
}

export function buildBrowserConfig(themeColor: string) {
  const { themeColor: color } = validateFaviconOptions("browserconfig", themeColor);
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    "<browserconfig>",
    "  <msapplication>",
    "    <tile>",
    "      <square150x150logo src=\"android-chrome-192x192.png\"/>",
    `      <TileColor>${color}</TileColor>`,
    "    </tile>",
    "  </msapplication>",
    "</browserconfig>",
    "",
  ].join("\n");
}

export function buildFaviconHtml() {
  return [
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="manifest" href="/site.webmanifest">',
    '<meta name="msapplication-config" content="/browserconfig.xml">',
    "",
  ].join("\n");
}

export const FAVICON_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
export const MAX_FAVICON_SOURCE_BYTES = 20 * 1024 * 1024;

