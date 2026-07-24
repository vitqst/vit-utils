import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DataConvertTool from "./DataConvertTool";

describe("JSON ↔ YAML ↔ CSV tool", () => {
  it("converts between selected formats and provides copy/download actions", () => {
    render(<DataConvertTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Source data" }), {
      target: { value: '{"name":"An","active":true}' },
    });
    expect(screen.getByRole("region", { name: "Converted data" })).toHaveTextContent(
      /name: An.*active: true/s,
    );
    expect(screen.getByRole("button", { name: "Copy result" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Download result" })).toHaveAttribute(
      "download",
      "converted.yaml",
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Source format" }), {
      target: { value: "csv" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Target format" }), {
      target: { value: "json" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Source data" }), {
      target: { value: "name,age\nAn,30" },
    });
    expect(screen.getByRole("region", { name: "Converted data" })).toHaveTextContent(
      /"name": "An".*"age": "30"/s,
    );
  });

  it("announces invalid structured data", () => {
    render(<DataConvertTool locale="en" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Source data" }), {
      target: { value: "{" },
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("provides Vietnamese format, swap, and output controls", () => {
    render(<DataConvertTool locale="vi" />);

    expect(
      screen.getByRole("heading", {
        name: "JSON ↔ YAML ↔ CSV",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Định dạng nguồn" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Hoán đổi định dạng" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Dữ liệu đã chuyển" }),
    ).toBeInTheDocument();
  });
});

