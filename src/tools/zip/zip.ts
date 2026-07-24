export type ZipMode = "create" | "extract";

export const MAX_ZIP_INPUT_BYTES = 250 * 1024 * 1024;
export const MAX_ZIP_OUTPUT_BYTES = 500 * 1024 * 1024;
export const MAX_ZIP_ENTRY_BYTES = 250 * 1024 * 1024;
export const MAX_ZIP_ENTRIES = 1_000;

export type ZipEntryInfo = {
  name: string;
  compressedSize: number;
  originalSize: number;
  compression: number;
};

export function sanitizeArchivePath(input: string) {
  if (
    !input ||
    input.includes("\0") ||
    input.startsWith("/") ||
    input.startsWith("\\") ||
    /^[a-z]:[\\/]/i.test(input)
  ) {
    throw new Error(`Unsafe archive path: ${input || "(empty)"}.`);
  }
  const normalized = input.replaceAll("\\", "/");
  const segments = normalized.split("/");
  if (segments.some((segment) => !segment || segment === "..")) {
    throw new Error(`Unsafe archive path: ${input}.`);
  }
  const safe = segments.filter((segment) => segment !== ".").join("/");
  if (!safe) throw new Error(`Unsafe archive path: ${input}.`);
  return safe;
}

export function makeUniqueArchiveNames(names: string[]) {
  const used = new Set<string>();
  return names.map((rawName) => {
    const name = sanitizeArchivePath(rawName);
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
    const slash = name.lastIndexOf("/");
    const directory = slash >= 0 ? name.slice(0, slash + 1) : "";
    const basename = slash >= 0 ? name.slice(slash + 1) : name;
    const dot = basename.lastIndexOf(".");
    const stem = dot > 0 ? basename.slice(0, dot) : basename;
    const extension = dot > 0 ? basename.slice(dot) : "";
    let counter = 2;
    let candidate;
    do {
      candidate = `${directory}${stem} (${counter})${extension}`;
      counter += 1;
    } while (used.has(candidate));
    used.add(candidate);
    return candidate;
  });
}

function findEndOfCentralDirectory(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const minimum = Math.max(0, bytes.length - 65_557);
  for (let offset = bytes.length - 22; offset >= minimum; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }
  throw new Error("ZIP central directory was not found.");
}

export function inspectZipCentralDirectory(bytes: Uint8Array): ZipEntryInfo[] {
  if (bytes.length < 22) throw new Error("ZIP central directory is missing.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = findEndOfCentralDirectory(bytes);
  if (view.getUint16(end + 4, true) !== 0 || view.getUint16(end + 6, true) !== 0) {
    throw new Error("Multi-disk ZIP archives are not supported.");
  }
  const count = view.getUint16(end + 10, true);
  const directorySize = view.getUint32(end + 12, true);
  let offset = view.getUint32(end + 16, true);
  if (
    count === 0xffff ||
    directorySize === 0xffffffff ||
    offset === 0xffffffff
  ) {
    throw new Error("ZIP64 archives are not supported.");
  }
  if (offset + directorySize > bytes.length) {
    throw new Error("ZIP central directory is truncated.");
  }
  const decoder = new TextDecoder();
  const entries: ZipEntryInfo[] = [];
  const names = new Set<string>();
  let total = 0;

  for (let index = 0; index < count; index += 1) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error("ZIP central directory entry is malformed.");
    }
    const flags = view.getUint16(offset + 8, true);
    const compression = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const originalSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    if (
      compressedSize === 0xffffffff ||
      originalSize === 0xffffffff
    ) {
      throw new Error("ZIP64 entries are not supported.");
    }
    if (flags & 1) throw new Error("Encrypted ZIP entries are not supported.");
    if (compression !== 0 && compression !== 8) {
      throw new Error(`ZIP compression method ${compression} is not supported.`);
    }
    const nameStart = offset + 46;
    const nextOffset = nameStart + nameLength + extraLength + commentLength;
    if (nextOffset > bytes.length) throw new Error("ZIP entry metadata is truncated.");
    const rawName = decoder.decode(bytes.subarray(nameStart, nameStart + nameLength));
    const directory = rawName.endsWith("/") || rawName.endsWith("\\");
    const comparable = directory ? rawName.slice(0, -1) : rawName;
    const name = sanitizeArchivePath(comparable);
    if (!directory) {
      if (names.has(name)) throw new Error(`Duplicate archive path: ${name}.`);
      names.add(name);
      if (entries.length >= MAX_ZIP_ENTRIES) {
        throw new Error(`ZIP contains more than ${MAX_ZIP_ENTRIES} files.`);
      }
      if (originalSize > MAX_ZIP_ENTRY_BYTES) {
        throw new Error(`ZIP entry ${name} exceeds 250 MB.`);
      }
      if (
        originalSize > 1024 * 1024 &&
        originalSize / Math.max(1, compressedSize) > 100
      ) {
        throw new Error(`ZIP entry ${name} exceeds the 100:1 expansion limit.`);
      }
      total += originalSize;
      if (total > MAX_ZIP_OUTPUT_BYTES) {
        throw new Error("ZIP expands beyond the 500 MB output limit.");
      }
      entries.push({ name, compressedSize, originalSize, compression });
    }
    offset = nextOffset;
  }
  if (!entries.length) throw new Error("ZIP does not contain any files.");
  return entries;
}

type FileLike = { name: string; size: number };

export function validateZipSelection(files: FileLike[], mode: ZipMode) {
  if (mode === "create") {
    if (!files.length) throw new Error("Choose at least one file.");
    if (files.length > 500) throw new Error("Choose no more than 500 files.");
  } else {
    if (files.length !== 1 || !files[0].name.toLowerCase().endsWith(".zip")) {
      throw new Error("Choose one ZIP file.");
    }
  }
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_ZIP_INPUT_BYTES) {
    throw new Error("Selected input must total 250 MB or less.");
  }
  return total;
}

