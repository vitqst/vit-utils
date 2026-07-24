import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JwtTool from "./JwtTool";

function segment(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

describe("JWT Decoder tool", () => {
  it("renders decoded sections and time claims with a verification warning", () => {
    render(<JwtTool locale="en" />);
    const value = `${segment({ alg: "none" })}.${segment({
      sub: "123",
      name: "Nguyễn An",
      exp: 1893456000,
    })}.`;

    fireEvent.change(screen.getByRole("textbox", { name: "JWT token" }), {
      target: { value },
    });

    expect(screen.getByRole("region", { name: "Header" })).toHaveTextContent(
      '"alg": "none"',
    );
    expect(screen.getByRole("region", { name: "Payload" })).toHaveTextContent(
      '"name": "Nguyễn An"',
    );
    expect(screen.getByText("exp").parentElement).toHaveTextContent(/active/i);
    expect(screen.getByRole("alert")).toHaveTextContent(
      /signature has not been verified/i,
    );
    expect(screen.getByRole("button", { name: "Copy payload" })).toBeEnabled();
  });

  it("announces malformed tokens", () => {
    render(<JwtTool locale="en" />);
    fireEvent.change(screen.getByRole("textbox", { name: "JWT token" }), {
      target: { value: "two.segments" },
    });

    expect(screen.getAllByRole("alert")).toEqual(
      expect.arrayContaining([expect.any(HTMLElement)]),
    );
    expect(screen.getByText(/exactly three segments/i)).toBeInTheDocument();
  });

  it("provides Vietnamese input, sections, and security disclosure", () => {
    render(<JwtTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "Giải mã JWT", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Token JWT" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Header" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Payload" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/chưa được xác minh/i);
  });
});
