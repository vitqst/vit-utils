import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CaseConvertTool from "./CaseConvertTool";

describe("Case Converter tool", () => {
  it("converts entered text with the selected case style", () => {
    render(<CaseConvertTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Source text" }), {
      target: { value: "helloWorld HTTP server" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Case style" }), {
      target: { value: "snake" },
    });

    expect(screen.getByRole("region", { name: "Converted text" })).toHaveTextContent(
      "hello_world_http_server",
    );
    expect(screen.getByRole("button", { name: "Copy result" })).toBeEnabled();
  });

  it("ships Vietnamese labels with the same workflow", () => {
    render(<CaseConvertTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "Đổi kiểu chữ", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Văn bản gốc" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Kiểu chữ" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sao chép kết quả" }),
    ).toBeDisabled();
  });
});
