import { describe, expect, it } from "vitest";

import { jsonToTypeScript } from "./json-types";

describe("jsonToTypeScript", () => {
  it("merges object samples and marks missing properties optional", () => {
    const output = jsonToTypeScript(
      '[{"id":1,"name":"An"},{"id":2}]',
      "User",
      "interface",
    );

    expect(output).toContain("interface User {");
    expect(output).toContain("id: number;");
    expect(output).toContain("name?: string;");
  });

  it("emits deterministic nested declarations and safe property names", () => {
    const output = jsonToTypeScript(
      '{"user":{"display-name":"An","active":true},"tags":["a"]}',
      "Api Response",
      "interface",
    );

    expect(output).toContain("interface ApiResponse {");
    expect(output).toContain("user: User;");
    expect(output).toContain("tags: string[];");
    expect(output).toContain('interface User {');
    expect(output).toContain('"display-name": string;');
  });

  it("supports heterogeneous arrays, null, empty arrays, and primitives", () => {
    expect(
      jsonToTypeScript('{"values":[1,"x",null],"empty":[]}', "Data", "type"),
    ).toMatch(/values: \(number \| string \| null\)\[\];/);
    expect(
      jsonToTypeScript('{"values":[1,"x",null],"empty":[]}', "Data", "type"),
    ).toContain("empty: unknown[];");
    expect(jsonToTypeScript("true", "Result", "interface")).toBe(
      "type Result = boolean;",
    );
  });

  it("rejects invalid JSON and sanitizes invalid root names", () => {
    expect(() => jsonToTypeScript("{", "Root", "interface")).toThrow();
    expect(jsonToTypeScript('{"ok":true}', "123", "interface")).toContain(
      "interface Type123",
    );
  });
});

