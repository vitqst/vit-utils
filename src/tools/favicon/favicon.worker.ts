/// <reference lib="webworker" />

import { strToU8, zipSync } from "fflate";

import {
  FAVICON_OUTPUTS,
  buildBrowserConfig,
  buildFaviconHtml,
  buildFaviconManifest,
} from "./favicon";

type GenerateRequest = {
  type: "generate";
  id: number;
  bytes: ArrayBuffer;
  mimeType: string;
  appName: string;
  themeColor: string;
};

type CancelRequest = { type: "cancel"; id: number };
type Request = GenerateRequest | CancelRequest;

const cancelled = new Set<number>();

function post(data: unknown, transfer: Transferable[] = []) {
  self.postMessage(data, { transfer });
}

async function yieldToMessages() {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

async function generate(request: GenerateRequest) {
  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(
      new Blob([request.bytes], { type: request.mimeType }),
    );
    const files: Record<string, Uint8Array> = {};

    for (let index = 0; index < FAVICON_OUTPUTS.length; index += 1) {
      if (cancelled.has(request.id)) {
        post({ type: "cancelled", id: request.id });
        return;
      }
      const output = FAVICON_OUTPUTS[index];
      const canvas = new OffscreenCanvas(output.size, output.size);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas rendering is unavailable.");

      context.clearRect(0, 0, output.size, output.size);
      const scale = Math.min(
        output.size / bitmap.width,
        output.size / bitmap.height,
      );
      const width = bitmap.width * scale;
      const height = bitmap.height * scale;
      context.drawImage(
        bitmap,
        (output.size - width) / 2,
        (output.size - height) / 2,
        width,
        height,
      );
      const blob = await canvas.convertToBlob({ type: "image/png" });
      files[output.name] = new Uint8Array(await blob.arrayBuffer());
      post({
        type: "progress",
        id: request.id,
        completed: index + 1,
        total: FAVICON_OUTPUTS.length,
      });
      await yieldToMessages();
    }

    if (cancelled.has(request.id)) {
      post({ type: "cancelled", id: request.id });
      return;
    }
    files["site.webmanifest"] = strToU8(
      buildFaviconManifest(request.appName, request.themeColor),
    );
    files["browserconfig.xml"] = strToU8(
      buildBrowserConfig(request.themeColor),
    );
    files["favicon-links.html"] = strToU8(buildFaviconHtml());
    const archive = zipSync(files, { level: 6, mtime: 0 });
    post(
      {
        type: "result",
        id: request.id,
        bytes: archive.buffer,
      },
      [archive.buffer],
    );
  } catch (error) {
    post({
      type: "error",
      id: request.id,
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    cancelled.delete(request.id);
    bitmap?.close();
  }
}

self.onmessage = (event: MessageEvent<Request>) => {
  if (event.data.type === "cancel") {
    cancelled.add(event.data.id);
    return;
  }
  void generate(event.data);
};

