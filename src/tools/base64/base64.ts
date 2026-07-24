const byteChunkSize = 0x8000;

export class Base64Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Base64Error";
  }
}

function toUrlSafe(value: string): string {
  return value.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function normalizedBase64(value: string, urlSafe: boolean): string {
  const compact = value.replace(/[ \t\r\n\f]+/gu, "");
  const alphabet = urlSafe
    ? /^[A-Za-z0-9_-]*={0,2}$/u
    : /^[A-Za-z0-9+/]*={0,2}$/u;
  if (!alphabet.test(compact) || /=/.test(compact.slice(0, -2))) {
    throw new Base64Error("Invalid Base64 alphabet or padding.");
  }

  const withoutPadding = compact.replace(/=+$/u, "");
  if (withoutPadding.length % 4 === 1) {
    throw new Base64Error("Invalid Base64 length.");
  }
  const standard = urlSafe
    ? withoutPadding.replaceAll("-", "+").replaceAll("_", "/")
    : withoutPadding;
  return standard.padEnd(
    standard.length + ((4 - (standard.length % 4)) % 4),
    "=",
  );
}

export function encodeBase64Bytes(
  bytes: Uint8Array,
  urlSafe: boolean,
): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += byteChunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + byteChunkSize),
    );
  }
  const encoded = btoa(binary);
  return urlSafe ? toUrlSafe(encoded) : encoded;
}

export function decodeBase64Bytes(
  value: string,
  urlSafe: boolean,
): Uint8Array {
  let binary: string;
  try {
    binary = atob(normalizedBase64(value, urlSafe));
  } catch (error) {
    if (error instanceof Base64Error) throw error;
    throw new Base64Error("Invalid Base64 input.");
  }
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function encodeBase64Text(value: string, urlSafe: boolean): string {
  return encodeBase64Bytes(new TextEncoder().encode(value), urlSafe);
}

export function decodeBase64Text(value: string, urlSafe: boolean): string {
  const bytes = decodeBase64Bytes(value, urlSafe);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Base64Error("Decoded bytes are not valid UTF-8 text.");
  }
}
