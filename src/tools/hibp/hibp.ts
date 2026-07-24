import { sha1 } from "@noble/hashes/legacy.js";
import { bytesToHex } from "@noble/hashes/utils.js";

export const HIBP_RANGE_ORIGIN = "https://api.pwnedpasswords.com";
export const MAX_HIBP_RESPONSE_CHARS = 2_000_000;

export function validatePwnedPassword(password: string) {
  const length = Array.from(password).length;
  if (!length) throw new Error("Enter a password to check.");
  if (length > 256) throw new Error("Password must be 256 characters or fewer.");
  return password;
}

export function derivePwnedPasswordRange(password: string) {
  validatePwnedPassword(password);
  const digest = bytesToHex(sha1(new TextEncoder().encode(password))).toUpperCase();
  return { prefix: digest.slice(0, 5), suffix: digest.slice(5) };
}

export function parsePwnedRangeResponse(text: string, targetSuffix: string) {
  if (text.length > MAX_HIBP_RESPONSE_CHARS) {
    throw new Error("HIBP response exceeded the safety limit.");
  }
  if (!/^[0-9A-F]{35}$/i.test(targetSuffix)) {
    throw new Error("Invalid local hash suffix.");
  }
  let matchCount = 0;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^([0-9A-F]{35}):([0-9]+)$/i);
    if (!match) throw new Error("HIBP returned a malformed range response.");
    const count = Number(match[2]);
    if (!Number.isSafeInteger(count)) {
      throw new Error("HIBP returned an invalid breach count.");
    }
    if (count > 0 && match[1].toUpperCase() === targetSuffix.toUpperCase()) {
      matchCount = count;
    }
  }
  return matchCount;
}

