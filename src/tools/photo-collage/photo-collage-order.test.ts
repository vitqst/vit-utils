import { describe, expect, it } from "vitest";

import { moveItemById } from "./photo-collage-order";

const items = [1, 2, 3, 4, 5].map((id) => ({ id }));

describe("photo collage insertion order", () => {
  it("inserts an item before the target when moving backward", () => {
    expect(moveItemById(items, 5, 1).map(({ id }) => id)).toEqual([
      5, 1, 2, 3, 4,
    ]);
  });

  it("inserts an item at the target position when moving forward", () => {
    expect(moveItemById(items, 1, 5).map(({ id }) => id)).toEqual([
      2, 3, 4, 5, 1,
    ]);
  });

  it("returns an unchanged copy for identical or missing IDs", () => {
    expect(moveItemById(items, 3, 3)).toEqual(items);
    expect(moveItemById(items, 9, 1)).toEqual(items);
    expect(moveItemById(items, 1, 9)).toEqual(items);
    expect(moveItemById(items, 3, 3)).not.toBe(items);
  });
});
