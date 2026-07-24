import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MockTool from "./MockTool";

describe("Mock Data tool", () => {
  it("generates seeded JSON and quoted CSV with selected fields", () => {
    render(<MockTool locale="en" />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Record count" }), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Seed" }), {
      target: { value: "demo" },
    });

    const json = screen.getByRole("region", { name: "Generated mock data" });
    expect(json).toHaveTextContent(/"id": "mock_.*"name":.*"email":/s);

    fireEvent.change(screen.getByRole("combobox", { name: "Output format" }), {
      target: { value: "csv" },
    });
    expect(screen.getByRole("region", { name: "Generated mock data" })).toHaveTextContent(
      /^id,name,email,phone,address,company,date/,
    );
    expect(screen.getByRole("link", { name: "Download data" })).toHaveAttribute(
      "download",
      "mock-data.csv",
    );
  });

  it("announces empty field selection", () => {
    render(<MockTool locale="en" />);
    for (const name of ["ID", "Name", "Email", "Phone", "Address", "Company", "Date"]) {
      fireEvent.click(screen.getByRole("checkbox", { name }));
    }
    expect(screen.getByRole("alert")).toHaveTextContent(/field/i);
  });

  it("ships Vietnamese controls and locale generation", () => {
    render(<MockTool locale="vi" />);
    expect(
      screen.getByRole("heading", { name: "Dữ liệu giả", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Ngôn ngữ dữ liệu" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Hạt giống" })).toBeInTheDocument();
  });
});

