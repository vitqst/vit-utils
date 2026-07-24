import { describe, expect, it } from "vitest";

import {
  buildContactPayload,
  buildQrPayload,
  buildWifiPayload,
  generateQrSvg,
} from "./qr";

describe("QR payloads and rendering", () => {
  it("builds escaped Wi-Fi and vCard payloads", () => {
    expect(
      buildWifiPayload({
        security: "WPA",
        ssid: "Cafe;Guest",
        password: "p:a\\ss",
        hidden: true,
      }),
    ).toBe("WIFI:T:WPA;S:Cafe\\;Guest;P:p\\:a\\\\ss;H:true;;");
    expect(
      buildContactPayload({
        name: "An, Nguyễn",
        phone: "+84 123",
        email: "an@example.com",
        organization: "Vịt;Tools",
      }),
    ).toContain(
      "FN:An\\, Nguyễn\nORG:Vịt\\;Tools\nTEL:+84 123\nEMAIL:an@example.com",
    );
  });

  it("validates URL and text payloads", () => {
    expect(buildQrPayload("url", { text: "https://example.com/a" })).toBe(
      "https://example.com/a",
    );
    expect(() => buildQrPayload("url", { text: "example.com" })).toThrow(
      /HTTP/i,
    );
    expect(() => buildQrPayload("text", { text: "" })).toThrow();
  });

  it("renders a complete SVG with configured colors", async () => {
    const svg = await generateQrSvg("Xin chào", {
      width: 256,
      margin: 2,
      dark: "#112233",
      light: "#ffffff",
      errorCorrectionLevel: "H",
    });
    expect(svg).toMatch(/^<svg/);
    expect(svg).toContain("#112233");
    expect(svg).toContain('width="256"');
  });

  it("rejects invalid rendering options", async () => {
    await expect(
      generateQrSvg("ok", {
        width: 20,
        margin: 2,
        dark: "#000000",
        light: "#ffffff",
        errorCorrectionLevel: "M",
      }),
    ).rejects.toThrow(/128/);
  });
});

