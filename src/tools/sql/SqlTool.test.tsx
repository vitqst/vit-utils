import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SqlTool from "./SqlTool";

describe("SQL Formatter tool", () => {
  it("formats SQL with selectable dialect, keyword case, and indentation", () => {
    render(<SqlTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "SQL input" }), {
      target: { value: "select * from users where id = 1" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Dialect" }), {
      target: { value: "postgresql" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Keyword case" }), {
      target: { value: "upper" },
    });

    expect(screen.getByRole("region", { name: "Formatted SQL" })).toHaveTextContent(
      /SELECT.*FROM.*users.*WHERE/s,
    );
    expect(screen.getByRole("button", { name: "Copy result" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Download SQL" })).toHaveAttribute(
      "download",
      "formatted.sql",
    );
  });

  it("announces formatter errors while leaving source editable", () => {
    render(<SqlTool locale="en" />);
    const input = screen.getByRole("textbox", { name: "SQL input" });

    fireEvent.change(input, { target: { value: "SELECT 'unterminated" } });

    expect(screen.getByRole("alert")).toHaveTextContent(/parse error/i);
    expect(input).toHaveValue("SELECT 'unterminated");
  });

  it("ships Vietnamese controls", () => {
    render(<SqlTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "Định dạng SQL", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "SQL đầu vào" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Phương ngữ" })).toBeInTheDocument();
  });
});

