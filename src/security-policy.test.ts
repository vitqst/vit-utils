import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("hosting security policy", () => {
  it("allows only the reviewed HIBP origin beyond same-origin connections", () => {
    const firebase = JSON.parse(
      readFileSync(resolve(process.cwd(), "firebase.json"), "utf8"),
    );
    const csp = firebase.hosting.headers
      .flatMap((entry: { headers: { key: string; value: string }[] }) => entry.headers)
      .find((header: { key: string }) => header.key === "Content-Security-Policy")
      .value as string;

    expect(csp).toContain(
      "connect-src 'self' https://api.pwnedpasswords.com;",
    );
    expect(csp.match(/https?:\/\//g)).toHaveLength(1);
  });
});
