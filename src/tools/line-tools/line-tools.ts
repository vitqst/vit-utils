export type LineOrder = "original" | "asc" | "desc" | "reverse";

export interface LineToolOptions {
  order?: LineOrder;
  trim?: boolean;
  removeBlank?: boolean;
  dedupe?: boolean;
  caseSensitive?: boolean;
  locale?: string;
}

export function transformLines(
  input: string,
  {
    order = "original",
    trim = false,
    removeBlank = false,
    dedupe = false,
    caseSensitive = false,
    locale = "en",
  }: LineToolOptions,
): string {
  if (!input) return "";

  let result = input.replace(/\r\n?/g, "\n").split("\n");
  if (trim) result = result.map((line) => line.trim());
  if (removeBlank) result = result.filter((line) => line.length > 0);

  if (dedupe) {
    const seen = new Set<string>();
    result = result.filter((line) => {
      const key = caseSensitive ? line : line.toLocaleLowerCase(locale);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  if (order === "reverse") {
    result = [...result].reverse();
  } else if (order === "asc" || order === "desc") {
    const collator = new Intl.Collator(locale, {
      numeric: true,
      sensitivity: caseSensitive ? "variant" : "base",
    });
    result = [...result].sort((left, right) =>
      order === "asc"
        ? collator.compare(left, right)
        : collator.compare(right, left),
    );
  }

  return result.join("\n");
}

