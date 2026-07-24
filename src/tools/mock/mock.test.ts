import { describe, expect, it } from "vitest";

import {
  generateMockData,
  mockDataToCsv,
  type MockField,
} from "./mock";

const fields: MockField[] = [
  "id",
  "name",
  "email",
  "phone",
  "address",
  "company",
  "date",
];

describe("mock data generation", () => {
  it("is deterministic for the same seed and options", () => {
    const first = generateMockData({
      count: 2,
      locale: "vi",
      seed: "vit-tools",
      fields,
    });
    const second = generateMockData({
      count: 2,
      locale: "vi",
      seed: "vit-tools",
      fields,
    });

    expect(second).toEqual(first);
    expect(first[0]).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^mock_/),
        name: expect.any(String),
        email: expect.stringMatching(/@example\.(com|test)$/),
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      }),
    );
  });

  it("changes output by locale and seed", () => {
    const vietnamese = generateMockData({
      count: 1,
      locale: "vi",
      seed: "a",
      fields: ["name", "address"],
    });
    const english = generateMockData({
      count: 1,
      locale: "en",
      seed: "b",
      fields: ["name", "address"],
    });
    expect(vietnamese).not.toEqual(english);
  });

  it("emits quoted CSV with stable selected-field order", () => {
    const csv = mockDataToCsv([
      { name: "Nguyễn, An", email: "an@example.com" },
      { name: 'A "B"', email: "b@example.com" },
    ]);
    expect(csv).toBe(
      'name,email\r\n"Nguyễn, An",an@example.com\r\n"A ""B""",b@example.com',
    );
  });

  it("validates count, seed, and field selection", () => {
    expect(() =>
      generateMockData({ count: 0, locale: "en", seed: "x", fields: ["id"] }),
    ).toThrow();
    expect(() =>
      generateMockData({ count: 1, locale: "en", seed: "x", fields: [] }),
    ).toThrow(/field/i);
    expect(() =>
      generateMockData({
        count: 1,
        locale: "en",
        seed: "x".repeat(129),
        fields: ["id"],
      }),
    ).toThrow();
  });
});

