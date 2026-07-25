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

describe("local Firebase deployment", () => {
  it("uses a reusable Hosting target instead of a committed project site", () => {
    const firebase = JSON.parse(
      readFileSync(resolve(process.cwd(), "firebase.json"), "utf8"),
    );
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
    );
    const gitignore = readFileSync(
      resolve(process.cwd(), ".gitignore"),
      "utf8",
    );

    expect(firebase.hosting.target).toBe("app");
    expect(firebase.hosting).not.toHaveProperty("site");
    expect(packageJson.scripts.deploy).toBe(
      "npm run check && firebase deploy --only hosting:app",
    );
    expect(gitignore).toContain(".firebaserc");
    expect(gitignore).toContain(".firebase/");
  });
});
