import "@testing-library/jest-dom/vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("../tools/photo-cure", () => ({
  default: ({ locale }: { locale: "en" | "vi" }) => (
    <div>Photo Cure workspace ({locale})</div>
  ),
}));

describe("tool platform shell", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    window.localStorage.clear();
    window.localStorage.setItem("vit.locale", JSON.stringify("en"));
  });

  it("discovers Photo Cure from the registry and states the privacy promise", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /small tools, entirely in your browser/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /photo cure/i })).toBeInTheDocument();
    expect(screen.getByText(/no uploads.*no tracking.*no ads/i)).toBeInTheDocument();
  });

  it("opens a registry tool at its stable URL and lazy loads its module", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: /photo cure/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/tools/photo-cure");
      expect(screen.getByText("Photo Cure workspace (en)")).toBeInTheDocument();
    });
    expect(screen.getAllByText(/local-only/i).length).toBeGreaterThan(0);
  });

  it("switches the shell to Vietnamese", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /tiếng việt/i }));

    expect(
      screen.getByRole("heading", {
        name: /công cụ nhỏ, chạy hoàn toàn trong trình duyệt/i,
      }),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("lang", "vi");
  });

  it("opens the command palette with the platform shortcut", async () => {
    render(<App />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(
      await screen.findByRole("dialog", { name: /find a tool/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /search tools/i })).toHaveFocus();
  });

  it("persists favorites and shows a recently opened tool in navigation", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /add to favorites/i }));
    expect(JSON.parse(window.localStorage.getItem("vit.favorites") ?? "[]")).toEqual([
      "photo-cure",
    ]);

    fireEvent.click(screen.getByRole("link", { name: /photo cure/i }));

    await screen.findByText("Photo Cure workspace (en)");
    expect(screen.getByRole("navigation", { name: /recent/i })).toHaveTextContent(
      "Photo Cure",
    );
  });

  it("passes the active locale to a lazy tool module", async () => {
    window.history.replaceState({}, "", "/tools/photo-cure");
    render(<App />);

    expect(await screen.findByText("Photo Cure workspace (en)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /tiếng việt/i }));

    expect(await screen.findByText("Photo Cure workspace (vi)")).toBeInTheDocument();
  });

  it("uses the Vietnamese-first reference layout for a new visitor", () => {
    window.localStorage.clear();

    render(<App />);

    expect(document.documentElement).toHaveAttribute("lang", "vi");
    expect(
      screen.getByRole("heading", {
        name: /công cụ nhỏ, chạy hoàn toàn trong trình duyệt/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Không upload")).toBeInTheDocument();
    expect(screen.getByText("Không theo dõi")).toBeInTheDocument();
    expect(screen.getByText("Không quảng cáo")).toBeInTheDocument();
    expect(screen.getByText("Kiểm chứng được")).toBeInTheDocument();
    expect(screen.getByText(/41 công cụ/i)).toBeInTheDocument();
  });

  it("opens a registry-driven static group hub", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: /text & string/i }));

    expect(window.location.pathname).toBe("/groups/text");
    expect(
      screen.getByRole("heading", { name: /text & string/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Case converter").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Works offline")).toHaveLength(8);
  });

  it("routes a ready sidebar item to its own tool instead of Photo Cure", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /case converter/i }));

    expect(window.location.pathname).toBe("/tools/case-convert");
    expect(
      await screen.findByRole("heading", { name: "Case converter", level: 1 }),
    ).toBeInTheDocument();
  });

  it("opens every Text & String tool from its stable direct route", async () => {
    const routes = [
      ["/tools/case-convert", "Case converter"],
      ["/tools/slugify", "Slug & Vietnamese accents"],
      ["/tools/diff", "Text diff"],
      ["/tools/word-count", "Word & character count"],
      ["/tools/line-tools", "Sort & dedupe lines"],
      ["/tools/regex", "Regex tester"],
      ["/tools/lorem", "Lorem Ipsum"],
      ["/tools/unicode", "Unicode inspector"],
    ] as const;

    for (const [path, heading] of routes) {
      window.history.replaceState({}, "", path);
      const view = render(<App />);

      expect(
        await screen.findByRole("heading", { name: heading, level: 1 }),
      ).toBeInTheDocument();
      view.unmount();
    }
  });

  it("shows all eight offline-ready Developer & Data tools on its group hub", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: /developer & data/i }));

    expect(window.location.pathname).toBe("/groups/developer");
    expect(
      screen.getByRole("heading", { name: /developer & data/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Works offline")).toHaveLength(8);
  });

  it("opens every Developer & Data tool from its stable direct route", async () => {
    const routes = [
      ["/tools/json", "JSON formatter"],
      ["/tools/base64", "Base64"],
      ["/tools/data-convert", "JSON ↔ YAML ↔ CSV"],
      ["/tools/jwt", "JWT decoder"],
      ["/tools/sql", "SQL formatter"],
      ["/tools/cron", "Cron builder"],
      ["/tools/curl", "curl → code"],
      ["/tools/json-types", "JSON → TypeScript"],
    ] as const;

    for (const [path, heading] of routes) {
      window.history.replaceState({}, "", path);
      const view = render(<App />);

      expect(
        await screen.findByRole("heading", { name: heading, level: 1 }),
      ).toBeInTheDocument();
      view.unmount();
    }
  });

  it("shows all six offline-ready Date & Time tools on its group hub", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: /date & time/i }));

    expect(window.location.pathname).toBe("/groups/date-time");
    expect(
      screen.getByRole("heading", { name: /date & time/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Works offline")).toHaveLength(6);
  });

  it("opens every Date & Time tool from its stable direct route", async () => {
    const routes = [
      ["/tools/timestamp", "Unix timestamp"],
      ["/tools/lunar", "Lunar calendar"],
      ["/tools/timezone", "Timezone converter"],
      ["/tools/date-diff", "Date difference"],
      ["/tools/duration", "Duration humanizer"],
      ["/tools/working-days", "Working days"],
    ] as const;

    for (const [path, heading] of routes) {
      window.history.replaceState({}, "", path);
      const view = render(<App />);

      expect(
        await screen.findByRole("heading", { name: heading, level: 1 }),
      ).toBeInTheDocument();
      view.unmount();
    }
  });

  it("shows all seven offline-ready Generator tools on its group hub", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: /generators/i }));

    expect(window.location.pathname).toBe("/groups/generators");
    expect(
      screen.getByRole("heading", { name: /generators/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Works offline")).toHaveLength(7);
  });

  it("opens every Generator tool from its stable direct route", async () => {
    const routes = [
      ["/tools/ids", "UUID / ULID / NanoID"],
      ["/tools/password", "Password generator"],
      ["/tools/qr", "QR code"],
      ["/tools/barcode", "Barcode"],
      ["/tools/mock", "Mock data"],
      ["/tools/meta", "Meta tags & OG preview"],
      ["/tools/favicon", "Favicon set"],
    ] as const;

    for (const [path, heading] of routes) {
      window.history.replaceState({}, "", path);
      const view = render(<App />);

      expect(
        await screen.findByRole("heading", { name: heading, level: 1 }),
      ).toBeInTheDocument();
      view.unmount();
    }
  });

  it("shows all five offline-ready Files & Documents tools on its group hub", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: /files & documents/i }));

    expect(window.location.pathname).toBe("/groups/files");
    expect(
      screen.getByRole("heading", { name: /files & documents/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Works offline")).toHaveLength(5);
  });

  it("opens every Files & Documents tool from its stable direct route", async () => {
    const routes = [
      ["/tools/pdf", "Merge / split PDF"],
      ["/tools/pdf-image", "PDF ↔ image"],
      ["/tools/sheets", "CSV ↔ XLSX"],
      ["/tools/zip", "Zip / unzip"],
      ["/tools/checksum", "File checksum"],
    ] as const;

    for (const [path, heading] of routes) {
      window.history.replaceState({}, "", path);
      const view = render(<App />);

      expect(
        await screen.findByRole("heading", { name: heading, level: 1 }),
      ).toBeInTheDocument();
      view.unmount();
    }
  });

  it("shows all five Security tools with the HIBP exception disclosed", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: /security/i }));

    expect(window.location.pathname).toBe("/groups/security");
    expect(
      screen.getByRole("heading", { name: /security/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Works offline")).toHaveLength(4);
    expect(screen.getByText("Network disclosed")).toBeInTheDocument();
  });

  it("opens every Security tool from its stable direct route", async () => {
    const routes = [
      ["/tools/hash", "SHA / MD5 hashes"],
      ["/tools/strength", "Password strength"],
      ["/tools/hibp", "Breach check (HIBP)"],
      ["/tools/certificate", "X.509 decoder"],
      ["/tools/hmac", "HMAC"],
    ] as const;

    for (const [path, heading] of routes) {
      window.history.replaceState({}, "", path);
      const view = render(<App />);

      expect(
        await screen.findByRole("heading", { name: heading, level: 1 }),
      ).toBeInTheDocument();
      view.unmount();
    }
  });

  it("discloses the HIBP network exception in the route chrome", async () => {
    window.history.replaceState({}, "", "/tools/hibp");
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: "Breach check (HIBP)",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("HIBP prefix request")).toBeInTheDocument();
    expect(screen.getByText(/External requests:/)).toHaveTextContent("1");
  });
});
