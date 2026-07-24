import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DurationTool from "./DurationTool";

describe("Duration Humanizer tool", () => {
  it("converts clock notation into exact and readable forms", () => {
    render(<DurationTool locale="en" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Input format" }), {
      target: { value: "clock" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Duration input" }), {
      target: { value: "01:02:03.004" },
    });

    expect(screen.getByRole("region", { name: "Converted duration" })).toHaveTextContent(
      /3723004 milliseconds.*3723\.004 seconds.*01:02:03\.004.*1 hour, 2 minutes, 3 seconds, 4 milliseconds/s,
    );
    expect(screen.getByRole("button", { name: "Copy result" })).toBeEnabled();
  });

  it("announces invalid notation", () => {
    render(<DurationTool locale="en" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Input format" }), {
      target: { value: "clock" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Duration input" }), {
      target: { value: "1:60" },
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("ships Vietnamese controls and readable units", () => {
    render(<DurationTool locale="vi" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Thời lượng đầu vào" }), {
      target: { value: "1500" },
    });
    expect(
      screen.getByRole("heading", { name: "Diễn giải thời lượng", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Thời lượng đã đổi" })).toHaveTextContent(
      /1 giây, 500 mili giây/,
    );
  });
});

