import type { ComponentType } from "react";

export type Locale = "en" | "vi";
export type ToolGroup =
  | "text"
  | "developer"
  | "date-time"
  | "generators"
  | "files"
  | "security"
  | "media";

export interface LocalizedText {
  en: string;
  vi: string;
}

export interface ToolComponentProps {
  locale: Locale;
}

export interface ToolModule {
  default: ComponentType<ToolComponentProps>;
}

export interface ToolDefinition {
  id: string;
  group: ToolGroup;
  name: LocalizedText;
  description: LocalizedText;
  keywords: Record<Locale, string[]>;
  icon: "aperture";
  path: `/tools/${string}`;
  privacy: "local-only" | "network-prefix";
  status: "ready" | "planned";
  load: () => Promise<ToolModule>;
}
