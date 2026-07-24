import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TimezoneTool from "./TimezoneTool";

describe("Timezone Converter tool", () => {
  it("converts one source wall time into two target zones", () => {
    render(<TimezoneTool locale="en" />);

    fireEvent.change(screen.getByLabelText("Local date and time"), {
      target: { value: "2026-01-01T07:00" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Source time zone" }), {
      target: { value: "Asia/Ho_Chi_Minh" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Second target zone" }), {
      target: { value: "America/New_York" },
    });

    expect(screen.getByRole("region", { name: "Converted times" })).toHaveTextContent(
      /2026-01-01T00:00:00.000Z.*UTC.*America\/New_York/s,
    );
  });

  it("announces nonexistent wall times and warns about ambiguous ones", () => {
    render(<TimezoneTool locale="en" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Source time zone" }), {
      target: { value: "America/New_York" },
    });
    fireEvent.change(screen.getByLabelText("Local date and time"), {
      target: { value: "2026-03-08T02:30" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/does not exist/i);

    fireEvent.change(screen.getByLabelText("Local date and time"), {
      target: { value: "2026-11-01T01:30" },
    });
    expect(screen.getByRole("status")).toHaveTextContent(/occurs twice/i);
  });

  it("ships Vietnamese labels", () => {
    render(<TimezoneTool locale="vi" />);
    expect(
      screen.getByRole("heading", { name: "Đổi múi giờ", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Ngày giờ địa phương")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Múi giờ nguồn" })).toBeInTheDocument();
  });
});

