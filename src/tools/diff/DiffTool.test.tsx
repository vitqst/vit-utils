import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DiffTool from "./DiffTool";

describe("Text Diff tool", () => {
  it("compares two labeled inputs and renders readable change rows", () => {
    render(<DiffTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Original text" }), {
      target: { value: "alpha\nbefore" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Changed text" }), {
      target: { value: "alpha\nafter" },
    });

    const result = screen.getByRole("region", { name: "Diff result" });
    expect(result).toHaveTextContent("alpha");
    expect(result).toHaveTextContent("−before");
    expect(result).toHaveTextContent("+after");
  });

  it("provides the complete comparison flow in Vietnamese", () => {
    render(<DiffTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "So sánh văn bản", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Văn bản gốc" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Văn bản đã sửa" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Kết quả so sánh" }),
    ).toHaveTextContent("Nhập văn bản ở cả hai bên");
  });
});

