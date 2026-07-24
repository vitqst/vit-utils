import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WordCountTool from "./WordCountTool";

describe("Word & Character Count tool", () => {
  it("updates all live metrics for multiline text", () => {
    render(<WordCountTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Text to count" }), {
      target: { value: "One two.\nThree!" },
    });

    expect(screen.getByText("Words").parentElement).toHaveTextContent("3");
    expect(screen.getByText("Sentences").parentElement).toHaveTextContent("2");
    expect(screen.getByText("Lines").parentElement).toHaveTextContent("2");
    expect(screen.getByText("Reading time").parentElement).toHaveTextContent(
      "1 min",
    );
  });

  it("uses Vietnamese metric and input labels", () => {
    render(<WordCountTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "Đếm từ & ký tự", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Văn bản cần đếm" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Từ")).toBeInTheDocument();
    expect(screen.getByText("Ký tự")).toBeInTheDocument();
    expect(screen.getByText("Dòng")).toBeInTheDocument();
  });
});
