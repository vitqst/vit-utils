import type { ToolDefinition } from "./types";
import { toolCatalog } from "./tool-catalog";

function catalogEntry(id: string) {
  const entry = toolCatalog.find((tool) => tool.id === id);
  if (!entry) throw new Error(`Missing tool catalog entry: ${id}`);
  return entry;
}

export const toolRegistry = [
  {
    ...catalogEntry("case-convert"),
    load: () => import("../tools/case-convert"),
  },
  {
    ...catalogEntry("slugify"),
    load: () => import("../tools/slugify"),
  },
  {
    ...catalogEntry("diff"),
    load: () => import("../tools/diff"),
  },
  {
    ...catalogEntry("word-count"),
    load: () => import("../tools/word-count"),
  },
  {
    ...catalogEntry("line-tools"),
    load: () => import("../tools/line-tools"),
  },
  {
    ...catalogEntry("regex"),
    load: () => import("../tools/regex"),
  },
  {
    ...catalogEntry("lorem"),
    load: () => import("../tools/lorem"),
  },
  {
    ...catalogEntry("unicode"),
    load: () => import("../tools/unicode"),
  },
  {
    ...catalogEntry("json"),
    load: () => import("../tools/json"),
  },
  {
    ...catalogEntry("base64"),
    load: () => import("../tools/base64"),
  },
  {
    ...catalogEntry("data-convert"),
    load: () => import("../tools/data-convert"),
  },
  {
    ...catalogEntry("jwt"),
    load: () => import("../tools/jwt"),
  },
  {
    ...catalogEntry("sql"),
    load: () => import("../tools/sql"),
  },
  {
    ...catalogEntry("cron"),
    load: () => import("../tools/cron"),
  },
  {
    ...catalogEntry("curl"),
    load: () => import("../tools/curl"),
  },
  {
    ...catalogEntry("json-types"),
    load: () => import("../tools/json-types"),
  },
  {
    ...catalogEntry("timestamp"),
    load: () => import("../tools/timestamp"),
  },
  {
    ...catalogEntry("lunar"),
    load: () => import("../tools/lunar"),
  },
  {
    ...catalogEntry("timezone"),
    load: () => import("../tools/timezone"),
  },
  {
    ...catalogEntry("date-diff"),
    load: () => import("../tools/date-diff"),
  },
  {
    ...catalogEntry("duration"),
    load: () => import("../tools/duration"),
  },
  {
    ...catalogEntry("working-days"),
    load: () => import("../tools/working-days"),
  },
  {
    ...catalogEntry("ids"),
    load: () => import("../tools/ids"),
  },
  {
    ...catalogEntry("password"),
    load: () => import("../tools/password"),
  },
  {
    ...catalogEntry("qr"),
    load: () => import("../tools/qr"),
  },
  {
    ...catalogEntry("barcode"),
    load: () => import("../tools/barcode"),
  },
  {
    ...catalogEntry("mock"),
    load: () => import("../tools/mock"),
  },
  {
    ...catalogEntry("meta"),
    load: () => import("../tools/meta"),
  },
  {
    ...catalogEntry("favicon"),
    load: () => import("../tools/favicon"),
  },
  {
    ...catalogEntry("pdf"),
    load: () => import("../tools/pdf"),
  },
  {
    ...catalogEntry("pdf-image"),
    load: () => import("../tools/pdf-image"),
  },
  {
    ...catalogEntry("sheets"),
    load: () => import("../tools/sheets"),
  },
  {
    ...catalogEntry("photo-cure"),
    load: () => import("../tools/photo-cure"),
  },
] satisfies ToolDefinition[];

function normalizePath(path: string) {
  if (path === "/") return path;
  return path.replace(/\/+$/, "");
}

export function getToolByPath(path: string) {
  const normalizedPath = normalizePath(path);
  return toolRegistry.find((tool) => tool.path === normalizedPath);
}
