import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SlugifyTool from "./SlugifyTool";

describe("Slug & Vietnamese Accents tool", () => {
  it("creates an ASCII slug and supports separator options", () => {
    render(<SlugifyTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Source text" }), {
      target: { value: "Đặng Thái Sơn & Café" },
    });
    expect(screen.getByRole("region", { name: "Result" })).toHaveTextContent(
      "dang-thai-son-cafe",
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Separator" }), {
      target: { value: "_" },
    });
    expect(screen.getByRole("region", { name: "Result" })).toHaveTextContent(
      "dang_thai_son_cafe",
    );
    expect(screen.getByRole("button", { name: "Copy result" })).toBeEnabled();
  });

  it("can remove accents without changing punctuation", () => {
    render(<SlugifyTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Source text" }), {
      target: { value: "Đặng Thái Sơn — SỐ 2" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Remove accents" }));

    expect(screen.getByRole("region", { name: "Result" })).toHaveTextContent(
      "Dang Thai Son — SO 2",
    );
  });

  it("provides Vietnamese controls", () => {
    render(<SlugifyTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "Slug & bỏ dấu", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Bỏ dấu" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Ký tự phân cách" }),
    ).toBeInTheDocument();
  });
});
