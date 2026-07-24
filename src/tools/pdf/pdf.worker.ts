/// <reference lib="webworker" />

import { PDFDocument, degrees } from "pdf-lib";

import { parsePageRange, type PdfMode } from "./pdf";

type Request =
  | {
      type: "process";
      id: number;
      mode: PdfMode;
      files: { name: string; bytes: ArrayBuffer }[];
      range: string;
      rotation: 0 | 90 | 180 | 270;
    }
  | { type: "cancel"; id: number };

const cancelled = new Set<number>();

function post(data: unknown, transfer: Transferable[] = []) {
  self.postMessage(data, { transfer });
}

async function yieldToMessages() {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

async function processPdf(request: Extract<Request, { type: "process" }>) {
  try {
    const output = await PDFDocument.create();
    let completed = 0;
    const sources =
      request.mode === "split" ? request.files.slice(0, 1) : request.files;

    for (const source of sources) {
      if (cancelled.has(request.id)) {
        post({ type: "cancelled", id: request.id });
        return;
      }
      const document = await PDFDocument.load(source.bytes);
      const pageIndices =
        request.mode === "split"
          ? parsePageRange(request.range, document.getPageCount())
          : document.getPageIndices();
      const copiedPages = await output.copyPages(document, pageIndices);
      for (const page of copiedPages) {
        if (cancelled.has(request.id)) {
          post({ type: "cancelled", id: request.id });
          return;
        }
        if (request.rotation) {
          page.setRotation(
            degrees((page.getRotation().angle + request.rotation) % 360),
          );
        }
        output.addPage(page);
        completed += 1;
        post({ type: "progress", id: request.id, completed });
        await yieldToMessages();
      }
    }
    if (output.getPageCount() === 0) throw new Error("No pages were selected.");
    const saved = await output.save();
    const bytes = saved.buffer.slice(
      saved.byteOffset,
      saved.byteOffset + saved.byteLength,
    );
    post(
      { type: "result", id: request.id, bytes, pageCount: output.getPageCount() },
      [bytes],
    );
  } catch (error) {
    post({
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
  } else {
    void processPdf(event.data);
  }
};

