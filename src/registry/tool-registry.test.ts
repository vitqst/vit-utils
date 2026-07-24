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
    const caseConvert = getToolByPath("/tools/case-convert");
    const slugify = getToolByPath("/tools/slugify");

    expect(caseConvert).toMatchObject({
      id: "case-convert",
      group: "text",
      status: "ready",
    });
    expect(slugify).toMatchObject({
      id: "slugify",
      group: "text",
      status: "ready",
    });
    expect(caseConvert?.load).toEqual(expect.any(Function));
    expect(slugify?.load).toEqual(expect.any(Function));
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
