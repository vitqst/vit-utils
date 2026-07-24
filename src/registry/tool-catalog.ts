import type { ToolDefinition } from "./types";

export type ToolCatalogEntry = Omit<ToolDefinition, "load">;

export const toolCatalog = [
  {
    id: "photo-cure",
    group: "media",
    name: {
      en: "Photo Cure",
      vi: "Lọc ảnh",
    },
    description: {
      en: "Cull a shoot quickly, compare bursts, and keep only the frames you want.",
      vi: "Lọc nhanh một bộ ảnh, so sánh ảnh chụp liên tiếp và chỉ giữ khung hình bạn muốn.",
    },
    keywords: {
      en: ["photo", "cull", "burst", "image", "picker", "offline"],
      vi: ["ảnh", "lọc ảnh", "chụp liên tiếp", "ngoại tuyến"],
    },
    icon: "aperture",
    path: "/tools/photo-cure",
    privacy: "local-only",
    status: "ready",
  },
] satisfies ToolCatalogEntry[];
