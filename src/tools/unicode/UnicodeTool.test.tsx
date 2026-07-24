import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import UnicodeTool from "./UnicodeTool";

describe("Unicode Inspector tool", () => {
  it("shows grapheme, code-point, UTF-16, and per-character details", () => {
    render(<UnicodeTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Text to inspect" }), {
      target: { value: "A😀" },
    });

    expect(screen.getByText("Graphemes").parentElement).toHaveTextContent("2");
    expect(screen.getByText("Code points").parentElement).toHaveTextContent("2");
    expect(screen.getByText("UTF-16 units").parentElement).toHaveTextContent("3");
    const table = screen.getByRole("table", { name: "Code point details" });
    expect(table).toHaveTextContent("U+0041");
    expect(table).toHaveTextContent("U+1F600");
    expect(table).toHaveTextContent("D83D DE00");
    expect(table).toHaveTextContent("LATIN CAPITAL LETTER A");
  });

  it("shows a localized empty state and table labels", () => {
    render(<UnicodeTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "Soi Unicode", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Văn bản cần soi" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nhập văn bản để xem chi tiết.")).toBeInTheDocument();
    expect(screen.getByText("Cụm ký tự")).toBeInTheDocument();
    expect(screen.getByText("Đơn vị UTF-16")).toBeInTheDocument();
  });
});
