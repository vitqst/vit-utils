/// <reference lib="webworker" />

import { bytesToHex } from "@noble/hashes/utils.js";

import {
  createIncrementalHasher,
  type ChecksumAlgorithm,
} from "./checksum";

type Request =
  | { type: "start"; id: number; algorithm: ChecksumAlgorithm; total: number }
  | { type: "chunk"; id: number; bytes: ArrayBuffer; processed: number; total: number }
  | { type: "finish"; id: number }
  | { type: "cancel"; id: number };

type Hasher = ReturnType<typeof createIncrementalHasher>;
const hashers = new Map<number, Hasher>();

self.onmessage = (event: MessageEvent<Request>) => {
  const request = event.data;
  try {
    if (request.type === "start") {
      hashers.get(request.id)?.destroy();
      hashers.set(request.id, createIncrementalHasher(request.algorithm));
      self.postMessage({ type: "ready", id: request.id });
      return;
    }
    const hasher = hashers.get(request.id);
    if (!hasher) return;
    if (request.type === "chunk") {
      hasher.update(new Uint8Array(request.bytes));
      self.postMessage({
        type: "progress",
        id: request.id,
        processed: request.processed,
        total: request.total,
      });
    } else if (request.type === "finish") {
      const hash = bytesToHex(hasher.digest());
      hashers.delete(request.id);
      self.postMessage({ type: "result", id: request.id, hash });
    } else {
      hasher.destroy();
      hashers.delete(request.id);
      self.postMessage({ type: "cancelled", id: request.id });
    }
  } catch (error) {
    hashers.get(request.id)?.destroy();
    hashers.delete(request.id);
    self.postMessage({
      type: "error",
      id: request.id,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

