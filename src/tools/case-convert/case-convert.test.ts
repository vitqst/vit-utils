import { describe, expect, it } from "vitest";

import { convertCase, splitWords } from "./case-convert";

describe("case conversion", () => {
  it("finds separator, camel-case, and acronym word boundaries", () => {
    expect(splitWords("helloWorld HTTPServer_test-value")).toEqual([
      "hello",
      "World",
      "HTTP",
      "Server",
      "test",
      "value",
    ]);
  });

  it.each([
    ["sentence", "Hello world http server"],
    ["title", "Hello World Http Server"],
    ["upper", "HELLOWORLD HTTP_SERVER"],
    ["lower", "helloworld http_server"],
    ["camel", "helloWorldHttpServer"],
    ["pascal", "HelloWorldHttpServer"],
    ["snake", "hello_world_http_server"],
    ["kebab", "hello-world-http-server"],
    ["constant", "HELLO_WORLD_HTTP_SERVER"],
  ] as const)("converts text to %s case", (style, expected) => {
    expect(convertCase("helloWorld HTTP_server", style, "en")).toBe(expected);
  });

  it("preserves Vietnamese letters in naming cases", () => {
    expect(convertCase("  Xin Chào_thế giới  ", "kebab", "vi")).toBe(
      "xin-chào-thế-giới",
    );
  });

  it("returns an empty result for empty input", () => {
    expect(convertCase(" \n ", "camel", "en")).toBe("");
  });
});

