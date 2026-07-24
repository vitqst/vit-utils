import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DateDiffTool from "./DateDiffTool";

describe("Date Difference tool", () => {
  it("shows calendar and elapsed differences and swaps dates", () => {
    render(<DateDiffTool locale="en" />);

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2023-01-31" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2023-03-01" },
    });

    expect(screen.getByRole("region", { name: "Difference result" })).toHaveTextContent(
      /1 month, 1 day.*29 total days.*4 weeks, 1 day/s,
    );
    fireEvent.click(screen.getByRole("button", { name: "Swap dates" }));
    expect(screen.getByLabelText("Start date")).toHaveValue("2023-03-01");
    expect(screen.getByText(/end is before start/i)).toBeInTheDocument();
  });

  it("announces invalid date input", () => {
    render(<DateDiffTool locale="en" />);
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "" },
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("ships Vietnamese labels", () => {
    render(<DateDiffTool locale="vi" />);
    expect(
      screen.getByRole("heading", { name: "Khoảng cách ngày", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Ngày bắt đầu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đổi hai ngày" })).toBeInTheDocument();
  });
});

