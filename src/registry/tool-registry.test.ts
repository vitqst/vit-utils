import { describe, expect, it } from "vitest";

import { groupCatalog, plannedToolCount } from "./group-catalog";
import { toolCatalog } from "./tool-catalog";
import { getToolByPath, toolRegistry } from "./tool-registry";

describe("tool registry", () => {
  const advertisedIds = [
    "case-convert",
    "slugify",
    "diff",
    "word-count",
    "line-tools",
    "regex",
    "lorem",
    "unicode",
    "json",
    "base64",
    "data-convert",
    "jwt",
    "sql",
    "cron",
    "curl",
    "json-types",
    "timestamp",
    "lunar",
    "timezone",
    "date-diff",
    "duration",
    "working-days",
    "ids",
    "password",
    "qr",
    "barcode",
    "mock",
    "meta",
    "favicon",
    "pdf",
    "pdf-image",
    "sheets",
    "zip",
    "checksum",
    "hash",
    "strength",
    "hibp",
    "certificate",
    "hmac",
    "photo-cure",
    "photo-collage",
  ];

  it("uses the tool catalog as metadata source for all 41 advertised tools", () => {
    expect(toolCatalog.map((tool) => tool.id)).toEqual(advertisedIds);
    expect(plannedToolCount).toBe(41);
    expect(groupCatalog.flatMap((group) => group.tools.map((tool) => tool.id))).toEqual(
      advertisedIds,
    );
    expect(
      groupCatalog.flatMap((group) =>
        group.tools.map((tool) => toolCatalog.find((entry) => entry.id === tool.id)),
      ),
    ).not.toContain(undefined);
  });

  it("exposes Photo Cure as a private lazy-loaded media tool", () => {
    const photoCure = toolRegistry.find((tool) => tool.id === "photo-cure");

    expect(photoCure).toMatchObject({
      id: "photo-cure",
      group: "media",
      path: "/tools/photo-cure",
      privacy: "local-only",
      status: "ready",
      name: {
        en: "Photo Cure",
        vi: "Lọc ảnh",
      },
    });
    expect(photoCure?.keywords.en).toEqual(
      expect.arrayContaining(["photo", "cull", "burst"]),
    );
    expect(photoCure?.load).toEqual(expect.any(Function));
    expect(getToolByPath("/tools/photo-cure/")).toBe(photoCure);
  });

  it("exposes implemented text tools as lazy routes", () => {
    const readyTextIds = [
      "case-convert",
      "slugify",
      "diff",
      "word-count",
      "line-tools",
      "regex",
      "lorem",
      "unicode",
    ];
    const readyTextTools = toolRegistry.filter((tool) => tool.group === "text");

    expect(readyTextTools.map((tool) => tool.id)).toEqual(readyTextIds);
    readyTextTools.forEach((tool) => {
      expect(tool).toMatchObject({ status: "ready", group: "text" });
      expect(tool.load).toEqual(expect.any(Function));
      expect(getToolByPath(tool.path)).toBe(tool);
    });
  });

  it("exposes implemented Developer & Data tools as lazy routes", () => {
    const readyDeveloperIds = [
      "json",
      "base64",
      "data-convert",
      "jwt",
      "sql",
      "cron",
      "curl",
      "json-types",
    ];
    const readyDeveloperTools = toolRegistry.filter(
      (tool) => tool.group === "developer",
    );

    expect(readyDeveloperTools.map((tool) => tool.id)).toEqual(
      readyDeveloperIds,
    );
    readyDeveloperTools.forEach((tool) => {
      expect(tool).toMatchObject({ status: "ready", group: "developer" });
      expect(tool.load).toEqual(expect.any(Function));
      expect(getToolByPath(tool.path)).toBe(tool);
    });
  });

  it("exposes implemented Date & Time tools as lazy routes", () => {
    const readyDateIds = [
      "timestamp",
      "lunar",
      "timezone",
      "date-diff",
      "duration",
      "working-days",
    ];
    const readyDateTools = toolRegistry.filter(
      (tool) => tool.group === "date-time",
    );

    expect(readyDateTools.map((tool) => tool.id)).toEqual(readyDateIds);
    readyDateTools.forEach((tool) => {
      expect(tool).toMatchObject({ status: "ready", group: "date-time" });
      expect(tool.load).toEqual(expect.any(Function));
      expect(getToolByPath(tool.path)).toBe(tool);
    });
  });

  it("exposes implemented Generator tools as lazy routes", () => {
    const readyGeneratorIds = [
      "ids",
      "password",
      "qr",
      "barcode",
      "mock",
      "meta",
    ];
    const readyGeneratorTools = toolRegistry.filter(
      (tool) => tool.group === "generators",
    );

    expect(readyGeneratorTools.map((tool) => tool.id)).toEqual(
      readyGeneratorIds,
    );
    readyGeneratorTools.forEach((tool) => {
      expect(tool).toMatchObject({ status: "ready", group: "generators" });
      expect(tool.load).toEqual(expect.any(Function));
      expect(getToolByPath(tool.path)).toBe(tool);
    });
  });

  it("keeps registry ids and paths unique", () => {
    expect(new Set(toolCatalog.map((tool) => tool.id))).toHaveProperty(
      "size",
      toolCatalog.length,
    );
    expect(new Set(toolCatalog.map((tool) => tool.path))).toHaveProperty(
      "size",
      toolCatalog.length,
    );
    expect(new Set(toolRegistry.map((tool) => tool.id))).toHaveProperty(
      "size",
      toolRegistry.length,
    );
    expect(new Set(toolRegistry.map((tool) => tool.path))).toHaveProperty(
      "size",
      toolRegistry.length,
    );
  });
});
