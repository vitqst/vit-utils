import { describe, expect, it } from "vitest";

import {
  BARCODE_FORMATS,
  renderBarcodeSvg,
  validateBarcodeValue,
} from "./barcode";

describe("barcode generation", () => {
  it("supports the advertised formats and validates representative values", () => {
    expect(BARCODE_FORMATS.map(({ id }) => id)).toEqual([
      "CODE128",
      "EAN13",
      "UPC",
      "CODE39",
      "ITF14",
    ]);
    expect(validateBarcodeValue("CODE128", "ABC-123")).toBe("ABC-123");
    expect(validateBarcodeValue("EAN13", "5901234123457")).toBe(
      "5901234123457",
    );
    expect(validateBarcodeValue("UPC", "036000291452")).toBe("036000291452");
    expect(validateBarcodeValue("CODE39", "abc 123")).toBe("ABC 123");
    expect(validateBarcodeValue("ITF14", "12345678901231")).toBe(
      "12345678901231",
    );
  });

  it("rejects bad lengths, characters, and check digits", () => {
    expect(() => validateBarcodeValue("EAN13", "123")).toThrow();
    expect(() => validateBarcodeValue("EAN13", "5901234123458")).toThrow(
      /check digit/i,
    );
    expect(() => validateBarcodeValue("CODE39", "hello_")).toThrow(
      /character/i,
    );
    expect(() => validateBarcodeValue("ITF14", "12345678901232")).toThrow(
      /check digit/i,
    );
  });

  it("renders validated SVG without source HTML", () => {
    const svg = renderBarcodeSvg("ABC-123", {
      format: "CODE128",
      width: 2,
      height: 80,
      margin: 10,
      foreground: "#111111",
      background: "#ffffff",
      displayValue: true,
    });
    expect(svg).toMatch(/^<svg/);
    expect(svg).toContain("#111111");
    expect(svg).toContain("ABC-123");
  });
});

