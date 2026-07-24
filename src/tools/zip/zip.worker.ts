/// <reference lib="webworker" />

import { unzip, zip, zipSync } from "fflate";

import {
  inspectZipCentralDirectory,
  makeUniqueArchiveNames,
  type ZipMode,
} from "./zip";

type ProcessRequest = {
  type: "process";
  id: number;
  mode: ZipMode;
  files: { name: string; bytes: ArrayBuffer }[];
};
type Request = ProcessRequest | { type: "cancel"; id: number };
const terminators = new Map<number, () => void>();
const cancelled = new Set<number>();

function post(data: unknown, transfer: Transferable[] = []) {
  self.postMessage(data, { transfer });
}

function finish(
  request: ProcessRequest,
  bytes: Uint8Array,
  name: string,
  entries: string[],
) {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  post({ type: "result", id: request.id, bytes: buffer, name, entries }, [buffer]);
}

function createArchive(request: ProcessRequest) {
  const names = makeUniqueArchiveNames(request.files.map((file) => file.name));
  const data = Object.fromEntries(
    request.files.map((file, index) => [names[index], new Uint8Array(file.bytes)]),
  );
  post({ type: "progress", id: request.id, completed: 0, total: names.length });
  const terminate = zip(data, { level: 6, mtime: new Date(1980, 0, 1) }, (error, bytes) => {
    terminators.delete(request.id);
    if (cancelled.delete(request.id)) {
      post({ type: "cancelled", id: request.id });
    } else if (error) {
      post({ type: "error", id: request.id, message: error.message });
    } else {
      finish(request, bytes, "archive.zip", names);
    }
  });
  terminators.set(request.id, terminate);
}

function extractArchive(request: ProcessRequest) {
  const input = new Uint8Array(request.files[0].bytes);
  let entries;
  try {
    entries = inspectZipCentralDirectory(input);
  } catch (error) {
    post({
      type: "error",
      id: request.id,
      message: error instanceof Error ? error.message : String(error),
    });
    return;
  }
  post({ type: "progress", id: request.id, completed: 0, total: entries.length });
  const terminate = unzip(input, (error, files) => {
    terminators.delete(request.id);
    if (cancelled.delete(request.id)) {
      post({ type: "cancelled", id: request.id });
    } else if (error) {
      post({ type: "error", id: request.id, message: error.message });
    } else {
      const safeFiles = Object.fromEntries(
        entries.map((entry) => {
          const source = Object.entries(files).find(([name]) => {
            const normalized = name.replaceAll("\\", "/").replace(/^\.\//, "");
            return normalized === entry.name;
          });
          if (!source) throw new Error(`ZIP entry ${entry.name} could not be extracted.`);
          return [entry.name, source[1]];
        }),
      );
      try {
        finish(
          request,
          zipSync(safeFiles, { level: 6, mtime: new Date(1980, 0, 1) }),
          "extracted-files.zip",
          entries.map((entry) => entry.name),
        );
      } catch (cause) {
        post({
          type: "error",
          id: request.id,
          message: cause instanceof Error ? cause.message : String(cause),
        });
      }
    }
  });
  terminators.set(request.id, terminate);
}

self.onmessage = (event: MessageEvent<Request>) => {
  if (event.data.type === "cancel") {
    cancelled.add(event.data.id);
    terminators.get(event.data.id)?.();
    return;
  }
  if (event.data.mode === "create") createArchive(event.data);
  else extractArchive(event.data);
};
