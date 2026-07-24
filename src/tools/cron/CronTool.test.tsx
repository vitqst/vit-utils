import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CronTool from "./CronTool";

describe("Cron Builder tool", () => {
  it("edits fields, applies presets, and previews five local runs", () => {
    render(<CronTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Minute" }), {
      target: { value: "*/20" },
    });
    expect(screen.getByRole("textbox", { name: "Cron expression" })).toHaveValue(
      "*/20 * * * *",
    );

    fireEvent.click(screen.getByRole("button", { name: "Daily at 09:00" }));
    expect(screen.getByRole("textbox", { name: "Cron expression" })).toHaveValue(
      "0 9 * * *",
    );
    expect(screen.getByRole("list", { name: "Next five runs" }).children).toHaveLength(
      5,
    );
    expect(screen.getByText(/browser.*local time/i)).toBeInTheDocument();
  });

  it("supports direct expression editing and announces invalid input", () => {
    render(<CronTool locale="en" />);
    const expression = screen.getByRole("textbox", { name: "Cron expression" });

    fireEvent.change(expression, { target: { value: "61 * * * *" } });

    expect(expression).toHaveValue("61 * * * *");
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("ships Vietnamese labels and summaries", () => {
    render(<CronTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "Cron builder", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Biểu thức cron" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mỗi 15 phút" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/giờ địa phương của trình duyệt/i)).toBeInTheDocument();
  });
});
