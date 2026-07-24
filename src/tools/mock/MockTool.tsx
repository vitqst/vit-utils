import { useMemo, useState } from "react";

import {
  CopyButton,
  ToolOutput,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  generateMockData,
  mockDataToCsv,
  type MockField,
} from "./mock";

type OutputFormat = "json" | "csv";

const copy = {
  en: {
    title: "Mock data",
    description:
      "Generate repeatable synthetic records from built-in English and Vietnamese dictionaries.",
    settings: "Generator settings",
    dataLocale: "Data language",
    count: "Record count",
    seed: "Seed",
    format: "Output format",
    fields: "Fields",
    result: "Generated mock data",
    empty: "Generated records appear here.",
    copy: "Copy data",
    copied: "Copied",
    copyFailed: "Copy failed",
    download: "Download data",
    labels: {
      id: "ID",
      name: "Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      company: "Company",
      date: "Date",
    },
  },
  vi: {
    title: "Dữ liệu giả",
    description:
      "Tạo bản ghi giả có thể lặp lại từ từ điển tiếng Anh và tiếng Việt tích hợp.",
    settings: "Cài đặt trình tạo",
    dataLocale: "Ngôn ngữ dữ liệu",
    count: "Số bản ghi",
    seed: "Hạt giống",
    format: "Định dạng đầu ra",
    fields: "Các trường",
    result: "Dữ liệu giả đã tạo",
    empty: "Bản ghi đã tạo sẽ hiện ở đây.",
    copy: "Sao chép dữ liệu",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    download: "Tải dữ liệu",
    labels: {
      id: "ID",
      name: "Tên",
      email: "Email",
      phone: "Điện thoại",
      address: "Địa chỉ",
      company: "Công ty",
      date: "Ngày",
    },
  },
} as const;

const allFields: MockField[] = [
  "id",
  "name",
  "email",
  "phone",
  "address",
  "company",
  "date",
];

export default function MockTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [dataLocale, setDataLocale] = useState<"en" | "vi">(locale);
  const [count, setCount] = useState("5");
  const [seed, setSeed] = useState("vit-tools");
  const [format, setFormat] = useState<OutputFormat>("json");
  const [fields, setFields] = useState<MockField[]>(allFields);
  const result = useMemo(() => {
    try {
      const records = generateMockData({
        count: Number(count),
        locale: dataLocale,
        seed,
        fields,
      });
      return {
        output:
          format === "json"
            ? JSON.stringify(records, null, 2)
            : mockDataToCsv(records),
        error: "",
      };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [count, dataLocale, fields, format, seed]);
  const extension = format === "json" ? "json" : "csv";

  const toggleField = (field: MockField) => {
    setFields((current) =>
      current.includes(field)
        ? current.filter((value) => value !== field)
        : allFields.filter(
            (candidate) => candidate === field || current.includes(candidate),
          ),
    );
  };

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        <ToolPanel title={t.settings}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.dataLocale}
              <select
                aria-label={t.dataLocale}
                value={dataLocale}
                onChange={(event) =>
                  setDataLocale(event.target.value as "en" | "vi")
                }
                className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.format}
              <select
                aria-label={t.format}
                value={format}
                onChange={(event) =>
                  setFormat(event.target.value as OutputFormat)
                }
                className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.count}
            <input
              type="number"
              aria-label={t.count}
              min={1}
              max={1000}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 font-mono text-sm text-[var(--vt-text)]"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.seed}
            <input
              aria-label={t.seed}
              value={seed}
              maxLength={128}
              onChange={(event) => setSeed(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 font-mono text-sm text-[var(--vt-text)]"
            />
          </label>
          <fieldset className="mt-4">
            <legend className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.fields}
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {allFields.map((field) => (
                <label
                  key={field}
                  className="flex items-center gap-2 text-sm text-[var(--vt-text)]"
                >
                  <input
                    type="checkbox"
                    checked={fields.includes(field)}
                    onChange={() => toggleField(field)}
                  />
                  {t.labels[field]}
                </label>
              ))}
            </div>
          </fieldset>
        </ToolPanel>
        <ToolPanel title={t.result}>
          {result.error ? (
            <p role="alert" className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 text-xs text-[var(--vt-red)]">
              {result.error}
            </p>
          ) : (
            <ToolOutput
              label={t.result}
              value={result.output}
              emptyLabel={t.empty}
            />
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CopyButton
              value={result.output}
              label={t.copy}
              copiedLabel={t.copied}
              failedLabel={t.copyFailed}
            />
            {result.output ? (
              <a
                href={`data:text/${format};charset=utf-8,${encodeURIComponent(result.output)}`}
                download={`mock-data.${extension}`}
                className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]"
              >
                {t.download}
              </a>
            ) : null}
          </div>
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

