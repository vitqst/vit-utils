/// <reference lib="webworker" />

import { readSheet } from "read-excel-file/web-worker";
import writeXlsxFile from "write-excel-file/universal";

import {
  normalizeSheetRows,
  parseCsv,
  rowsToCsv,
  type SheetMode,
} from "./sheets";

type Request =
  | { type: "convert"; id: number; mode: SheetMode; bytes: ArrayBuffer }
  | { type: "cancel"; id: number };

const cancelled = new Set<number>();

function post(data: unknown, transfer: Transferable[] = []) {
  self.postMessage(data, { transfer });
}

async function convert(request: Extract<Request, { type: "convert" }>) {
  try {
    let rows;
    let output: Blob;
    let name: string;
    let mimeType: string;
    if (request.mode === "csv-to-xlsx") {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(request.bytes);
      rows = parseCsv(text);
      if (cancelled.has(request.id)) throw new DOMException("Cancelled", "AbortError");
      output = await writeXlsxFile(rows, { sheet: "Sheet1" }).toBlob();
      name = "converted.xlsx";
      mimeType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else {
      rows = normalizeSheetRows(
        (await readSheet(request.bytes)) as unknown[][],
      );
      if (cancelled.has(request.id)) throw new DOMException("Cancelled", "AbortError");
      output = new Blob([`\uFEFF${rowsToCsv(rows)}`], {
        type: "text/csv;charset=utf-8",
      });
      name = "converted.csv";
      mimeType = "text/csv;charset=utf-8";
    }
    const bytes = await output.arrayBuffer();
    post(
      {
        type: "result",
        id: request.id,
        bytes,
        name,
        mimeType,
        preview: rows.slice(0, 10),
      },
      [bytes],
    );
  } catch (error) {
    if (cancelled.has(request.id)) {
      post({ type: "cancelled", id: request.id });
    } else {
      post({
        type: "error",
        id: request.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  } finally {
    cancelled.delete(request.id);
  }
}

self.onmessage = (event: MessageEvent<Request>) => {
  if (event.data.type === "cancel") cancelled.add(event.data.id);
  else void convert(event.data);
};

