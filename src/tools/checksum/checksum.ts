import { md5, sha1 } from "@noble/hashes/legacy.js";
import { sha256, sha384, sha512 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";

export type ChecksumAlgorithm = "sha256" | "sha384" | "sha512" | "sha1" | "md5";

export const CHECKSUM_LENGTHS: Record<ChecksumAlgorithm, number> = {
  sha256: 64,
  sha384: 96,
  sha512: 128,
  sha1: 40,
  md5: 32,
};
export const MAX_CHECKSUM_FILE_BYTES = 500 * 1024 * 1024;

type IncrementalHasher = {
  update(data: Uint8Array): IncrementalHasher;
  digest(): Uint8Array;
  destroy(): void;
};

export function createIncrementalHasher(
  algorithm: ChecksumAlgorithm,
): IncrementalHasher {
  switch (algorithm) {
    case "sha256":
      return sha256.create();
    case "sha384":
      return sha384.create();
    case "sha512":
      return sha512.create();
    case "sha1":
      return sha1.create();
    case "md5":
      return md5.create();
  }
}

export function hashBytes(algorithm: ChecksumAlgorithm, bytes: Uint8Array) {
  const hasher = createIncrementalHasher(algorithm);
  hasher.update(bytes);
  return bytesToHex(hasher.digest());
}

export function parseExpectedChecksum(
  input: string,
  algorithm: ChecksumAlgorithm,
) {
  const value = input.trim();
  const bsd = value.match(/=\s*([0-9a-f]+)\s*$/i);
  const gnu = value.match(/^([0-9a-f]+)(?:\s+[* ]?.+)?$/i);
  const hash = (bsd?.[1] ?? gnu?.[1] ?? "").toLowerCase();
  const length = CHECKSUM_LENGTHS[algorithm];
  if (!new RegExp(`^[0-9a-f]{${length}}$`).test(hash)) {
    throw new Error(`Expected checksum must contain ${length} hexadecimal characters.`);
  }
  return hash;
}

export function verifyChecksum(actual: string, expected: string) {
  const left = actual.trim().toLowerCase();
  const right = expected.trim().toLowerCase();
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export function validateChecksumFile(file: { size: number } | undefined) {
  if (!file) throw new Error("Choose a file.");
  if (file.size > MAX_CHECKSUM_FILE_BYTES) {
    throw new Error("The file must be 500 MB or smaller.");
  }
  return file.size;
}

