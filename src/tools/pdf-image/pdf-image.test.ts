import { describe, expect, it } from "vitest";

import { outputNameForPages, validateImageFiles, validatePdfImageFile } from "./pdf-image";

describe("PDF and image input rules", () => {
  it("selects a PNG name for one page and ZIP for multiple pages", () => {
    expect(outputNameForPages([4])).toEqual({
      name: "page-5.png",
      mimeType: "image/png",
    });
    expect(outputNameForPages([0, 2])).toEqual({
      name: "pdf-pages.zip",
      mimeType: "application/zip",
    });
  });

  it("accepts bounded PDF and image files", () => {
    expect(
      validatePdfImageFile({ name: "doc.pdf", type: "application/pdf", size: 10 }),
    ).toBe(10);
    expect(
      validateImageFiles([
        { name: "a.png", type: "image/png", size: 10 },
        { name: "b.jpg", type: "image/jpeg", size: 20 },
      ]),
    ).toBe(30);
  });

  it("rejects unsupported, empty, and excessive image selections", () => {
    expect(() => validateImageFiles([])).toThrow(/at least one/i);
    expect(() =>
      validateImageFiles([{ name: "a.webp", type: "image/webp", size: 10 }]),
    ).toThrow(/PNG or JPEG/i);
    expect(() =>
      validatePdfImageFile({ name: "a.png", type: "image/png", size: 10 }),
    ).toThrow(/PDF/i);
  });
});

