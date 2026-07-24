export interface SlugifyOptions {
  ascii?: boolean;
  separator?: "-" | "_";
}

export function removeVietnameseDiacritics(input: string): string {
  return input
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D")
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .normalize("NFC");
}

export function slugify(
  input: string,
  { ascii = true, separator = "-" }: SlugifyOptions = {},
): string {
  const normalized = ascii
    ? removeVietnameseDiacritics(input)
    : input.normalize("NFC");
  const disallowed = ascii
    ? /[^A-Za-z0-9]+/g
    : /[^\p{L}\p{M}\p{N}]+/gu;

  return normalized
    .toLocaleLowerCase()
    .replace(disallowed, separator)
    .replace(new RegExp(`\\${separator}+`, "g"), separator)
    .replace(new RegExp(`^\\${separator}|\\${separator}$`, "g"), "")
    .normalize("NFC");
}
