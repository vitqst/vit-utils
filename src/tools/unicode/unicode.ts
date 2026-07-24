export type UnicodeCategory =
  | "letter"
  | "mark"
  | "number"
  | "punctuation"
  | "symbol"
  | "separator"
  | "control"
  | "format"
  | "other";

export interface UnicodeRow {
  character: string;
  display: string;
  codePoint: string;
  decimal: number;
  utf16: string[];
  utf16Index: number;
  category: UnicodeCategory;
  name: string | null;
}

export interface UnicodeInspection {
  graphemes: number;
  codePoints: number;
  utf16Units: number;
  rows: UnicodeRow[];
}

const visibleWhitespace: Record<string, string> = {
  " ": "␠",
  "\t": "⇥",
  "\n": "↵",
  "\r": "␍",
  "\u00a0": "⍽",
};

const commonNames: Record<string, string> = {
  " ": "SPACE",
  "\t": "CHARACTER TABULATION",
  "\n": "LINE FEED",
  "\r": "CARRIAGE RETURN",
  "\u00a0": "NO-BREAK SPACE",
};

function categoryFor(character: string): UnicodeCategory {
  if (/\p{L}/u.test(character)) return "letter";
  if (/\p{M}/u.test(character)) return "mark";
  if (/\p{N}/u.test(character)) return "number";
  if (/\p{P}/u.test(character)) return "punctuation";
  if (/\p{S}/u.test(character)) return "symbol";
  if (/\p{Z}/u.test(character)) return "separator";
  if (/\p{Cc}/u.test(character)) return "control";
  if (/\p{Cf}/u.test(character)) return "format";
  return "other";
}

function algorithmicName(character: string): string | null {
  if (commonNames[character]) return commonNames[character];
  if (/^[A-Z]$/.test(character)) {
    return `LATIN CAPITAL LETTER ${character}`;
  }
  if (/^[a-z]$/.test(character)) {
    return `LATIN SMALL LETTER ${character.toUpperCase()}`;
  }
  if (/^[0-9]$/.test(character)) {
    const digitNames = [
      "ZERO",
      "ONE",
      "TWO",
      "THREE",
      "FOUR",
      "FIVE",
      "SIX",
      "SEVEN",
      "EIGHT",
      "NINE",
    ];
    return `DIGIT ${digitNames[Number(character)]}`;
  }
  return null;
}

function utf16Hex(character: string): string[] {
  return Array.from(
    { length: character.length },
    (_, index) =>
      character
        .charCodeAt(index)
        .toString(16)
        .toUpperCase()
        .padStart(4, "0"),
  );
}

function graphemeCount(value: string, locale: string): number {
  if (!value) return 0;
  if (typeof Intl.Segmenter === "function") {
    return Array.from(
      new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(value),
    ).length;
  }
  return Array.from(value).length;
}

export function inspectUnicode(
  value: string,
  locale = "en",
): UnicodeInspection {
  let utf16Index = 0;
  const rows = Array.from(value, (character): UnicodeRow => {
    const decimal = character.codePointAt(0) ?? 0;
    const row = {
      character,
      display: visibleWhitespace[character] ?? character,
      codePoint: `U+${decimal.toString(16).toUpperCase().padStart(4, "0")}`,
      decimal,
      utf16: utf16Hex(character),
      utf16Index,
      category: categoryFor(character),
      name: algorithmicName(character),
    };
    utf16Index += character.length;
    return row;
  });

  return {
    graphemes: graphemeCount(value, locale),
    codePoints: rows.length,
    utf16Units: value.length,
    rows,
  };
}
