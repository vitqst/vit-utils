import { toolCatalog } from "./tool-catalog";
import type { LocalizedText, ToolGroup } from "./types";

export interface PlannedTool {
  id: string;
  name: LocalizedText;
  status: "ready" | "planned";
}

export interface ToolGroupCatalog {
  id: ToolGroup;
  name: LocalizedText;
  tools: PlannedTool[];
}

const groupNames: Record<ToolGroup, LocalizedText> = {
  text: { en: "Text & string", vi: "Văn bản & chuỗi" },
  developer: { en: "Developer & data", vi: "Lập trình & dữ liệu" },
  "date-time": { en: "Date & time", vi: "Ngày & giờ" },
  generators: { en: "Generators", vi: "Trình tạo" },
  files: { en: "Files & documents", vi: "Tệp & tài liệu" },
  security: { en: "Security", vi: "Bảo mật" },
  media: { en: "Media", vi: "Phương tiện" },
};

const groupOrder = [
  "text",
  "developer",
  "date-time",
  "generators",
  "files",
  "security",
  "media",
] as const satisfies readonly ToolGroup[];

export const groupCatalog: ToolGroupCatalog[] = groupOrder.map((id) => ({
  id,
  name: groupNames[id],
  tools: toolCatalog
    .filter((entry) => entry.group === id)
    .map(({ id: toolId, name, status }) => ({ id: toolId, name, status })),
}));

export const plannedToolCount = toolCatalog.length;
