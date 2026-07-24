/// <reference lib="webworker" />

import { zipSync } from "fflate";
import { PDFDocument } from "pdf-lib";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

import { parsePageRange } from "../pdf/pdf";
import { outputNameForPages, type ImagePdfLayout, type PdfImageMode } from "./pdf-image";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type ConvertRequest = {
  type: "convert";
  id: number;
  mode: PdfImageMode;
  files: { name: string; type: string; bytes: ArrayBuffer }[];
  range: string;
  scale: number;
  layout: ImagePdfLayout;
};
type Request = ConvertRequest | { type: "cancel"; id: number };

const cancelled = new Set<number>();
const renderTasks = new Map<number, { cancel: () => void }>();

function post(data: unknown, transfer: Transferable[] = []) {
  self.postMessage(data, { transfer });
}

async function yieldToMessages() {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

class WorkerCanvasFactory {
  create(width: number, height: number) {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas rendering is unavailable.");
    return { canvas, context };
  }
  reset(
    target: { canvas: OffscreenCanvas; context: OffscreenCanvasRenderingContext2D },
    width: number,
    height: number,
  ) {
    target.canvas.width = width;
    target.canvas.height = height;
  }
  destroy(target: { canvas: OffscreenCanvas | null; context: OffscreenCanvasRenderingContext2D | null }) {
    if (target.canvas) {
      target.canvas.width = 0;
      target.canvas.height = 0;
    }
    target.canvas = null;
    target.context = null;
  }
}

async function pdfToImages(request: ConvertRequest) {
  const source = request.files[0];
  const loadingTask = getDocument({
    data: new Uint8Array(source.bytes),
    CanvasFactory: WorkerCanvasFactory,
    disableFontFace: true,
    isOffscreenCanvasSupported: true,
    useSystemFonts: false,
  });
  try {
    const document = await loadingTask.promise;
    const pages = parsePageRange(request.range, document.numPages);
    if (pages.length > 50) throw new Error("Render no more than 50 pages at once.");
    const rendered: Record<string, Uint8Array> = {};

    for (let index = 0; index < pages.length; index += 1) {
      if (cancelled.has(request.id)) throw new DOMException("Cancelled", "AbortError");
      const pageIndex = pages[index];
      const page = await document.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale: request.scale });
      if (viewport.width * viewport.height > 50_000_000) {
        throw new Error("A rendered page would exceed the 50 megapixel limit.");
      }
      const canvas = new OffscreenCanvas(
        Math.ceil(viewport.width),
        Math.ceil(viewport.height),
      );
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas rendering is unavailable.");
      const task = page.render({
        canvas: null,
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport,
      });
      renderTasks.set(request.id, task);
      await task.promise;
      renderTasks.delete(request.id);
      const blob = await canvas.convertToBlob({ type: "image/png" });
      rendered[`page-${pageIndex + 1}.png`] = new Uint8Array(await blob.arrayBuffer());
      page.cleanup();
      post({
        type: "progress",
        id: request.id,
        completed: index + 1,
        total: pages.length,
      });
      await yieldToMessages();
    }
    const metadata = outputNameForPages(pages);
    const bytes =
      pages.length === 1
        ? rendered[metadata.name]
        : zipSync(rendered, { level: 6, mtime: 0 });
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    post({ type: "result", id: request.id, bytes: buffer, ...metadata }, [buffer]);
  } finally {
    await loadingTask.destroy();
  }
}

async function imagesToPdf(request: ConvertRequest) {
  const document = await PDFDocument.create();
  for (let index = 0; index < request.files.length; index += 1) {
    if (cancelled.has(request.id)) throw new DOMException("Cancelled", "AbortError");
    const file = request.files[index];
    const bytes = new Uint8Array(file.bytes);
    const image =
      file.type === "image/png"
        ? await document.embedPng(bytes)
        : await document.embedJpg(bytes);
    const original = image.scale(1);
    const pageSize: [number, number] =
      request.layout === "a4"
        ? [595.28, 841.89]
        : [
            Math.min(original.width, 14_400),
            Math.min(original.height, 14_400),
          ];
    const page = document.addPage(pageSize);
    const margin = request.layout === "a4" ? 36 : 0;
    const scale = Math.min(
      (pageSize[0] - margin * 2) / original.width,
      (pageSize[1] - margin * 2) / original.height,
      request.layout === "a4" ? Number.POSITIVE_INFINITY : 1,
    );
    const width = original.width * scale;
    const height = original.height * scale;
    page.drawImage(image, {
      x: (pageSize[0] - width) / 2,
      y: (pageSize[1] - height) / 2,
      width,
      height,
    });
    post({
      type: "progress",
      id: request.id,
      completed: index + 1,
      total: request.files.length,
    });
    await yieldToMessages();
  }
  const saved = await document.save();
  const buffer = saved.buffer.slice(saved.byteOffset, saved.byteOffset + saved.byteLength);
  post(
    {
      type: "result",
      id: request.id,
      bytes: buffer,
      name: "images.pdf",
      mimeType: "application/pdf",
    },
    [buffer],
  );
}

async function convert(request: ConvertRequest) {
  try {
    if (request.mode === "pdf-to-image") await pdfToImages(request);
    else await imagesToPdf(request);
  } catch (error) {
    if (cancelled.has(request.id) || (error instanceof DOMException && error.name === "AbortError")) {
      post({ type: "cancelled", id: request.id });
    } else {
      post({
        type: "error",
        id: request.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  } finally {
    renderTasks.delete(request.id);
    cancelled.delete(request.id);
  }
}

self.onmessage = (event: MessageEvent<Request>) => {
  if (event.data.type === "cancel") {
    cancelled.add(event.data.id);
    renderTasks.get(event.data.id)?.cancel();
  } else {
    void convert(event.data);
  }
};
