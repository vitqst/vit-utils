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
    expect(screen.getAllByText("Planned").length).toBeGreaterThan(0);
  });

  it("routes a ready sidebar item to its own tool instead of Photo Cure", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /case converter/i }));

    expect(window.location.pathname).toBe("/tools/case-convert");
    expect(
      await screen.findByRole("heading", { name: "Case converter", level: 1 }),
    ).toBeInTheDocument();
  });
});
