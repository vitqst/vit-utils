import type { LocalizedText, ToolDefinition, ToolGroup } from "./types";

export type ToolCatalogEntry = Omit<ToolDefinition, "load">;

function text(en: string, vi: string): LocalizedText {
  return { en, vi };
}

function tool<const Id extends string>(
  id: Id,
  group: ToolGroup,
  name: LocalizedText,
  description: LocalizedText,
  keywords: Record<"en" | "vi", string[]>,
  status: ToolCatalogEntry["status"] = "planned",
): ToolCatalogEntry {
  return {
    id,
    group,
    name,
    description,
    keywords,
    icon: "aperture",
    path: `/tools/${id}`,
    privacy: "local-only",
    status,
  };
}

export const toolCatalog = [
  tool(
    "case-convert",
    "text",
    text("Case converter", "Đổi kiểu chữ"),
    text(
      "Convert text between sentence, title, camel, Pascal, snake, kebab, and constant case.",
      "Đổi văn bản sang kiểu câu, tiêu đề, camel, Pascal, snake, kebab và hằng số.",
    ),
    {
      en: ["case", "uppercase", "lowercase", "camel", "snake", "title"],
      vi: ["kiểu chữ", "chữ hoa", "chữ thường", "camel", "snake", "tiêu đề"],
    },
    "ready",
  ),
  tool(
    "slugify",
    "text",
    text("Slug & Vietnamese accents", "Slug & bỏ dấu"),
    text(
      "Create clean URL slugs or remove Vietnamese diacritics from text.",
      "Tạo slug URL gọn hoặc bỏ dấu tiếng Việt khỏi văn bản.",
    ),
    {
      en: ["slug", "url", "Vietnamese", "diacritics", "accents"],
      vi: ["slug", "url", "bỏ dấu", "tiếng Việt"],
    },
    "ready",
  ),
  tool(
    "diff",
    "text",
    text("Text diff", "So sánh (diff)"),
    text(
      "Compare two texts line by line and inspect additions, removals, and changes.",
      "So sánh hai văn bản theo từng dòng và xem phần thêm, xóa, thay đổi.",
    ),
    {
      en: ["diff", "compare", "text", "lines", "changes"],
      vi: ["so sánh", "văn bản", "dòng", "thay đổi"],
    },
    "ready",
  ),
  tool(
    "word-count",
    "text",
    text("Word & character count", "Đếm từ & ký tự"),
    text(
      "Count words, characters, sentences, lines, and estimated reading time.",
      "Đếm từ, ký tự, câu, dòng và thời gian đọc ước tính.",
    ),
    {
      en: ["word count", "characters", "sentences", "reading time"],
      vi: ["đếm từ", "ký tự", "câu", "thời gian đọc"],
    },
    "ready",
  ),
  tool(
    "line-tools",
    "text",
    text("Sort & dedupe lines", "Sắp xếp & lọc dòng"),
    text(
      "Sort, reverse, trim, and remove duplicate or blank lines.",
      "Sắp xếp, đảo, cắt khoảng trắng và loại dòng trùng hoặc trống.",
    ),
    {
      en: ["sort", "dedupe", "lines", "unique", "reverse"],
      vi: ["sắp xếp", "lọc trùng", "dòng", "đảo"],
    },
    "ready",
  ),
  tool(
    "regex",
    "text",
    text("Regex tester", "Kiểm thử Regex"),
    text(
      "Test regular expressions locally with flags, match details, and highlighted results.",
      "Kiểm thử biểu thức chính quy cục bộ với cờ, chi tiết và kết quả được đánh dấu.",
    ),
    {
      en: ["regex", "regular expression", "matches", "flags"],
      vi: ["regex", "biểu thức chính quy", "kết quả", "cờ"],
    },
    "ready",
  ),
  tool(
    "lorem",
    "text",
    text("Lorem Ipsum", "Lorem Ipsum"),
    text(
      "Generate placeholder words, sentences, or paragraphs with predictable limits.",
      "Tạo từ, câu hoặc đoạn văn mẫu với giới hạn rõ ràng.",
    ),
    {
      en: ["lorem ipsum", "placeholder", "generator", "paragraph"],
      vi: ["lorem ipsum", "văn bản mẫu", "tạo đoạn văn"],
    },
    "ready",
  ),
  tool(
    "unicode",
    "text",
    text("Unicode inspector", "Soi Unicode"),
    text(
      "Inspect Unicode code points, UTF-16 units, graphemes, and invisible characters.",
      "Soi mã Unicode, đơn vị UTF-16, cụm ký tự và ký tự vô hình.",
    ),
    {
      en: ["Unicode", "code point", "UTF-16", "grapheme", "invisible"],
      vi: ["Unicode", "mã ký tự", "UTF-16", "ký tự vô hình"],
    },
    "ready",
  ),
  tool(
    "json",
    "developer",
    text("JSON formatter", "JSON Formatter"),
    text(
      "Validate, format, sort, and minify JSON with precise error locations.",
      "Kiểm tra, định dạng, sắp xếp và thu gọn JSON với vị trí lỗi chính xác.",
    ),
    { en: ["JSON", "format", "validate", "minify"], vi: ["JSON", "định dạng", "kiểm tra", "thu gọn"] },
  ),
  tool(
    "base64",
    "developer",
    text("Base64", "Base64"),
    text(
      "Encode and decode UTF-8 text or local files as Base64.",
      "Mã hóa và giải mã văn bản UTF-8 hoặc tệp cục bộ bằng Base64.",
    ),
    { en: ["Base64", "encode", "decode", "file"], vi: ["Base64", "mã hóa", "giải mã", "tệp"] },
  ),
  tool(
    "data-convert",
    "developer",
    text("JSON ↔ YAML ↔ CSV", "JSON ↔ YAML ↔ CSV"),
    text(
      "Convert structured data between JSON, YAML, and CSV formats.",
      "Chuyển đổi dữ liệu có cấu trúc giữa JSON, YAML và CSV.",
    ),
    { en: ["JSON", "YAML", "CSV", "convert"], vi: ["JSON", "YAML", "CSV", "chuyển đổi"] },
  ),
  tool(
    "jwt",
    "developer",
    text("JWT decoder", "Giải mã JWT"),
    text(
      "Decode JWT headers and payloads and inspect time-based claims without verification.",
      "Giải mã header, payload JWT và xem các claim thời gian mà không xác minh chữ ký.",
    ),
    { en: ["JWT", "token", "decode", "claims"], vi: ["JWT", "token", "giải mã", "claim"] },
  ),
  tool(
    "sql",
    "developer",
    text("SQL formatter", "Định dạng SQL"),
    text(
      "Format common SQL dialects for readable local editing.",
      "Định dạng các phương ngữ SQL phổ biến để chỉnh sửa dễ đọc.",
    ),
    { en: ["SQL", "format", "query", "database"], vi: ["SQL", "định dạng", "truy vấn", "cơ sở dữ liệu"] },
  ),
  tool(
    "cron",
    "developer",
    text("Cron builder", "Cron builder"),
    text(
      "Build cron expressions and preview upcoming local run times.",
      "Tạo biểu thức cron và xem trước các lần chạy sắp tới theo giờ địa phương.",
    ),
    { en: ["cron", "schedule", "next run"], vi: ["cron", "lịch chạy", "lần chạy tiếp"] },
  ),
  tool(
    "curl",
    "developer",
    text("curl → code", "curl → code"),
    text(
      "Convert curl commands into browser fetch and common language snippets.",
      "Chuyển lệnh curl thành fetch trình duyệt và mã cho các ngôn ngữ phổ biến.",
    ),
    { en: ["curl", "fetch", "HTTP", "code"], vi: ["curl", "fetch", "HTTP", "mã nguồn"] },
  ),
  tool(
    "json-types",
    "developer",
    text("JSON → TypeScript", "JSON → TypeScript"),
    text(
      "Infer readable TypeScript interfaces from JSON samples.",
      "Suy luận interface TypeScript dễ đọc từ mẫu JSON.",
    ),
    { en: ["JSON", "TypeScript", "types", "interface"], vi: ["JSON", "TypeScript", "kiểu", "interface"] },
  ),
  tool(
    "timestamp",
    "date-time",
    text("Unix timestamp", "Unix Timestamp"),
    text(
      "Convert Unix seconds or milliseconds to local and UTC dates.",
      "Đổi giây hoặc mili giây Unix thành ngày giờ địa phương và UTC.",
    ),
    { en: ["Unix", "timestamp", "epoch", "UTC"], vi: ["Unix", "timestamp", "epoch", "UTC"] },
  ),
  tool(
    "lunar",
    "date-time",
    text("Lunar calendar", "Đổi lịch âm"),
    text(
      "Convert between Vietnamese lunar and Gregorian calendar dates.",
      "Chuyển đổi ngày giữa âm lịch Việt Nam và dương lịch.",
    ),
    { en: ["lunar", "calendar", "Vietnamese", "Gregorian"], vi: ["âm lịch", "dương lịch", "ngày tháng"] },
  ),
  tool(
    "timezone",
    "date-time",
    text("Timezone converter", "Đổi múi giờ"),
    text(
      "Compare one moment across IANA time zones with daylight-saving rules.",
      "So sánh cùng một thời điểm giữa các múi giờ IANA có quy tắc giờ mùa hè.",
    ),
    { en: ["timezone", "IANA", "UTC", "DST"], vi: ["múi giờ", "IANA", "UTC", "giờ mùa hè"] },
  ),
  tool(
    "date-diff",
    "date-time",
    text("Date difference", "Khoảng cách ngày"),
    text(
      "Measure exact calendar and elapsed differences between two dates.",
      "Tính chênh lệch theo lịch và thời gian thực giữa hai ngày.",
    ),
    { en: ["date", "difference", "days", "elapsed"], vi: ["ngày", "khoảng cách", "chênh lệch"] },
  ),
  tool(
    "duration",
    "date-time",
    text("Duration humanizer", "Diễn giải thời lượng"),
    text(
      "Convert durations between milliseconds, clock notation, and readable text.",
      "Đổi thời lượng giữa mili giây, dạng đồng hồ và văn bản dễ đọc.",
    ),
    { en: ["duration", "milliseconds", "humanize", "time"], vi: ["thời lượng", "mili giây", "diễn giải"] },
  ),
  tool(
    "working-days",
    "date-time",
    text("Working days", "Tính ngày làm việc"),
    text(
      "Count working days with configurable weekends and local holiday dates.",
      "Đếm ngày làm việc với cuối tuần tùy chọn và danh sách ngày nghỉ.",
    ),
    { en: ["working days", "business days", "weekend", "holiday"], vi: ["ngày làm việc", "cuối tuần", "ngày nghỉ"] },
  ),
  tool(
    "ids",
    "generators",
    text("UUID / ULID / NanoID", "UUID / ULID / NanoID"),
    text(
      "Generate cryptographically random UUIDs, ULIDs, and NanoIDs.",
      "Tạo UUID, ULID và NanoID ngẫu nhiên bằng nguồn mật mã.",
    ),
    { en: ["UUID", "ULID", "NanoID", "identifier"], vi: ["UUID", "ULID", "NanoID", "định danh"] },
  ),
  tool(
    "password",
    "generators",
    text("Password generator", "Tạo mật khẩu"),
    text(
      "Generate strong passwords or passphrases with explicit character controls.",
      "Tạo mật khẩu hoặc cụm mật khẩu mạnh với tùy chọn ký tự rõ ràng.",
    ),
    { en: ["password", "passphrase", "random", "generator"], vi: ["mật khẩu", "cụm mật khẩu", "ngẫu nhiên"] },
  ),
  tool(
    "qr",
    "generators",
    text("QR code", "Mã QR"),
    text(
      "Generate downloadable QR codes from text, links, Wi-Fi, or contact data.",
      "Tạo mã QR tải xuống từ văn bản, liên kết, Wi-Fi hoặc thông tin liên hệ.",
    ),
    { en: ["QR", "code", "Wi-Fi", "download"], vi: ["QR", "mã", "Wi-Fi", "tải xuống"] },
  ),
  tool(
    "barcode",
    "generators",
    text("Barcode", "Mã vạch"),
    text(
      "Generate and validate common one-dimensional barcode formats.",
      "Tạo và kiểm tra các định dạng mã vạch một chiều phổ biến.",
    ),
    { en: ["barcode", "Code 128", "EAN", "UPC"], vi: ["mã vạch", "Code 128", "EAN", "UPC"] },
  ),
  tool(
    "mock",
    "generators",
    text("Mock data", "Dữ liệu giả"),
    text(
      "Generate configurable names, addresses, dates, and structured sample records.",
      "Tạo tên, địa chỉ, ngày tháng và bản ghi mẫu có thể tùy chỉnh.",
    ),
    { en: ["mock", "fake data", "sample", "JSON"], vi: ["dữ liệu giả", "mẫu", "JSON"] },
  ),
  tool(
    "meta",
    "generators",
    text("Meta tags & OG preview", "Meta tags & OG preview"),
    text(
      "Build page metadata and preview Open Graph social cards.",
      "Tạo metadata trang và xem trước thẻ mạng xã hội Open Graph.",
    ),
    { en: ["meta tags", "Open Graph", "SEO", "preview"], vi: ["meta", "Open Graph", "SEO", "xem trước"] },
  ),
  tool(
    "favicon",
    "generators",
    text("Favicon set", "Bộ favicon"),
    text(
      "Create a local favicon package and manifest assets from one image.",
      "Tạo gói favicon và tài nguyên manifest cục bộ từ một ảnh.",
    ),
    { en: ["favicon", "icon", "manifest", "image"], vi: ["favicon", "biểu tượng", "manifest", "ảnh"] },
  ),
  tool(
    "pdf",
    "files",
    text("Merge / split PDF", "Gộp / tách PDF"),
    text(
      "Merge, split, reorder, or rotate local PDF pages.",
      "Gộp, tách, sắp xếp lại hoặc xoay các trang PDF cục bộ.",
    ),
    { en: ["PDF", "merge", "split", "rotate"], vi: ["PDF", "gộp", "tách", "xoay"] },
  ),
  tool(
    "pdf-image",
    "files",
    text("PDF ↔ image", "PDF ↔ ảnh"),
    text(
      "Render PDF pages to images or combine images into a PDF.",
      "Kết xuất trang PDF thành ảnh hoặc ghép ảnh thành PDF.",
    ),
    { en: ["PDF", "image", "PNG", "JPEG"], vi: ["PDF", "ảnh", "PNG", "JPEG"] },
  ),
  tool(
    "sheets",
    "files",
    text("CSV ↔ XLSX", "CSV ↔ XLSX"),
    text(
      "Convert local CSV and Excel workbooks with sheet previews.",
      "Chuyển đổi CSV và bảng tính Excel cục bộ với bản xem trước sheet.",
    ),
    { en: ["CSV", "XLSX", "Excel", "spreadsheet"], vi: ["CSV", "XLSX", "Excel", "bảng tính"] },
  ),
  tool(
    "zip",
    "files",
    text("Zip / unzip", "Nén / giải nén ZIP"),
    text(
      "Create and inspect ZIP archives locally with safe extraction controls.",
      "Tạo và xem tệp ZIP cục bộ với kiểm soát giải nén an toàn.",
    ),
    { en: ["ZIP", "archive", "compress", "extract"], vi: ["ZIP", "nén", "giải nén", "tệp"] },
  ),
  tool(
    "checksum",
    "files",
    text("File checksum", "Checksum tệp"),
    text(
      "Calculate and compare checksums for local files without uploading them.",
      "Tính và so sánh checksum cho tệp cục bộ mà không tải lên.",
    ),
    { en: ["checksum", "SHA-256", "file", "verify"], vi: ["checksum", "SHA-256", "tệp", "xác minh"] },
  ),
  tool(
    "hash",
    "security",
    text("SHA / MD5 hashes", "Băm SHA / MD5"),
    text(
      "Hash text with common digest algorithms and identify likely hash formats.",
      "Băm văn bản bằng thuật toán phổ biến và nhận diện định dạng hash có thể có.",
    ),
    { en: ["hash", "SHA", "MD5", "digest"], vi: ["băm", "SHA", "MD5", "digest"] },
  ),
  tool(
    "strength",
    "security",
    text("Password strength", "Độ mạnh mật khẩu"),
    text(
      "Estimate password strength locally and explain actionable weaknesses.",
      "Ước tính độ mạnh mật khẩu cục bộ và giải thích điểm yếu cần cải thiện.",
    ),
    { en: ["password", "strength", "entropy", "security"], vi: ["mật khẩu", "độ mạnh", "entropy", "bảo mật"] },
  ),
  tool(
    "hibp",
    "security",
    text("Breach check (HIBP)", "Kiểm tra rò rỉ (HIBP)"),
    text(
      "Check a password against breach data using a disclosed k-anonymity prefix request.",
      "Kiểm tra mật khẩu trong dữ liệu rò rỉ bằng yêu cầu tiền tố k-anonymity được công khai.",
    ),
    { en: ["HIBP", "breach", "password", "k-anonymity"], vi: ["HIBP", "rò rỉ", "mật khẩu", "k-anonymity"] },
  ),
  tool(
    "certificate",
    "security",
    text("X.509 decoder", "Giải mã chứng chỉ X.509"),
    text(
      "Decode PEM or DER X.509 certificates and inspect fields locally.",
      "Giải mã chứng chỉ X.509 PEM hoặc DER và xem các trường cục bộ.",
    ),
    { en: ["X.509", "certificate", "PEM", "DER"], vi: ["X.509", "chứng chỉ", "PEM", "DER"] },
  ),
  tool(
    "hmac",
    "security",
    text("HMAC", "HMAC"),
    text(
      "Calculate HMAC signatures locally with standard hash algorithms.",
      "Tính chữ ký HMAC cục bộ bằng các thuật toán băm tiêu chuẩn.",
    ),
    { en: ["HMAC", "signature", "SHA", "secret"], vi: ["HMAC", "chữ ký", "SHA", "bí mật"] },
  ),
  tool(
    "photo-cure",
    "media",
    text("Photo Cure", "Lọc ảnh"),
    text(
      "Cull a shoot quickly, compare bursts, and keep only the frames you want.",
      "Lọc nhanh một bộ ảnh, so sánh ảnh chụp liên tiếp và chỉ giữ khung hình bạn muốn.",
    ),
    {
      en: ["photo", "cull", "burst", "image", "picker", "offline"],
      vi: ["ảnh", "lọc ảnh", "chụp liên tiếp", "ngoại tuyến"],
    },
    "ready",
  ),
  tool(
    "photo-collage",
    "media",
    text("Photo collage", "Ghép ảnh (collage)"),
    text(
      "Arrange local photos into a customizable downloadable collage.",
      "Sắp xếp ảnh cục bộ thành ảnh ghép tùy chỉnh để tải xuống.",
    ),
    { en: ["photo", "collage", "grid", "image"], vi: ["ảnh", "ghép ảnh", "lưới", "collage"] },
  ),
] satisfies ToolCatalogEntry[];
