import { hashBytes, type ChecksumAlgorithm } from "../checksum/checksum";

export type TextHashAlgorithm = ChecksumAlgorithm;

export function validateHashText(text: string) {
  if (text.length > 1_000_000) {
    throw new Error("Text must be 1,000,000 characters or fewer.");
  }
  return text;
}

export function hashText(algorithm: TextHashAlgorithm, text: string) {
  validateHashText(text);
  return hashBytes(algorithm, new TextEncoder().encode(text));
}

const formats: Record<number, string[]> = {
  32: ["MD5 / NTLM"],
  40: ["SHA-1"],
  64: ["SHA-256"],
  96: ["SHA-384"],
  128: ["SHA-512"],
};

export function identifyHashFormats(input: string) {
  const value = input.trim();
  if (!/^[0-9a-f]+$/i.test(value)) return [];
  return formats[value.length] ?? [];
}

