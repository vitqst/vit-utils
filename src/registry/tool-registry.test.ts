import { describe, expect, it } from "vitest";

import { getToolByPath, toolRegistry } from "./tool-registry";

describe("tool registry", () => {
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

  it("keeps registry ids and paths unique", () => {
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
