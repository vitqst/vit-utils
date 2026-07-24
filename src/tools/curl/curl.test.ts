import { describe, expect, it } from "vitest";

import { convertCurl, parseCurlCommand, tokenizeCurl } from "./curl";

describe("curl parser", () => {
  it("tokenizes quotes, escapes, and line continuations", () => {
    expect(
      tokenizeCurl(
        "curl \\\n  'https://example.com/a b' -H \"X-Name: An\\\" A\"",
      ),
    ).toEqual([
      "curl",
      "https://example.com/a b",
      "-H",
      'X-Name: An" A',
    ]);
  });

  it("parses repeated headers, implicit POST, JSON, and basic auth", () => {
    const request = parseCurlCommand(
      "curl https://example.com/users -H 'X-ID: 1' -H 'X-ID: 2' -u 'an:s3cret' --json '{\"name\":\"An\"}'",
    );

    expect(request.url).toBe("https://example.com/users");
    expect(request.method).toBe("POST");
    expect(request.body).toBe('{"name":"An"}');
    expect(request.headers).toEqual([
      ["X-ID", "1"],
      ["X-ID", "2"],
      ["Authorization", "Basic YW46czNjcmV0"],
      ["Content-Type", "application/json"],
      ["Accept", "application/json"],
    ]);
  });

  it("moves data into the query for GET mode", () => {
    const request = parseCurlCommand(
      "curl -G 'https://example.com/search?q=old' -d 'q=x y'",
    );
    expect(request).toMatchObject({
      url: "https://example.com/search?q=old&q=x+y",
      method: "GET",
    });
    expect(request).not.toHaveProperty("body");
  });

  it.each([
    "curl https://example.com -d @payload.json",
    "curl https://example.com $(whoami)",
    "curl https://example.com `whoami`",
    "curl https://example.com --output result.txt",
    "curl https://example.com -H",
  ])("rejects unsafe or unsupported input: %s", (source) => {
    expect(() => parseCurlCommand(source)).toThrow();
  });
});

describe("curl generators", () => {
  const source =
    "curl 'https://api.example.com/a?x=1' -X PATCH -H 'X-Name: A\"B' -d 'line\\n2'";

  it.each([
    ["browser-fetch", /fetch\("https:\/\/api\.example\.com/],
    ["node-fetch", /import fetch from "node-fetch"/],
    ["python", /requests\.request\(/],
    ["php", /curl_setopt_array/],
  ] as const)("generates %s code with escaped values", (target, pattern) => {
    const output = convertCurl(source, target);
    expect(output).toMatch(pattern);
    expect(output).toContain("PATCH");
    expect(output).toContain("X-Name");
  });
});
