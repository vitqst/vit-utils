import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PasswordTool from "./PasswordTool";

describe("Password Generator tool", () => {
  it("generates a password with selected classes and entropy estimate", () => {
    render(<PasswordTool locale="en" />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Length" }), {
      target: { value: "24" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate password" }));

    const output = screen.getByRole("region", { name: "Generated secret" });
    expect(output.textContent?.split("\n")[0]).toHaveLength(24);
    expect(screen.getByText(/estimated entropy/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy secret" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Clear secret" })).toBeEnabled();
  });

  it("switches to configured passphrase mode", () => {
    render(<PasswordTool locale="en" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Generator mode" }), {
      target: { value: "passphrase" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Word count" }), {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Add numeric suffix" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate passphrase" }));

    expect(screen.getByRole("region", { name: "Generated secret" })).toHaveTextContent(
      /^\w+(?:-\w+){3}-\d+$/,
    );
  });

  it("announces invalid class selection and ships Vietnamese copy", () => {
    const view = render(<PasswordTool locale="en" />);
    for (const name of ["Uppercase", "Lowercase", "Digits", "Symbols"]) {
      fireEvent.click(screen.getByRole("checkbox", { name }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Generate password" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    view.unmount();

    render(<PasswordTool locale="vi" />);
    expect(
      screen.getByRole("heading", { name: "Tạo mật khẩu", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tạo mật khẩu" })).toBeInTheDocument();
  });
});

