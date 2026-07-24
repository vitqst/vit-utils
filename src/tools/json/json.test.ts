import { describe, expect, it } from "vitest";

import { transformJson } from "./json";

describe("JSON transformation", () => {
  it("formats JSON and recursively sorts object keys without reordering arrays", () => {
    expect(
      transformJson('{"b":1,"a":{"d":2,"c":3},"items":[{"z":1,"a":2}]}', {
        mode: "format",
        indent: 2,
        sortKeys: true,
      }),
    ).toEqual({
      output:
        '{\n  "a": {\n    "c": 3,\n    "d": 2\n  },\n  "b": 1,\n  "items": [\n    {\n      "a": 2,\n      "z": 1\n    }\n  ]\n}',
      error: null,
    });
  });

  it("minifies valid JSON", () => {
    expect(
      transformJson('{ "message": "Xin chào", "ok": true }', {
        mode: "minify",
      }),
    ).toEqual({
      output: '{"message":"Xin chào","ok":true}',
      error: null,
    });
  });

  it("returns a one-based location for invalid JSON", () => {
    const result = transformJson('{\n  "ok": true,\n}', { mode: "format" });

    expect(result.output).toBe("");
    expect(result.error?.message).toBeTruthy();
    expect(result.error).toMatchObject({ line: 3, column: 1 });
  });

  it("treats whitespace-only input as empty", () => {
    expect(transformJson(" \n ", { mode: "format" })).toEqual({
      output: "",
      error: null,
    });
  });
});

