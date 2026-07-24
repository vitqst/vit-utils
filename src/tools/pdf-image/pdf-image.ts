export type PdfImageMode = "pdf-to-image" | "image-to-pdf";
export type ImagePdfLayout = "original" | "a4";

export const MAX_CONVERSION_BYTES = 100 * 1024 * 1024;
export const MAX_CONVERSION_IMAGES = 50;

type FileLike = { name: string; type: string; size: number };

export function validatePdfImageFile(file: FileLike | undefined) {
  if (!file) throw new Error("Choose a PDF file.");
  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    throw new Error("Choose a valid PDF file.");
  }
  if (file.size > MAX_CONVERSION_BYTES) {
    throw new Error("The PDF must be 100 MB or smaller.");
  }
  return file.size;
}

export function validateImageFiles(files: FileLike[]) {
  if (!files.length) throw new Error("Choose at least one PNG or JPEG image.");
  if (files.length > MAX_CONVERSION_IMAGES) {
    throw new Error(`Choose no more than ${MAX_CONVERSION_IMAGES} images.`);
  }
  if (
    files.some(
      (file) => file.type !== "image/png" && file.type !== "image/jpeg",
    )
  ) {
    throw new Error("Only PNG or JPEG images are supported.");
  }
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_CONVERSION_BYTES) {
    throw new Error("Selected images must total 100 MB or less.");
  }
  return total;
}

export function outputNameForPages(pages: number[]) {
  return pages.length === 1
    ? { name: `page-${pages[0] + 1}.png`, mimeType: "image/png" }
    : { name: "pdf-pages.zip", mimeType: "application/zip" };
}

