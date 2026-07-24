export interface TextCounts {
  words: number;
  characters: number;
  charactersNoWhitespace: number;
  sentences: number;
  lines: number;
  readingMinutes: number;
}

function segments(
  value: string,
  locale: string,
  granularity: Intl.SegmenterOptions["granularity"],
) {
  return Array.from(new Intl.Segmenter(locale, { granularity }).segment(value));
}

function countWords(value: string, locale: string): number {
  if (typeof Intl.Segmenter === "function") {
    return segments(value, locale, "word").filter(
      (segment) => segment.isWordLike,
    ).length;
  }
  return value.match(/[\p{L}\p{M}\p{N}]+/gu)?.length ?? 0;
}

function countSentences(value: string, locale: string): number {
  if (!value.trim()) return 0;
  if (typeof Intl.Segmenter === "function") {
    return segments(value, locale, "sentence").filter((segment) =>
      segment.segment.trim(),
    ).length;
  }
  return value
    .trim()
    .split(/(?<=[.!?…])(?:\s+|$)/u)
    .filter(Boolean).length;
}

function countCharacters(value: string, locale: string): number {
  if (typeof Intl.Segmenter === "function") {
    return segments(value, locale, "grapheme").length;
  }
  return Array.from(value.normalize("NFC")).length;
}

export function countText(value: string, locale = "en"): TextCounts {
  if (!value) {
    return {
      words: 0,
      characters: 0,
      charactersNoWhitespace: 0,
      sentences: 0,
      lines: 0,
      readingMinutes: 0,
    };
  }

  const words = countWords(value, locale);
  const withoutWhitespace = value.replace(/\s/gu, "");

  return {
    words,
    characters: countCharacters(value, locale),
    charactersNoWhitespace: countCharacters(withoutWhitespace, locale),
    sentences: countSentences(value, locale),
    lines: value.replace(/\r\n?/g, "\n").split("\n").length,
    readingMinutes: words ? Math.ceil(words / 200) : 0,
  };
}
