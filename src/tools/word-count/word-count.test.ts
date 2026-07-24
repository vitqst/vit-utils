import { describe, expect, it } from "vitest";

import { countText } from "./word-count";

describe("word and character counting", () => {
  it("returns zero metrics for empty text", () => {
    expect(countText("", "en")).toEqual({
      words: 0,
      characters: 0,
      charactersNoWhitespace: 0,
      sentences: 0,
      lines: 0,
      readingMinutes: 0,
    });
  });

  it("counts Unicode graphemes and excludes whitespace separately", () => {
    expect(countText("Xin chào 👋", "vi")).toMatchObject({
      words: 2,
      characters: 10,
      charactersNoWhitespace: 8,
      lines: 1,
      readingMinutes: 1,
    });
    expect(countText("e\u0301", "en").characters).toBe(1);
  });

  it("counts multiline words, sentences, and CRLF as one break", () => {
    expect(countText("One two.\r\nThree!", "en")).toMatchObject({
      words: 3,
      sentences: 2,
      lines: 2,
    });
  });
});
