import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WorkingDaysTool from "./WorkingDaysTool";

describe("Working Days tool", () => {
  it("counts inclusive weekdays with configured weekends and holidays", () => {
    render(<WorkingDaysTool locale="en" />);
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-01-05" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-01-11" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Holiday dates" }), {
      target: { value: "2026-01-06" },
    });

    expect(screen.getByRole("region", { name: "Working-day result" })).toHaveTextContent(
      /7 calendar days.*4 working days.*2 weekend days.*1 holiday day/s,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Saturday" }));
    expect(screen.getByRole("region", { name: "Working-day result" })).toHaveTextContent(
      /5 working days.*1 weekend day/s,
    );
  });

  it("announces invalid holiday dates", () => {
    render(<WorkingDaysTool locale="en" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Holiday dates" }), {
      target: { value: "2026-02-30" },
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("ships Vietnamese controls", () => {
    render(<WorkingDaysTool locale="vi" />);
    expect(
      screen.getByRole("heading", { name: "Tính ngày làm việc", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Ngày bắt đầu")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Thứ Bảy" })).toBeChecked();
    expect(screen.getByRole("textbox", { name: "Ngày nghỉ lễ" })).toBeInTheDocument();
  });
});

