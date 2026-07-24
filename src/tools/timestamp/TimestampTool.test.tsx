import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import TimestampTool from "./TimestampTool";

describe("Unix Timestamp tool", () => {
  it("converts timestamps, switches units, and inserts the current time", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_767_225_600_000);
    render(<TimestampTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Unix timestamp" }), {
      target: { value: "0" },
    });
    expect(screen.getByRole("region", { name: "Conversion result" })).toHaveTextContent(
      "1970-01-01T00:00:00.000Z",
    );

    fireEvent.click(screen.getByRole("button", { name: "Use current time" }));
    expect(screen.getByRole("textbox", { name: "Unix timestamp" })).toHaveValue(
      "1767225600",
    );
    vi.restoreAllMocks();
  });

  it("converts a local date-time back to epoch values", () => {
    render(<TimestampTool locale="en" />);
    fireEvent.change(
      screen.getByRole("combobox", { name: "Conversion direction" }),
      { target: { value: "date-to-timestamp" } },
    );
    fireEvent.change(screen.getByLabelText("Local date and time"), {
      target: { value: "2026-01-01T12:30" },
    });
    expect(screen.getByRole("region", { name: "Conversion result" })).toHaveTextContent(
      /Unix seconds.*Unix milliseconds/s,
    );
  });

  it("announces invalid values and ships Vietnamese labels", () => {
    const view = render(<TimestampTool locale="en" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Unix timestamp" }), {
      target: { value: "not-a-time" },
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    view.unmount();

    render(<TimestampTool locale="vi" />);
    expect(
      screen.getByRole("heading", { name: "Unix Timestamp", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Dấu thời gian Unix" })).toBeInTheDocument();
  });
});

