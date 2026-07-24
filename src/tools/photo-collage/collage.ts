export const MIN_COLLAGE_IMAGES = 2;
export const MAX_COLLAGE_IMAGES = 12;
export const MIN_COLLAGE_WIDTH = 320;
export const MAX_COLLAGE_WIDTH = 4096;
export const MAX_COLLAGE_GAP = 128;
export const MAX_COLLAGE_PIXELS = 24_000_000;
export const MAX_COLLAGE_FILE_BYTES = 25 * 1024 * 1024;
export const COLLAGE_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type CollageLayout = "grid" | "horizontal" | "vertical";
export type CollageFit = "fill" | "fit";
export type CollageFormat = "image/png" | "image/jpeg";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function validateCollageSettings(options: {
  count: number;
  width: number;
  gap: number;
}) {
  if (
    !Number.isInteger(options.count) ||
    options.count < MIN_COLLAGE_IMAGES ||
    options.count > MAX_COLLAGE_IMAGES
  ) {
    throw new Error("Choose between 2 and 12 images.");
  }
  if (
    !Number.isInteger(options.width) ||
    options.width < MIN_COLLAGE_WIDTH ||
    options.width > MAX_COLLAGE_WIDTH
  ) {
    throw new Error("Output width must be between 320 and 4096 pixels.");
  }
  if (
    !Number.isInteger(options.gap) ||
    options.gap < 0 ||
    options.gap > MAX_COLLAGE_GAP
  ) {
    throw new Error("Gap must be between 0 and 128 pixels.");
  }
  return options;
}

export function layoutCollage(options: {
  layout: CollageLayout;
  count: number;
  width: number;
  gap: number;
}) {
  validateCollageSettings(options);
  const columns =
    options.layout === "vertical"
      ? 1
      : options.layout === "horizontal"
        ? options.count
        : Math.ceil(Math.sqrt(options.count));
  const rows = Math.ceil(options.count / columns);
  const availableWidth = options.width - options.gap * (columns - 1);
  const baseCellSize = Math.floor(availableWidth / columns);
  if (baseCellSize < 1) {
    throw new Error("Gap leaves no room for collage images.");
  }
  const finalColumnExtra = availableWidth - baseCellSize * columns;
  const height = rows * baseCellSize + options.gap * (rows - 1);
  if (options.width * height > MAX_COLLAGE_PIXELS) {
    throw new Error("The collage cannot exceed 24 megapixels.");
  }

  const cells = Array.from({ length: options.count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const width =
      baseCellSize + (column === columns - 1 ? finalColumnExtra : 0);
    return {
      x: column * (baseCellSize + options.gap),
      y: row * (baseCellSize + options.gap),
      width,
      height: baseCellSize,
    };
  });

  return { width: options.width, height, cells };
}

function validateImageDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
) {
  if (
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    targetWidth <= 0 ||
    targetHeight <= 0
  ) {
    throw new Error("Image dimensions must be positive.");
  }
}

export function fitDestinationRect(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): Rect {
  validateImageDimensions(
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight,
  );
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return {
    x: (targetWidth - width) / 2,
    y: (targetHeight - height) / 2,
    width,
    height,
  };
}

export function fillSourceRect(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): Rect {
  validateImageDimensions(
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight,
  );
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = sourceWidth / sourceHeight;
  if (sourceRatio > targetRatio) {
    const width = sourceHeight * targetRatio;
    return {
      x: (sourceWidth - width) / 2,
      y: 0,
      width,
      height: sourceHeight,
    };
  }
  const height = sourceWidth / targetRatio;
  return {
    x: 0,
    y: (sourceHeight - height) / 2,
    width: sourceWidth,
    height,
  };
}

