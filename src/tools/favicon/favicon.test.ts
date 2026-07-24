import { describe, expect, it } from "vitest";

import {
  FAVICON_OUTPUTS,
  buildBrowserConfig,
  buildFaviconHtml,
  buildFaviconManifest,
  validateFaviconOptions,
} from "./favicon";

describe("favicon package helpers", () => {
  it("defines the complete icon file set", () => {
    expect(FAVICON_OUTPUTS).toEqual([
      { size: 16, name: "favicon-16x16.png" },
      { size: 32, name: "favicon-32x32.png" },
      { size: 48, name: "favicon-48x48.png" },
      { size: 180, name: "apple-touch-icon.png" },
      { size: 192, name: "android-chrome-192x192.png" },
      { size: 512, name: "android-chrome-512x512.png" },
    ]);
  });

  it("builds valid manifest, browser config, and link markup", () => {
    expect(JSON.parse(buildFaviconManifest("Vịt Tools", "#6d5dfc"))).toMatchObject({
      name: "Vịt Tools",
      short_name: "Vịt Tools",
      theme_color: "#6d5dfc",
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
    });
    expect(buildBrowserConfig("#6d5dfc")).toContain(
      "<TileColor>#6d5dfc</TileColor>",
    );
    expect(buildFaviconHtml()).toContain(
      'rel="apple-touch-icon" sizes="180x180"',
    );
    expect(buildFaviconHtml()).toContain('href="/site.webmanifest"');
  });

  it("escapes XML and validates required options", () => {
    expect(buildFaviconManifest('A "quoted" app', "#ABCDEF")).toContain(
      'A \\"quoted\\" app',
    );
    expect(() => buildFaviconManifest("", "#abcdef")).toThrow(/name/i);
    expect(() => buildBrowserConfig("red")).toThrow(/color/i);
    expect(validateFaviconOptions(" App ", "#ABCDEF")).toEqual({
      appName: "App",
      themeColor: "#abcdef",
    });
  });
});

