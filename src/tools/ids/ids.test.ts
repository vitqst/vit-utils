import { describe, expect, it } from "vitest";

import {
  createUlidGenerator,
  generateIdentifiers,
  generateNanoId,
  generateUuid,
  generateUuidV7,
} from "./ids";

const zeros = (length: number) => new Uint8Array(length);

describe("identifier generation", () => {
  it("sets UUID v4 version and variant bits", () => {
    expect(generateUuid(zeros)).toBe("00000000-0000-4000-8000-000000000000");
  });

  it("encodes the UUID v7 timestamp, version, and variant bits", () => {
    expect(generateUuidV7(0x0123_4567_89ab, zeros)).toBe(
      "01234567-89ab-7000-8000-000000000000",
    );
  });

  it("rejects UUID v7 timestamps outside the 48-bit range", () => {
    expect(() => generateUuidV7(-1, zeros)).toThrow(
      "UUID v7 timestamp is outside its 48-bit range.",
    );
    expect(() => generateUuidV7(281_474_976_710_656, zeros)).toThrow(
      "UUID v7 timestamp is outside its 48-bit range.",
    );
  });

  it("creates sortable monotonic ULIDs within one millisecond", () => {
    const generate = createUlidGenerator(zeros);
    const first = generate(0);
    const second = generate(0);

    expect(first).toBe("00000000000000000000000000");
    expect(second).toBe("00000000000000000000000001");
    expect(first < second).toBe(true);
  });

  it("creates URL-safe NanoIDs at the requested length", () => {
    expect(generateNanoId(21, zeros)).toMatch(/^[\w-]{21}$/);
    expect(generateNanoId(64, zeros)).toHaveLength(64);
  });

  it("generates bounded batches for each identifier type", () => {
    expect(generateIdentifiers("uuid", 3, 21, zeros)).toHaveLength(3);
    expect(generateIdentifiers("uuid-v7", 2, 21, zeros)).toHaveLength(2);
    expect(generateIdentifiers("nanoid", 2, 12, zeros)).toEqual([
      "____________",
      "____________",
    ]);
    expect(() => generateIdentifiers("uuid", 1001, 21, zeros)).toThrow();
    expect(() => generateNanoId(0, zeros)).toThrow();
  });
});
