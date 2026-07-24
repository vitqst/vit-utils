import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LunarTool from "./LunarTool";

describe("Vietnamese Lunar Calendar tool", () => {
  it("converts Gregorian Tết to lunar date and can-chi", () => {
    render(<LunarTool locale="en" />);

    fireEvent.change(screen.getByLabelText("Gregorian date"), {
      target: { value: "2024-02-10" },
    });

    expect(screen.getByRole("region", { name: "Conversion result" })).toHaveTextContent(
      /1\/1\/2024.*Giáp Thìn/s,
    );
  });

  it("converts a leap lunar month back to Gregorian", () => {
    render(<LunarTool locale="en" />);
    fireEvent.change(
      screen.getByRole("combobox", { name: "Conversion direction" }),
      { target: { value: "lunar-to-solar" } },
    );
    fireEvent.change(screen.getByRole("spinbutton", { name: "Lunar day" }), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Lunar month" }), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Lunar year" }), {
      target: { value: "2023" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Leap month" }));

    expect(screen.getByRole("region", { name: "Conversion result" })).toHaveTextContent(
      "2023-03-22",
    );
  });

  it("announces invalid leap months and ships Vietnamese controls", () => {
    const view = render(<LunarTool locale="en" />);
    fireEvent.change(
      screen.getByRole("combobox", { name: "Conversion direction" }),
      { target: { value: "lunar-to-solar" } },
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Leap month" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    view.unmount();

    render(<LunarTool locale="vi" />);
    expect(
      screen.getByRole("heading", { name: "Đổi lịch âm", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Ngày dương lịch")).toBeInTheDocument();
    expect(screen.getByText(/UTC\+7/)).toBeInTheDocument();
  });
});

