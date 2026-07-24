import QRCode from "qrcode";

export type QrPayloadType = "text" | "url" | "wifi" | "contact";
export type WifiSecurity = "nopass" | "WEP" | "WPA";
export type QrErrorCorrection = "L" | "M" | "Q" | "H";

export interface WifiPayload {
  security: WifiSecurity;
  ssid: string;
  password: string;
  hidden: boolean;
}

export interface ContactPayload {
  name: string;
  phone: string;
  email: string;
  organization: string;
}

export interface QrRenderOptions {
  width: number;
  margin: number;
  dark: string;
  light: string;
  errorCorrectionLevel: QrErrorCorrection;
}

function escapeWifi(value: string) {
  return value.replace(/([\\;,:\"])/g, "\\$1");
}

function escapeVCard(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/([;,])/g, "\\$1");
}

function assertPayloadSize(payload: string) {
  if (!payload) throw new Error("QR payload cannot be empty.");
  if (new TextEncoder().encode(payload).length > 10_000) {
    throw new Error("QR payload cannot exceed 10,000 UTF-8 bytes.");
  }
  return payload;
}

export function buildWifiPayload(value: WifiPayload) {
  if (!value.ssid.trim()) throw new Error("Wi-Fi network name is required.");
  if (value.security !== "nopass" && !value.password) {
    throw new Error("A password is required for secured Wi-Fi.");
  }
  return assertPayloadSize(
    `WIFI:T:${value.security};S:${escapeWifi(value.ssid)};P:${escapeWifi(value.password)};H:${value.hidden ? "true" : "false"};;`,
  );
}

export function buildContactPayload(value: ContactPayload) {
  if (!value.name.trim()) throw new Error("Contact name is required.");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(value.name.trim())}`,
    ...(value.organization.trim()
      ? [`ORG:${escapeVCard(value.organization.trim())}`]
      : []),
    ...(value.phone.trim() ? [`TEL:${escapeVCard(value.phone.trim())}`] : []),
    ...(value.email.trim()
      ? [`EMAIL:${escapeVCard(value.email.trim())}`]
      : []),
    "END:VCARD",
  ];
  return assertPayloadSize(lines.join("\n"));
}

export function buildQrPayload(
  type: QrPayloadType,
  value:
    | { text: string }
    | WifiPayload
    | ContactPayload,
) {
  if (type === "wifi") return buildWifiPayload(value as WifiPayload);
  if (type === "contact") return buildContactPayload(value as ContactPayload);
  const text = (value as { text: string }).text.trim();
  if (type === "url") {
    let url: URL;
    try {
      url = new URL(text);
    } catch {
      throw new Error("Enter an absolute HTTP or HTTPS URL.");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Enter an absolute HTTP or HTTPS URL.");
    }
    return assertPayloadSize(url.toString());
  }
  return assertPayloadSize(text);
}

function assertRenderOptions(options: QrRenderOptions) {
  if (
    !Number.isInteger(options.width) ||
    options.width < 128 ||
    options.width > 2048
  ) {
    throw new Error("QR width must be an integer from 128 through 2,048.");
  }
  if (
    !Number.isInteger(options.margin) ||
    options.margin < 0 ||
    options.margin > 20
  ) {
    throw new Error("QR margin must be an integer from 0 through 20.");
  }
  if (!/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(options.dark)) {
    throw new Error("Dark color must be a six- or eight-digit hex color.");
  }
  if (!/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(options.light)) {
    throw new Error("Light color must be a six- or eight-digit hex color.");
  }
}

export async function generateQrSvg(
  payload: string,
  options: QrRenderOptions,
) {
  assertPayloadSize(payload);
  assertRenderOptions(options);
  return QRCode.toString(payload, {
    type: "svg",
    width: options.width,
    margin: options.margin,
    color: { dark: options.dark, light: options.light },
    errorCorrectionLevel: options.errorCorrectionLevel,
  });
}

export async function generateQrPng(
  payload: string,
  options: QrRenderOptions,
) {
  assertPayloadSize(payload);
  assertRenderOptions(options);
  return QRCode.toDataURL(payload, {
    type: "image/png",
    width: options.width,
    margin: options.margin,
    color: { dark: options.dark, light: options.light },
    errorCorrectionLevel: options.errorCorrectionLevel,
  });
}

