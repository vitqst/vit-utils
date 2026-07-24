import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";

import {
  inspectZipCentralDirectory,
  makeUniqueArchiveNames,
  sanitizeArchivePath,
} from "./zip";

describe("safe ZIP handling", () => {
  it("normalizes safe paths and rejects traversal and absolute paths", () => {
    expect(sanitizeArchivePath("folder\\photo.jpg")).toBe("folder/photo.jpg");
    expect(() => sanitizeArchivePath("../secret.txt")).toThrow(/unsafe/i);
    expect(() => sanitizeArchivePath("/etc/passwd")).toThrow(/unsafe/i);
    expect(() => sanitizeArchivePath("C:\\secret.txt")).toThrow(/unsafe/i);
    expect(() => sanitizeArchivePath("a\u0000b.txt")).toThrow(/unsafe/i);
  });

  it("assigns deterministic names to duplicate selected files", () => {
    expect(makeUniqueArchiveNames(["report.txt", "report.txt", "photo.jpg"])).toEqual([
      "report.txt",
      "report (2).txt",
      "photo.jpg",
    ]);
  });

  it("preflights central-directory sizes and entries before extraction", () => {
    const bytes = zipSync(
      {
        "folder/a.txt": strToU8("alpha"),
        "b.txt": strToU8("beta"),
      },
      { mtime: new Date(1980, 0, 1) },
    );
    expect(inspectZipCentralDirectory(bytes)).toEqual([
      expect.objectContaining({ name: "folder/a.txt", originalSize: 5 }),
      expect.objectContaining({ name: "b.txt", originalSize: 4 }),
    ]);
    expect(() => inspectZipCentralDirectory(new Uint8Array([1, 2, 3]))).toThrow(
      /directory|ZIP/i,
    );
  });
});
