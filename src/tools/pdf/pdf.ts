export type PdfMode = "merge" | "split";

export const MAX_PDF_BYTES = 100 * 1024 * 1024;
export const MAX_PDF_FILES = 20;

export function parsePageRange(expression: string, pageCount: number) {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new Error("The PDF does not contain any pages.");
  }
  const input = expression.trim();
  if (!input) return Array.from({ length: pageCount }, (_, index) => index);

  const result: number[] = [];
  const seen = new Set<number>();
  const parseNumber = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const page = normalized === "last" ? pageCount : Number(normalized);
    if (!Number.isInteger(page)) {
      throw new Error(`Invalid page value: ${value.trim() || "(empty)"}.`);
    }
    if (page < 1 || page > pageCount) {
      throw new Error(`Page ${page} must be between 1 and ${pageCount}.`);
    }
    return page;
  };

  for (const token of input.split(",")) {
    const segment = token.trim();
    if (!segment) throw new Error("Page list contains an empty value.");
    const range = segment.split("-");
    if (range.length > 2) throw new Error(`Invalid page range: ${segment}.`);
    if (range.length === 1) {
      const page = parseNumber(range[0]) - 1;
      if (!seen.has(page)) {
        seen.add(page);
        result.push(page);
      }
      continue;
    }
    const start = parseNumber(range[0]);
    const end = parseNumber(range[1]);
    if (start > end) throw new Error(`Page range ${segment} runs backwards.`);
    for (let page = start; page <= end; page += 1) {
      const index = page - 1;
      if (!seen.has(index)) {
        seen.add(index);
        result.push(index);
      }
    }
  }
  return result;
}

type FileLike = { name: string; type: string; size: number };

export function validatePdfFiles(files: FileLike[], mode: PdfMode) {
  if (mode === "merge" && files.length < 2) {
    throw new Error("Choose at least two PDF files to merge.");
  }
  if (mode === "split" && files.length !== 1) {
    throw new Error("Choose exactly one PDF file to split.");
  }
  if (files.length > MAX_PDF_FILES) {
    throw new Error(`Choose no more than ${MAX_PDF_FILES} PDF files.`);
  }
  if (
    files.some(
      (file) =>
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf"),
    )
  ) {
    throw new Error("Only PDF files are supported.");
  }
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_PDF_BYTES) {
    throw new Error("Selected PDFs must total 100 MB or less.");
  }
  return total;
}

