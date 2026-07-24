export type MockField =
  | "id"
  | "name"
  | "email"
  | "phone"
  | "address"
  | "company"
  | "date";

export interface MockOptions {
  count: number;
  locale: "en" | "vi";
  seed: string;
  fields: MockField[];
}

export type MockRecord = Partial<Record<MockField, string>>;

const dictionaries = {
  en: {
    first: ["Alex", "Avery", "Casey", "Jordan", "Morgan", "Riley", "Taylor", "Sam"],
    last: ["Baker", "Clark", "Davis", "Evans", "Green", "Hill", "Lee", "Young"],
    streets: ["Maple Street", "River Road", "Cedar Avenue", "Market Lane"],
    cities: ["Northfield", "Lakeview", "Fairview", "Riverton"],
    companies: ["Acorn Studio", "Blue Harbor", "Cedar Labs", "Northwind Works"],
  },
  vi: {
    first: ["An", "Bình", "Chi", "Dũng", "Giang", "Hà", "Linh", "Minh"],
    last: ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi"],
    streets: ["đường Nguyễn Trãi", "đường Lê Lợi", "đường Trần Hưng Đạo", "đường Võ Thị Sáu"],
    cities: ["Hà Nội", "Đà Nẵng", "Huế", "Cần Thơ"],
    companies: ["Công ty Mây", "Xưởng Tre", "Vịt Studio", "Phòng lab Sông"],
  },
} as const;

function createRandom(seed: string) {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }
  state >>>= 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4_294_967_296;
  };
}

function choose<T>(values: readonly T[], random: () => number) {
  return values[Math.floor(random() * values.length)];
}

function emailPart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
}

export function generateMockData(options: MockOptions): MockRecord[] {
  if (!Number.isInteger(options.count) || options.count < 1 || options.count > 1000) {
    throw new Error("Mock record count must be an integer from 1 through 1,000.");
  }
  if (!options.seed || options.seed.length > 128) {
    throw new Error("Seed must contain 1–128 characters.");
  }
  if (!options.fields.length) throw new Error("Select at least one mock field.");
  const fields = [...new Set(options.fields)];
  const words = dictionaries[options.locale];
  const random = createRandom(`${options.seed}:${options.locale}`);
  const startDate = Date.UTC(2020, 0, 1);
  const dayRange = 4018;

  return Array.from({ length: options.count }, (_, index) => {
    const first = choose(words.first, random);
    const last = choose(words.last, random);
    const name =
      options.locale === "vi" ? `${last} ${first}` : `${first} ${last}`;
    const sequence = String(index + 1).padStart(4, "0");
    const values: Record<MockField, string> = {
      id: `mock_${sequence}_${Math.floor(random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")}`,
      name,
      email: `${emailPart(first)}.${emailPart(last)}${index + 1}@example.${index % 2 ? "test" : "com"}`,
      phone:
        options.locale === "vi"
          ? `+84 9${String(Math.floor(random() * 100_000_000)).padStart(8, "0")}`
          : `+1 555 ${String(Math.floor(random() * 10_000)).padStart(4, "0")}`,
      address: `${Math.floor(random() * 900) + 1} ${choose(words.streets, random)}, ${choose(words.cities, random)}`,
      company: choose(words.companies, random),
      date: new Date(
        startDate + Math.floor(random() * dayRange) * 86_400_000,
      )
        .toISOString()
        .slice(0, 10),
    };
    return Object.fromEntries(fields.map((field) => [field, values[field]]));
  });
}

function csvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function mockDataToCsv(records: MockRecord[]) {
  if (!records.length) return "";
  const headers = Object.keys(records[0]) as MockField[];
  return [
    headers.join(","),
    ...records.map((record) =>
      headers.map((header) => csvCell(record[header] ?? "")).join(","),
    ),
  ].join("\r\n");
}

