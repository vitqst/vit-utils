import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import IdsTool from "./IdsTool";

describe("UUID / ULID / NanoID tool", () => {
  it("generates bounded batches for each type", () => {
    render(<IdsTool locale="en" />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Count" }), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate identifiers" }));

    expect(screen.getByRole("list", { name: "Generated identifiers" }).children).toHaveLength(
      3,
    );
    expect(screen.getByRole("list", { name: "Generated identifiers" })).toHaveTextContent(
      /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Identifier type" }), {
      target: { value: "nanoid" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "NanoID length" }), {
      target: { value: "12" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate identifiers" }));
    expect(
      screen.getAllByRole("button", { name: "Copy identifier" })[0]
        .previousElementSibling,
    ).toHaveTextContent(/^[\w-]{12}$/);
  });

  it("announces invalid limits", () => {
    render(<IdsTool locale="en" />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Count" }), {
      target: { value: "1001" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate identifiers" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("ships Vietnamese controls", () => {
    render(<IdsTool locale="vi" />);
    expect(
      screen.getByRole("heading", { name: "UUID / ULID / NanoID", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Loại định danh" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tạo định danh" })).toBeInTheDocument();
  });
});

