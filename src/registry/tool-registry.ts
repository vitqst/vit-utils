import type { ToolDefinition } from "./types";
import { toolCatalog } from "./tool-catalog";

export const toolRegistry = [
  {
    ...toolCatalog[0],
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
