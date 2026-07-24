export type HmacAlgorithm = "SHA-256" | "SHA-384" | "SHA-512";
export type HmacEncoding = "utf8" | "hex" | "base64";
export type HmacOutputEncoding = "hex" | "base64";

const MAX_HMAC_BYTES = 1024 * 1024;

export function decodeHmacValue(
  value: string,
  encoding: HmacEncoding,
  allowEmpty: boolean,
) {
  let bytes: Uint8Array;
  if (encoding === "utf8") {
    bytes = new TextEncoder().encode(value);
  } else if (encoding === "hex") {
    if (value.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(value)) {
      throw new Error("Hex input must contain complete hexadecimal bytes.");
    }
    bytes = Uint8Array.from(
      value.match(/.{2}/g) ?? [],
      (pair) => Number.parseInt(pair, 16),
    );
  } else {
    if (
      value.length % 4 !== 0 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
    ) {
      throw new Error("Base64 input is malformed.");
    }
    try {
      const binary = atob(value);
      bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    } catch {
      throw new Error("Base64 input is malformed.");
    }
  }
  if (!allowEmpty && !bytes.length) throw new Error("Secret key cannot be empty.");
  if (bytes.length > MAX_HMAC_BYTES) {
    throw new Error("Decoded input must be 1 MB or smaller.");
  }
  return bytes;
}

export function encodeHmacValue(
  bytes: Uint8Array,
  encoding: HmacOutputEncoding,
) {
  if (encoding === "hex") {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function computeHmacBytes(options: {
  algorithm: HmacAlgorithm;
  key: string;
  keyEncoding: HmacEncoding;
  message: string;
  messageEncoding: HmacEncoding;
}) {
  const keyBytes = decodeHmacValue(options.key, options.keyEncoding, false);
  const messageBytes = decodeHmacValue(
    options.message,
    options.messageEncoding,
    true,
  );
  const keyBuffer = keyBytes.buffer.slice(
    keyBytes.byteOffset,
    keyBytes.byteOffset + keyBytes.byteLength,
  ) as ArrayBuffer;
  const messageBuffer = messageBytes.buffer.slice(
    messageBytes.byteOffset,
    messageBytes.byteOffset + messageBytes.byteLength,
  ) as ArrayBuffer;
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: options.algorithm },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, messageBuffer),
  );
}

export async function computeHmac(
  options: Parameters<typeof computeHmacBytes>[0] & {
    outputEncoding: HmacOutputEncoding;
  },
) {
  return encodeHmacValue(
    await computeHmacBytes(options),
    options.outputEncoding,
  );
}

export function verifyHmac(actual: Uint8Array, expected: Uint8Array) {
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual[index] ^ expected[index];
  }
  return difference === 0;
}
