import { decodeBase64Bytes, encodeBase64Bytes } from "./base64";

interface EncodeRequest {
  type: "encode";
  id: number;
  bytes: ArrayBuffer;
  urlSafe: boolean;
}

interface DecodeRequest {
  type: "decode";
  id: number;
  value: string;
  urlSafe: boolean;
}

interface CancelRequest {
  type: "cancel";
  id: number;
}

type WorkerRequest = EncodeRequest | DecodeRequest | CancelRequest;

const worker = self as DedicatedWorkerGlobalScope;
const cancelled = new Set<number>();
const encodeChunkSize = 3 * 16384;

function yieldToMessages() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

async function encode(request: EncodeRequest) {
  const bytes = new Uint8Array(request.bytes);
  const chunks: string[] = [];

  for (let offset = 0; offset < bytes.length; offset += encodeChunkSize) {
    if (cancelled.has(request.id)) return;
    chunks.push(
      encodeBase64Bytes(
        bytes.subarray(offset, offset + encodeChunkSize),
        request.urlSafe,
      ),
    );
    worker.postMessage({
      type: "progress",
      id: request.id,
      value: bytes.length ? Math.min(1, (offset + encodeChunkSize) / bytes.length) : 1,
    });
    await yieldToMessages();
  }

  if (!cancelled.has(request.id)) {
    worker.postMessage({
      type: "encoded",
      id: request.id,
      value: chunks.join(""),
    });
  }
}

async function decode(request: DecodeRequest) {
  await yieldToMessages();
  if (cancelled.has(request.id)) return;
  const bytes = decodeBase64Bytes(request.value, request.urlSafe);
  worker.postMessage(
    { type: "decoded", id: request.id, bytes: bytes.buffer },
    [bytes.buffer],
  );
}

worker.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.type === "cancel") {
    cancelled.add(request.id);
    return;
  }

  const run = request.type === "encode" ? encode(request) : decode(request);
  void run.catch((error: unknown) => {
    worker.postMessage({
      type: "error",
      id: request.id,
      message: error instanceof Error ? error.message : String(error),
    });
  });
});

