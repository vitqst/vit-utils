import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import QrTool from "./QrTool";

describe("QR Code tool", () => {
  it("generates an SVG preview with configured options and downloads", async () => {
    render(<QrTool locale="en" />);
    fireEvent.change(screen.getByRole("textbox", { name: "QR content" }), {
      target: { value: "Xin chào" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Error correction" }), {
      target: { value: "H" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate QR code" }));

    expect(
      await screen.findByRole("img", { name: "Generated QR code" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download SVG" })).toHaveAttribute(
      "download",
      "qr-code.svg",
    );
    expect(screen.getByRole("button", { name: "Download PNG" })).toBeEnabled();
  });

  it("builds Wi-Fi payloads and announces invalid secured networks", async () => {
    render(<QrTool locale="en" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Payload type" }), {
      target: { value: "wifi" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Network name" }), {
      target: { value: "Guest" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate QR code" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("ships Vietnamese controls", () => {
    render(<QrTool locale="vi" />);
    expect(
      screen.getByRole("heading", { name: "Mã QR", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Loại nội dung" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tạo mã QR" })).toBeInTheDocument();
  });
});

