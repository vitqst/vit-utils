import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Base64Tool from "./Base64Tool";

describe("Base64 tool", () => {
  it("encodes and decodes UTF-8 text with Base64url support", () => {
    render(<Base64Tool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Input text" }), {
      target: { value: "Xin chào 👋" },
    });
    expect(screen.getByRole("region", { name: "Result" })).toHaveTextContent(
      "WGluIGNow6BvIPCfkYs=",
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Base64url" }));
    expect(screen.getByRole("region", { name: "Result" })).not.toHaveTextContent(
      "=",
    );

    fireEvent.click(screen.getByRole("radio", { name: "Decode" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Input text" }), {
      target: { value: "SGVsbG8" },
    });
    expect(screen.getByRole("region", { name: "Result" })).toHaveTextContent(
      "Hello",
    );
  });

  it("announces invalid text input and can reset", () => {
    render(<Base64Tool locale="en" />);
    fireEvent.click(screen.getByRole("radio", { name: "Decode" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Input text" }), {
      target: { value: "%%%" },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/base64/i);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("textbox", { name: "Input text" })).toHaveValue("");
  });

  it("exposes local-file and cancellation controls in both languages", () => {
    render(<Base64Tool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "Base64", level: 1 }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Tệp" }));
    expect(screen.getByLabelText("Chọn tệp")).toHaveAttribute("type", "file");
    expect(screen.getByRole("button", { name: "Hủy xử lý" })).toBeDisabled();
    expect(
      screen.getByText("Nội dung tệp đã chọn không rời khỏi trình duyệt."),
    ).toBeInTheDocument();
  });
});
