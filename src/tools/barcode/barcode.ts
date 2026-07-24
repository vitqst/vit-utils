import JsBarcode from "jsbarcode";

export const BARCODE_FORMATS = [
  { id: "CODE128", en: "Code 128", vi: "Code 128" },
  { id: "EAN13", en: "EAN-13", vi: "EAN-13" },
  { id: "UPC", en: "UPC-A", vi: "UPC-A" },
  { id: "CODE39", en: "Code 39", vi: "Code 39" },
  { id: "ITF14", en: "ITF-14", vi: "ITF-14" },
] as const;

export type BarcodeFormat = (typeof BARCODE_FORMATS)[number]["id"];

export interface BarcodeOptions {
  format: BarcodeFormat;
  width: number;
  height: number;
  margin: number;
  foreground: string;
  background: string;
  displayValue: boolean;
}

function checkDigit(value: string) {
  const sum = [...value]
    .reverse()
    .reduce(
      (total, digit, index) =>
        total + Number(digit) * (index % 2 === 0 ? 3 : 1),
      0,
    );
  return String((10 - (sum % 10)) % 10);
}

function validateGs1(
  value: string,
  dataLength: number,
  label: string,
) {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${label} accepts digits only.`);
  }
  if (value.length !== dataLength && value.length !== dataLength + 1) {
    throw new Error(
      `${label} requires ${dataLength} digits without, or ${dataLength + 1} digits with, a check digit.`,
    );
  }
  if (
    value.length === dataLength + 1 &&
    value.at(-1) !== checkDigit(value.slice(0, -1))
  ) {
    throw new Error(`${label} check digit is invalid.`);
  }
  return value;
}

export function validateBarcodeValue(
  format: BarcodeFormat,
  source: string,
) {
  const value = source.trim();
  if (!value) throw new Error("Barcode data cannot be empty.");
  if (format === "EAN13") return validateGs1(value, 12, "EAN-13");
  if (format === "UPC") return validateGs1(value, 11, "UPC-A");
  if (format === "ITF14") return validateGs1(value, 13, "ITF-14");
  if (format === "CODE39") {
    const normalized = value.toUpperCase();
    if (!/^[0-9A-Z .\-$/+%]+$/.test(normalized)) {
      throw new Error("Code 39 contains an unsupported character.");
    }
    if (normalized.length > 80) throw new Error("Code 39 data is too long.");
    return normalized;
  }
  if (!/^[\x20-\x7e]+$/.test(value) || value.length > 120) {
    throw new Error(
      "Code 128 accepts 1–120 printable ASCII characters in this tool.",
    );
  }
  return value;
}

function assertOptions(options: BarcodeOptions) {
  if (options.width < 1 || options.width > 4) {
    throw new Error("Bar width must be from 1 through 4.");
  }
  if (options.height < 20 || options.height > 300) {
    throw new Error("Bar height must be from 20 through 300.");
  }
  if (options.margin < 0 || options.margin > 50) {
    throw new Error("Margin must be from 0 through 50.");
  }
  for (const color of [options.foreground, options.background]) {
    if (!/^#[0-9a-f]{6}$/i.test(color)) {
      throw new Error("Barcode colors must use six-digit hex values.");
    }
  }
}

export function renderBarcodeSvg(
  source: string,
  options: BarcodeOptions,
) {
  assertOptions(options);
  const value = validateBarcodeValue(options.format, source);
  const target: {
    encodings?: Array<{ data: string; text: string }>;
  } = {};
  let valid = true;
  try {
    (
      JsBarcode as unknown as (
        element: object,
        text: string,
        options: Record<string, unknown>,
      ) => void
    )(target, value, {
      format: options.format,
      width: options.width,
      height: options.height,
      margin: options.margin,
      lineColor: options.foreground,
      background: options.background,
      displayValue: options.displayValue,
      valid: (result: boolean) => {
        valid = result;
      },
    });
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : String(error),
    );
  }
  if (!valid) throw new Error("Barcode renderer rejected this value.");
  if (!target.encodings?.length) {
    throw new Error("Barcode renderer produced no encoded modules.");
  }

  const modules = target.encodings.map((encoding) => encoding.data).join("");
  const contentWidth = modules.length * options.width;
  const textHeight = options.displayValue ? 28 : 0;
  const totalWidth = contentWidth + options.margin * 2;
  const totalHeight = options.height + textHeight + options.margin * 2;
  const bars: string[] = [];
  let start = -1;
  for (let index = 0; index <= modules.length; index += 1) {
    if (modules[index] === "1" && start < 0) start = index;
    if (modules[index] !== "1" && start >= 0) {
      bars.push(
        `<rect x="${options.margin + start * options.width}" y="${options.margin}" width="${(index - start) * options.width}" height="${options.height}"/>`,
      );
      start = -1;
    }
  }
  const escapedText = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" role="img" aria-label="Barcode ${escapedText}">`,
    `<rect width="100%" height="100%" fill="${options.background}"/>`,
    `<g fill="${options.foreground}">${bars.join("")}</g>`,
    ...(options.displayValue
      ? [
          `<text x="${totalWidth / 2}" y="${options.margin + options.height + 20}" text-anchor="middle" font-family="monospace" font-size="16" fill="${options.foreground}">${escapedText}</text>`,
        ]
      : []),
    "</svg>",
  ].join("");
}
