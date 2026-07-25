import {
  collageFromTemplate,
  fillSourceRect,
  fillSourceRectWithCrop,
  fitDestinationRect,
  layoutCollage,
  type CollageAspect,
  type CollageFit,
  type CollageFormat,
  type CollageLayout,
  type CollageTemplate,
} from "./collage";

export type CollageImageInput = {
  name: string;
  type: string;
  bytes: ArrayBuffer;
};

export type CollageRenderSettings = {
  layout?: CollageLayout;
  template?: CollageTemplate;
  aspect?: CollageAspect;
  fit: CollageFit;
  gap: number;
  cornerRadius?: number;
  background: string;
  width: number;
  format: CollageFormat;
  imageTransforms?: Array<{
    zoom: number;
    focalX: number;
    focalY: number;
  }>;
};

type BitmapLike = {
  width: number;
  height: number;
  close: () => void;
};

type ContextLike = {
  fillStyle: string;
  fillRect: (x: number, y: number, width: number, height: number) => void;
  drawImage: (...args: unknown[]) => void;
  save?: () => void;
  restore?: () => void;
  beginPath?: () => void;
  roundRect?: (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => void;
  clip?: () => void;
};

export type CanvasLike = {
  getContext: (type: "2d") => ContextLike | null;
  convertToBlob: (options: {
    type: CollageFormat;
    quality: number;
  }) => Promise<Blob>;
};

export type CollageRenderEnvironment = {
  createBitmap: (blob: Blob) => Promise<BitmapLike>;
  createCanvas: (width: number, height: number) => CanvasLike;
};

export class CollageCancelledError extends Error {
  constructor() {
    super("Collage rendering was cancelled.");
    this.name = "CollageCancelledError";
  }
}

export async function renderCollage(
  request: {
    images: CollageImageInput[];
    settings: CollageRenderSettings;
  },
  environment: CollageRenderEnvironment,
  isCancelled: () => boolean,
  onProgress: (completed: number, total: number) => void = () => undefined,
) {
  const geometry = request.settings.template
    ? collageFromTemplate({
        template: request.settings.template,
        aspect: request.settings.aspect ?? "original",
        width: request.settings.width,
        gap: request.settings.gap,
      })
    : layoutCollage({
        layout: request.settings.layout ?? "grid",
        count: request.images.length,
        width: request.settings.width,
        gap: request.settings.gap,
      });
  if (!/^#[0-9a-f]{6}$/i.test(request.settings.background)) {
    throw new Error("Background must be a six-digit hex color.");
  }

  const bitmaps: BitmapLike[] = [];
  try {
    for (const image of request.images) {
      if (isCancelled()) throw new CollageCancelledError();
      bitmaps.push(
        await environment.createBitmap(
          new Blob([image.bytes], { type: image.type }),
        ),
      );
    }

    const canvas = environment.createCanvas(geometry.width, geometry.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas rendering is unavailable.");
    if (
      (request.settings.cornerRadius ?? 0) > 0 &&
      (!context.save ||
        !context.restore ||
        !context.beginPath ||
        !context.roundRect ||
        !context.clip)
    ) {
      throw new Error("Rounded corners are unavailable in this browser.");
    }
    context.fillStyle = request.settings.background;
    context.fillRect(0, 0, geometry.width, geometry.height);

    bitmaps.forEach((bitmap, index) => {
      if (isCancelled()) throw new CollageCancelledError();
      const cell = geometry.cells[index];
      const radius = Math.min(
        request.settings.cornerRadius ?? 0,
        cell.width / 2,
        cell.height / 2,
      );
      if (
        radius > 0 &&
        context.save &&
        context.restore &&
        context.beginPath &&
        context.roundRect &&
        context.clip
      ) {
        context.save();
        context.beginPath();
        context.roundRect(
          cell.x,
          cell.y,
          cell.width,
          cell.height,
          radius,
        );
        context.clip();
      }
      if (request.settings.fit === "fill") {
        const transform = request.settings.imageTransforms?.[index];
        const source = transform
          ? fillSourceRectWithCrop(
              bitmap.width,
              bitmap.height,
              cell.width,
              cell.height,
              transform.zoom,
              transform.focalX,
              transform.focalY,
            )
          : fillSourceRect(
              bitmap.width,
              bitmap.height,
              cell.width,
              cell.height,
            );
        context.drawImage(
          bitmap,
          source.x,
          source.y,
          source.width,
          source.height,
          cell.x,
          cell.y,
          cell.width,
          cell.height,
        );
      } else {
        const destination = fitDestinationRect(
          bitmap.width,
          bitmap.height,
          cell.width,
          cell.height,
        );
        context.drawImage(
          bitmap,
          cell.x + destination.x,
          cell.y + destination.y,
          destination.width,
          destination.height,
        );
      }
      if (radius > 0) context.restore?.();
      onProgress(index + 1, bitmaps.length);
    });

    if (isCancelled()) throw new CollageCancelledError();
    const blob = await canvas.convertToBlob({
      type: request.settings.format,
      quality: 0.9,
    });
    return { blob, width: geometry.width, height: geometry.height };
  } finally {
    bitmaps.forEach((bitmap) => bitmap.close());
  }
}
