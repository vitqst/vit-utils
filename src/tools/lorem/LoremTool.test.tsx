import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LoremTool from "./LoremTool";

describe("Lorem Ipsum tool", () => {
  it("generates the requested unit and amount with copy support", () => {
    render(<LoremTool locale="en" />);

    fireEvent.change(screen.getByRole("combobox", { name: "Unit" }), {
      target: { value: "words" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Amount" }), {
      target: { value: "5" },
    });

    expect(screen.getByRole("region", { name: "Generated text" })).toHaveTextContent(
      "Lorem ipsum dolor sit amet",
    );
    expect(screen.getByRole("button", { name: "Copy result" })).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: "Start with Lorem ipsum" })).toBeChecked();
  });

  it("provides localized generation controls", () => {
    render(<LoremTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "Tạo Lorem Ipsum", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Đơn vị" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Số lượng" })).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Bắt đầu bằng Lorem ipsum" }),
    ).toBeInTheDocument();
  });
});

