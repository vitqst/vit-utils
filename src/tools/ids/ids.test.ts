import { describe, expect, it } from "vitest";

import {
  createUlidGenerator,
  generateIdentifiers,
  generateNanoId,
  generateUuid,
} from "./ids";

const zeros = (length: number) => new Uint8Array(length);

describe("identifier generation", () => {
  it("sets UUID v4 version and variant bits", () => {
    expect(generateUuid(zeros)).toBe("00000000-0000-4000-8000-000000000000");
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
    expect(generateIdentifiers("nanoid", 2, 12, zeros)).toEqual([
      "____________",
      "____________",
    ]);
    expect(() => generateIdentifiers("uuid", 1001, 21, zeros)).toThrow();
    expect(() => generateNanoId(0, zeros)).toThrow();
  });
});

