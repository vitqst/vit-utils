import { describe, expect, it } from "vitest";

import {
  fitDestinationRect,
  fillSourceRect,
  layoutCollage,
  validateCollageSettings,
} from "./collage";

describe("photo collage geometry", () => {
  it("lays four images out as a bounded two-by-two grid", () => {
    expect(
      layoutCollage({
        layout: "grid",
        count: 4,
        width: 1200,
        gap: 16,
      }),
    ).toEqual({
      width: 1200,
      height: 1200,
      cells: [
        { x: 0, y: 0, width: 592, height: 592 },
        { x: 608, y: 0, width: 592, height: 592 },
        { x: 0, y: 608, width: 592, height: 592 },
        { x: 608, y: 608, width: 592, height: 592 },
      ],
    });
  });

  it("supports one-row and one-column presets", () => {
    expect(
      layoutCollage({
        layout: "horizontal",
        count: 3,
        width: 900,
        gap: 10,
      }),
    ).toEqual({
      width: 900,
      height: 293,
      cells: [
        { x: 0, y: 0, width: 293, height: 293 },
        { x: 303, y: 0, width: 293, height: 293 },
        { x: 606, y: 0, width: 294, height: 293 },
      ],
    });
    expect(
      layoutCollage({
        layout: "vertical",
        count: 2,
        width: 600,
        gap: 12,
      }),
    ).toMatchObject({
      width: 600,
      height: 1212,
      cells: [
        { x: 0, y: 0, width: 600, height: 600 },
        { x: 0, y: 612, width: 600, height: 600 },
      ],
    });
  });

  it("centers fit and fill rectangles without changing aspect ratio", () => {
    expect(fitDestinationRect(400, 200, 100, 100)).toEqual({
      x: 0,
      y: 25,
      width: 100,
      height: 50,
    });
    expect(fillSourceRect(400, 200, 100, 100)).toEqual({
      x: 100,
      y: 0,
      width: 200,
      height: 200,
    });
  });

  it("rejects invalid counts, dimensions, gaps, and oversized canvases", () => {
    expect(() =>
      validateCollageSettings({ count: 1, width: 1200, gap: 16 }),
    ).toThrow("between 2 and 12");
    expect(() =>
      validateCollageSettings({ count: 13, width: 1200, gap: 16 }),
    ).toThrow("between 2 and 12");
    expect(() =>
      validateCollageSettings({ count: 2, width: 200, gap: 16 }),
    ).toThrow("between 320 and 4096");
    expect(() =>
      validateCollageSettings({ count: 2, width: 1200, gap: 129 }),
    ).toThrow("between 0 and 128");
    expect(() =>
      layoutCollage({
        layout: "vertical",
        count: 12,
        width: 4096,
        gap: 0,
      }),
    ).toThrow("24 megapixels");
  });
});

