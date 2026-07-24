import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JsonTool from "./JsonTool";

describe("JSON Formatter tool", () => {
  it("formats, sorts, and minifies valid JSON", () => {
    render(<JsonTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "JSON input" }), {
      target: { value: '{"b":1,"a":2}' },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Sort object keys" }));
    expect(screen.getByRole("region", { name: "JSON output" })).toHaveTextContent(
      /"a": 2.*"b": 1/s,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Output mode" }), {
      target: { value: "minify" },
    });
    expect(screen.getByRole("region", { name: "JSON output" })).toHaveTextContent(
      '{"a":2,"b":1}',
    );
    expect(screen.getByRole("button", { name: "Copy result" })).toBeEnabled();
  });

  it("announces invalid JSON with a source location", () => {
    render(<JsonTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "JSON input" }), {
      target: { value: '{\n  "ok": true,\n}' },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/line 3.*column 1/i);
  });

  it("provides Vietnamese controls and duplicate-key disclosure", () => {
    render(<JsonTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "Định dạng JSON", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "JSON đầu vào" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Kiểu đầu ra" })).toBeInTheDocument();
    expect(screen.getByText(/khóa trùng/i)).toBeInTheDocument();
  });
});

