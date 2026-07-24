export type CaseStyle =
  | "sentence"
  | "title"
  | "upper"
  | "lower"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant";

export function splitWords(input: string): string[] {
  return (
    input
      .normalize("NFC")
      .replace(/([\p{Ll}\p{Nd}])(\p{Lu})/gu, "$1 $2")
      .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, "$1 $2")
      .match(/[\p{L}\p{M}\p{N}]+/gu) ?? []
  );
}

function capitalize(value: string, locale: string): string {
  const [first = "", ...rest] = Array.from(value);
  return first.toLocaleUpperCase(locale) + rest.join("").toLocaleLowerCase(locale);
}

export function convertCase(
  input: string,
  style: CaseStyle,
  locale = "en",
): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (style === "upper") return trimmed.toLocaleUpperCase(locale);
  if (style === "lower") return trimmed.toLocaleLowerCase(locale);

  const words = splitWords(trimmed);
  if (!words.length) return "";
  const lowerWords = words.map((word) => word.toLocaleLowerCase(locale));

  switch (style) {
    case "sentence":
      return [
        capitalize(lowerWords[0], locale),
        ...lowerWords.slice(1),
      ].join(" ");
    case "title":
      return lowerWords.map((word) => capitalize(word, locale)).join(" ");
    case "camel":
      return [
        lowerWords[0],
        ...lowerWords.slice(1).map((word) => capitalize(word, locale)),
      ].join("");
    case "pascal":
      return lowerWords.map((word) => capitalize(word, locale)).join("");
    case "snake":
      return lowerWords.join("_");
    case "kebab":
      return lowerWords.join("-");
    case "constant":
      return lowerWords.join("_").toLocaleUpperCase(locale);
  }
}

