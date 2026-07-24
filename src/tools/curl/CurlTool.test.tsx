import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CurlTool from "./CurlTool";

describe("curl to code tool", () => {
  it("converts a command among targets and offers copy/download", () => {
    render(<CurlTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "curl command" }), {
      target: {
        value: "curl https://example.com/users --json '{\"name\":\"An\"}'",
      },
    });
    expect(screen.getByRole("region", { name: "Generated code" })).toHaveTextContent(
      /fetch.*POST/s,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Code target" }), {
      target: { value: "python" },
    });
    expect(screen.getByRole("region", { name: "Generated code" })).toHaveTextContent(
      /requests\.request/,
    );
    expect(screen.getByRole("button", { name: "Copy code" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Download code" })).toHaveAttribute(
      "download",
      "request.py",
    );
  });

  it("announces rejected syntax and discloses that code is never run", () => {
    render(<CurlTool locale="en" />);

    fireEvent.change(screen.getByRole("textbox", { name: "curl command" }), {
      target: { value: "curl https://example.com -d @secret.txt" },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/file.*not supported/i);
    expect(screen.getByText(/never executes.*request/i)).toBeInTheDocument();
  });

  it("ships Vietnamese controls", () => {
    render(<CurlTool locale="vi" />);

    expect(
      screen.getByRole("heading", { name: "curl → mã nguồn", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Lệnh curl" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Mã đích" })).toBeInTheDocument();
  });
});

