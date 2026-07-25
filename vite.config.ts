import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { defineConfig } from "vitest/config";

import { groupCatalog } from "./src/registry/group-catalog";
import { toolCatalog } from "./src/registry/tool-catalog";

function registryArtifacts() {
  return {
    name: "registry-artifacts",
    apply: "build" as const,
    async closeBundle() {
      const baseUrl = (process.env.VIT_SITE_URL ?? "https://vit.tools").replace(/\/+$/, "");
      const groupPaths = groupCatalog.map((group) => `/groups/${group.id}`);
      const urls = ["/", ...groupPaths, ...toolCatalog.map((tool) => tool.path)];
      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map((path) => `  <url><loc>${baseUrl}${path}</loc></url>`),
        "</urlset>",
        "",
      ].join("\n");

      await mkdir("dist", { recursive: true });
      await writeFile("dist/sitemap.xml", xml, "utf8");

      const appShell = await readFile("dist/index.html", "utf8");
      await Promise.all(
        toolCatalog.map(async (tool) => {
          const routeDirectory = `dist${tool.path}`;
          const title = `${tool.name.en} — private browser tool | vit.tools`;
          const staticPage = appShell
            .replace(
              /<title>.*?<\/title>/,
              `<title>${escapeHtml(title)}</title>`,
            )
            .replace(
              /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
              `<meta name="description" content="${escapeHtml(tool.description.en)}" />`,
            )
            .replace(
              "</head>",
              `    <link rel="canonical" href="${baseUrl}${tool.path}" />\n  </head>`,
            );

          await mkdir(routeDirectory, { recursive: true });
          await writeFile(`${routeDirectory}/index.html`, staticPage, "utf8");
        }),
      );

      await Promise.all(
        groupCatalog.map(async (group) => {
          const path = `/groups/${group.id}`;
          const routeDirectory = `dist${path}`;
          const title = `${group.name.en} tools — private browser tools | vit.tools`;
          const description = `${group.tools.length} ${group.name.en.toLocaleLowerCase()} utilities that run in your browser.`;
          const staticPage = appShell
            .replace(
              /<title>.*?<\/title>/,
              `<title>${escapeHtml(title)}</title>`,
            )
            .replace(
              /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
              `<meta name="description" content="${escapeHtml(description)}" />`,
            )
            .replace(
              "</head>",
              `    <link rel="canonical" href="${baseUrl}${path}" />\n  </head>`,
            );

          await mkdir(routeDirectory, { recursive: true });
          await writeFile(`${routeDirectory}/index.html`, staticPage, "utf8");
        }),
      );
    },
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export default defineConfig({
  plugins: [react(), tailwindcss(), registryArtifacts()],
  test: {
    environment: "jsdom",
    globals: true,
    restoreMocks: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
