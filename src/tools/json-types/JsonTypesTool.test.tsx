import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JsonTypesTool from "./JsonTypesTool";

describe("JSON to TypeScript tool", () => {
  it("infers declarations with configurable root name and style", () => {
    render(<JsonTypesTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Root type name" }), {
      target: { value: "User" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "JSON sample" }), {
      target: { value: '[{"id":1,"name":"An"},{"id":2}]' },
    });

    expect(
      screen.getByRole("region", { name: "TypeScript output" }),
    ).toHaveTextContent(/interface User.*name\?: string/s);

    fireEvent.change(screen.getByRole("combobox", { name: "Declaration style" }), {
      target: { value: "type" },
    });
    expect(
      screen.getByRole("region", { name: "TypeScript output" }),
    ).toHaveTextContent(/type User =/);
    expect(screen.getByRole("button", { name: "Copy TypeScript" })).toBeEnabled();
    expect(
      screen.getByRole("link", { name: "Download TypeScript" }),
    ).toHaveAttribute("download", "types.ts");
  });

  it("announces invalid JSON", () => {
    render(<JsonTypesTool locale="en" />);
    fireEvent.change(screen.getByRole("textbox", { name: "JSON sample" }), {
      target: { value: "{" },
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("ships Vietnamese controls", () => {
    render(<JsonTypesTool locale="vi" />);
    expect(
      screen.getByRole("heading", { name: "JSON → TypeScript", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Mẫu JSON" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Tên kiểu gốc" })).toBeInTheDocument();
  });
});

