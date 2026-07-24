/// <reference lib="webworker" />

import {
  CollageCancelledError,
  renderCollage,
  type CanvasLike,
  type CollageImageInput,
  type CollageRenderSettings,
} from "./photo-collage-render";

type RenderRequest = {
  type: "render";
  id: number;
  images: CollageImageInput[];
  settings: CollageRenderSettings;
};

type CancelRequest = { type: "cancel"; id: number };
type Request = RenderRequest | CancelRequest;

const cancelled = new Set<number>();

async function handleRender(request: RenderRequest) {
  try {
    const result = await renderCollage(
      request,
      {
        createBitmap: (blob) => createImageBitmap(blob),
        createCanvas: (width, height) =>
          new OffscreenCanvas(width, height) as unknown as CanvasLike,
      },
      () => cancelled.has(request.id),
      (completed, total) => {
        self.postMessage({
          type: "progress",
          id: request.id,
          completed,
          total,
        });
      },
    );
    if (cancelled.has(request.id)) return;
    self.postMessage({
      type: "result",
      id: request.id,
      blob: result.blob,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    if (error instanceof CollageCancelledError) return;
    self.postMessage({
      type: "error",
      id: request.id,
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    cancelled.delete(request.id);
  }
}

self.onmessage = (event: MessageEvent<Request>) => {
  if (event.data.type === "cancel") {
    cancelled.add(event.data.id);
    return;
  }
  void handleRender(event.data);
};

