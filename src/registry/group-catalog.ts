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

const tool = (
  id: string,
  en: string,
  vi: string,
  status: PlannedTool["status"] = "planned",
): PlannedTool => ({ id, name: { en, vi }, status });

export const groupCatalog: ToolGroupCatalog[] = [
  {
    id: "text",
    name: { en: "Text & string", vi: "Văn bản & chuỗi" },
    tools: [
      tool("case-convert", "Case converter", "Đổi kiểu chữ"),
      tool("slugify", "Slug & Vietnamese accents", "Slug & bỏ dấu"),
      tool("diff", "Text diff", "So sánh (diff)"),
      tool("word-count", "Word & character count", "Đếm từ & ký tự"),
      tool("line-tools", "Sort & dedupe lines", "Sắp xếp & lọc dòng"),
      tool("regex", "Regex tester", "Kiểm thử Regex"),
      tool("lorem", "Lorem Ipsum", "Lorem Ipsum"),
      tool("unicode", "Unicode inspector", "Soi Unicode"),
    ],
  },
  {
    id: "developer",
    name: { en: "Developer & data", vi: "Lập trình & dữ liệu" },
    tools: [
      tool("json", "JSON formatter", "JSON Formatter"),
      tool("base64", "Base64", "Base64"),
      tool("data-convert", "JSON ↔ YAML ↔ CSV", "JSON ↔ YAML ↔ CSV"),
      tool("jwt", "JWT decoder", "Giải mã JWT"),
      tool("sql", "SQL formatter", "Định dạng SQL"),
      tool("cron", "Cron builder", "Cron builder"),
      tool("curl", "curl → code", "curl → code"),
      tool("json-types", "JSON → TypeScript", "JSON → TypeScript"),
    ],
  },
  {
    id: "date-time",
    name: { en: "Date & time", vi: "Ngày & giờ" },
    tools: [
      tool("timestamp", "Unix timestamp", "Unix Timestamp"),
      tool("lunar", "Lunar calendar", "Đổi lịch âm"),
      tool("timezone", "Timezone converter", "Đổi múi giờ"),
      tool("date-diff", "Date difference", "Khoảng cách ngày"),
      tool("duration", "Duration humanizer", "Diễn giải thời lượng"),
      tool("working-days", "Working days", "Tính ngày làm việc"),
    ],
  },
  {
    id: "generators",
    name: { en: "Generators", vi: "Trình tạo" },
    tools: [
      tool("ids", "UUID / ULID / NanoID", "UUID / ULID / NanoID"),
      tool("password", "Password generator", "Tạo mật khẩu"),
      tool("qr", "QR code", "Mã QR"),
      tool("barcode", "Barcode", "Mã vạch"),
      tool("mock", "Mock data", "Dữ liệu giả"),
      tool("meta", "Meta tags & OG preview", "Meta tags & OG preview"),
      tool("favicon", "Favicon set", "Bộ favicon"),
    ],
  },
  {
    id: "files",
    name: { en: "Files & documents", vi: "Tệp & tài liệu" },
    tools: [
      tool("pdf", "Merge / split PDF", "Gộp / tách PDF"),
      tool("pdf-image", "PDF ↔ image", "PDF ↔ ảnh"),
      tool("sheets", "CSV ↔ XLSX", "CSV ↔ XLSX"),
      tool("zip", "Zip / unzip", "Nén / giải nén ZIP"),
      tool("checksum", "File checksum", "Checksum tệp"),
    ],
  },
  {
    id: "security",
    name: { en: "Security", vi: "Bảo mật" },
    tools: [
      tool("hash", "SHA / MD5 hashes", "Băm SHA / MD5"),
      tool("strength", "Password strength", "Độ mạnh mật khẩu"),
      tool("hibp", "Breach check (HIBP)", "Kiểm tra rò rỉ (HIBP)"),
      tool("certificate", "X.509 decoder", "Giải mã chứng chỉ X.509"),
      tool("hmac", "HMAC", "HMAC"),
    ],
  },
  {
    id: "media",
    name: { en: "Media", vi: "Phương tiện" },
    tools: [
      tool("photo-cure", "Photo Cure", "Lọc ảnh", "ready"),
      tool("photo-collage", "Photo collage", "Ghép ảnh (collage)"),
    ],
  },
];

export const plannedToolCount = groupCatalog.reduce(
  (total, group) => total + group.tools.length,
  0,
);
