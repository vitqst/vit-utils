import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RegexTool from "./RegexTool";

describe("Regex Tester tool", () => {
  it("lists global matches, offsets, and capture groups", () => {
    render(<RegexTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Pattern" }), {
      target: { value: "a(.)" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Test text" }), {
      target: { value: "ab ac" },
    });

    const result = screen.getByRole("region", { name: "Matches" });
    expect(result).toHaveTextContent("2 matches");
    expect(result).toHaveTextContent("ab");
    expect(result).toHaveTextContent("ac");
    expect(result).toHaveTextContent("Capture 1: b");
  });

  it("announces invalid expressions without crashing", () => {
    render(<RegexTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Pattern" }), {
      target: { value: "(" },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      /unterminated|invalid/i,
    );
  });

  it("provides Vietnamese pattern, text, flag, and result labels", () => {
    render(<RegexTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "Kiểm thử Regex", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Mẫu Regex" })).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Văn bản kiểm thử" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Toàn bộ" })).toBeChecked();
    expect(
      screen.getByRole("region", { name: "Kết quả khớp" }),
    ).toBeInTheDocument();
  });
});
