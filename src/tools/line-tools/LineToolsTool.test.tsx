import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LineToolsTool from "./LineToolsTool";

describe("Sort & Dedupe Lines tool", () => {
  it("applies cleanup and natural sorting options", () => {
    render(<LineToolsTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Source lines" }), {
      target: { value: " item10 \nitem2\nITEM2\n\nitem1" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Trim each line" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Remove blank lines" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Remove duplicates" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Line order" }), {
      target: { value: "asc" },
    });

    expect(screen.getByRole("region", { name: "Processed lines" })).toHaveTextContent(
      "item1 item2 item10",
    );
    expect(screen.getByRole("button", { name: "Copy result" })).toBeEnabled();
  });

  it("ships the same options in Vietnamese", () => {
    render(<LineToolsTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "Sắp xếp & lọc dòng", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Các dòng gốc" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Loại dòng trùng" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Thứ tự dòng" }),
    ).toBeInTheDocument();
  });
});

