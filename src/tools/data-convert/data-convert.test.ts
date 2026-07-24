import { describe, expect, it } from "vitest";

import { convertData, parseCsv, stringifyCsv } from "./data-convert";

describe("structured data conversion", () => {
  it("parses quoted CSV commas, doubled quotes, and embedded newlines", () => {
    expect(
      parseCsv('name,note\r\n"Nguyễn, An","Said ""hi""\nagain"\r\n'),
    ).toEqual([
      { name: "Nguyễn, An", note: 'Said "hi"\nagain' },
    ]);
  });

  it("converts CSV records to formatted JSON", () => {
    expect(
      convertData('name,age\n"Nguyễn, An",30', "csv", "json"),
    ).toBe(
      '[\n  {\n    "name": "Nguyễn, An",\n    "age": "30"\n  }\n]',
    );
  });

  it("stringifies record arrays with deterministic headers and quoting", () => {
    expect(
      stringifyCsv([
        { name: "An", note: "one,two" },
        { name: "Bình", age: 30 },
      ]),
    ).toBe('name,note,age\r\nAn,"one,two",\r\nBình,,30');
  });

  it("round-trips JSON-compatible values through YAML", () => {
    const yaml = convertData(
      '{"person":{"name":"An","active":true},"items":[1,2]}',
      "json",
      "yaml",
    );
    expect(yaml).toContain("person:");
    expect(convertData(yaml, "yaml", "json")).toBe(
      '{\n  "person": {\n    "name": "An",\n    "active": true\n  },\n  "items": [\n    1,\n    2\n  ]\n}',
    );
  });

  it("rejects duplicate YAML keys and uneven CSV rows", () => {
    expect(() => convertData("name: An\nname: Bình", "yaml", "json")).toThrow(
      /duplicate|map keys/i,
    );
    expect(() => parseCsv("a,b\n1")).toThrow(/columns/i);
  });

  it("rejects nested values when converting to CSV", () => {
    expect(() =>
      convertData('[{"name":"An","tags":["one"]}]', "json", "csv"),
    ).toThrow(/nested|primitive/i);
  });
});

