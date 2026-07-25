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
export type CollageAspect = "original" | "1:1" | "4:5" | "16:9" | "9:16";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type NormalizedRect = Rect;

export type CollageTemplate = {
  id: "balanced" | "feature-left" | "feature-top" | "columns" | string;
  naturalAspect: number;
  cells: readonly NormalizedRect[];
};

function gridCells(
  count: number,
  bounds: NormalizedRect,
  preferredColumns = Math.ceil(Math.sqrt(count)),
) {
  const columns = Math.max(1, Math.min(count, preferredColumns));
  const rows = Math.ceil(count / columns);
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const rowStart = row * columns;
    const rowColumns = Math.min(columns, count - rowStart);
    const column = index - rowStart;
    return {
      x: bounds.x + (column / rowColumns) * bounds.width,
      y: bounds.y + (row / rows) * bounds.height,
      width: bounds.width / rowColumns,
      height: bounds.height / rows,
    };
  });
}

export function getCollageTemplates(count: number): CollageTemplate[] {
  validateCollageSettings({ count, width: MIN_COLLAGE_WIDTH, gap: 0 });
  const remaining = count - 1;
  return [
    {
      id: "balanced",
      naturalAspect: 1,
      cells: gridCells(count, { x: 0, y: 0, width: 1, height: 1 }),
    },
    {
      id: "feature-left",
      naturalAspect: 1,
      cells: [
        { x: 0, y: 0, width: 0.52, height: 1 },
        ...gridCells(
          remaining,
          { x: 0.52, y: 0, width: 0.48, height: 1 },
          remaining > 4 ? 2 : 1,
        ),
      ],
    },
    {
      id: "feature-top",
      naturalAspect: 1,
      cells: [
        { x: 0, y: 0, width: 1, height: 0.55 },
        ...gridCells(remaining, { x: 0, y: 0.55, width: 1, height: 0.45 }),
      ],
    },
    {
      id: "columns",
      naturalAspect: Math.max(1, count / 2),
      cells: gridCells(count, { x: 0, y: 0, width: 1, height: 1 }, count),
    },
  ];
}

const aspectRatios: Record<Exclude<CollageAspect, "original">, number> = {
  "1:1": 1,
  "4:5": 4 / 5,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
};

export function collageFromTemplate(options: {
  template: CollageTemplate;
  aspect: CollageAspect;
  width: number;
  gap: number;
}) {
  validateCollageSettings({
    count: options.template.cells.length,
    width: options.width,
    gap: options.gap,
  });
  const ratio =
    options.aspect === "original"
      ? options.template.naturalAspect
      : aspectRatios[options.aspect];
  const height = Math.round(options.width / ratio);
  if (options.width * height > MAX_COLLAGE_PIXELS) {
    throw new Error("The collage cannot exceed 24 megapixels.");
  }
  const leadingGap = Math.ceil(options.gap / 2);
  const trailingGap = Math.floor(options.gap / 2);
  const cells = options.template.cells.map((cell) => {
    const normalizedRight = cell.x + cell.width;
    const normalizedBottom = cell.y + cell.height;
    const x =
      Math.round(cell.x * options.width) + (cell.x > 0 ? leadingGap : 0);
    const y = Math.round(cell.y * height) + (cell.y > 0 ? leadingGap : 0);
    const right =
      Math.round(normalizedRight * options.width) -
      (normalizedRight < 1 ? trailingGap : 0);
    const bottom =
      Math.round(normalizedBottom * height) -
      (normalizedBottom < 1 ? trailingGap : 0);
    if (right <= x || bottom <= y) {
      throw new Error("Spacing leaves no room for collage images.");
    }
    return { x, y, width: right - x, height: bottom - y };
  });
  return { width: options.width, height, cells };
}

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
  const height = rows * baseCellSize + options.gap * (rows - 1);
  if (options.width * height > MAX_COLLAGE_PIXELS) {
    throw new Error("The collage cannot exceed 24 megapixels.");
  }

  const cells = Array.from({ length: options.count }, (_, index) => {
    const row = Math.floor(index / columns);
    const rowStart = row * columns;
    const rowColumns = Math.min(columns, options.count - rowStart);
    const column = index - rowStart;
    const rowAvailableWidth =
      options.width - options.gap * (rowColumns - 1);
    const rowCellWidth = Math.floor(rowAvailableWidth / rowColumns);
    const rowFinalColumnExtra =
      rowAvailableWidth - rowCellWidth * rowColumns;
    const width =
      rowCellWidth +
      (column === rowColumns - 1 ? rowFinalColumnExtra : 0);
    return {
      x: column * (rowCellWidth + options.gap),
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

export function fillSourceRectWithCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  zoom = 1,
  focalX = 0.5,
  focalY = 0.5,
): Rect {
  if (
    !Number.isFinite(zoom) ||
    zoom < 1 ||
    !Number.isFinite(focalX) ||
    focalX < 0 ||
    focalX > 1 ||
    !Number.isFinite(focalY) ||
    focalY < 0 ||
    focalY > 1
  ) {
    throw new Error("Crop settings are invalid.");
  }
  const base = fillSourceRect(
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight,
  );
  const width = base.width / zoom;
  const height = base.height / zoom;
  return {
    x: (sourceWidth - width) * focalX,
    y: (sourceHeight - height) * focalY,
    width,
    height,
  };
}
