import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HmacTool from "./HmacTool";

describe("HMAC tool", () => {
  it("calculates and verifies a Web Crypto signature", async () => {
    render(<HmacTool locale="en" />);
    fireEvent.change(screen.getByLabelText("Secret key"), {
      target: { value: "key" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "The quick brown fox jumps over the lazy dog" },
    });
    fireEvent.change(screen.getByLabelText("Expected signature"), {
      target: {
        value:
          "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate HMAC" }));

    expect(
      await screen.findByText("Signature matches."),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "HMAC result" })).toHaveTextContent(
      "f7bc83f4",
    );
  });

  it("shows/hides and clears the key with Vietnamese privacy copy", () => {
    render(<HmacTool locale="vi" />);
    const key = screen.getByLabelText("Khóa bí mật");
    fireEvent.change(key, { target: { value: "bí mật" } });
    fireEvent.click(screen.getByRole("button", { name: "Hiện khóa" }));
    expect(key).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Xóa" }));
    expect(key).toHaveValue("");
    expect(screen.getByText(/không rời khỏi trình duyệt/i)).toBeInTheDocument();
  });
});
