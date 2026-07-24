import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BarcodeTool from "./BarcodeTool";

describe("Barcode tool", () => {
  it("renders and downloads a validated SVG barcode", () => {
    render(<BarcodeTool locale="en" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Barcode data" }), {
      target: { value: "ABC-123" },
    });

    expect(screen.getByRole("img", { name: "Generated barcode" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download SVG" })).toHaveAttribute(
      "download",
      "barcode.svg",
    );
  });

  it("switches formats and announces invalid check digits", () => {
    render(<BarcodeTool locale="en" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Barcode format" }), {
      target: { value: "EAN13" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Barcode data" }), {
      target: { value: "5901234123458" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/check digit/i);
  });

  it("ships Vietnamese controls", () => {
    render(<BarcodeTool locale="vi" />);
    expect(
      screen.getByRole("heading", { name: "Mã vạch", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Định dạng mã vạch" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Dữ liệu mã vạch" })).toBeInTheDocument();
  });
});

