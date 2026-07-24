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
