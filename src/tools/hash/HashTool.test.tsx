import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HashTool from "./HashTool";

describe("SHA / MD5 hash tool", () => {
  it("hashes text, switches algorithms, and identifies pasted digests", () => {
    render(<HashTool locale="en" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Text to hash" }), {
      target: { value: "abc" },
    });
    expect(screen.getByRole("region", { name: "Digest" })).toHaveTextContent(
      "ba7816bf",
    );
    fireEvent.change(screen.getByLabelText("Algorithm"), {
      target: { value: "md5" },
    });
    expect(screen.getByRole("region", { name: "Digest" })).toHaveTextContent(
      "90015098",
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Identify digest" }), {
      target: { value: "a".repeat(40) },
    });
    expect(screen.getByText("SHA-1")).toBeInTheDocument();
  });

  it("labels legacy algorithms and resets in Vietnamese", () => {
    render(<HashTool locale="vi" />);
    expect(screen.getByRole("option", { name: /MD5.*cũ/i })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Văn bản cần băm" }), {
      target: { value: "bí mật" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đặt lại" }));
    expect(screen.getByRole("textbox", { name: "Văn bản cần băm" })).toHaveValue("");
    expect(screen.getByText(/không rời khỏi trình duyệt/i)).toBeInTheDocument();
  });
});

