import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

    expect(screen.getByRole("button", { name: "Copy secret" })).toBeEnabled();
    expect(screen.getByText("58.3 bits")).toBeInTheDocument();
  });

  it("defaults passphrases to the six-word EFF recommendation", () => {
    render(<PasswordTool locale="en" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Generator mode" }), {
      target: { value: "passphrase" },
    });

    expect(screen.getByRole("spinbutton", { name: "Word count" })).toHaveValue(6);
    expect(screen.getByText(/EFF.*7,776 words/i)).toBeInTheDocument();
    expect(screen.getByText("77.5 bits")).toBeInTheDocument();
  });

  it("clears a generated secret when its generation options change", () => {
    render(<PasswordTool locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Generate password" }));
    expect(screen.getByRole("button", { name: "Copy secret" })).toBeEnabled();

    fireEvent.change(screen.getByRole("spinbutton", { name: "Length" }), {
      target: { value: "24" },
    });

    expect(screen.getByRole("button", { name: "Copy secret" })).toBeDisabled();
    expect(
      screen.getByText("Generate a secret to see it here."),
    ).toBeInTheDocument();
  });

  it("resets copy confirmation when a new secret is generated", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    render(<PasswordTool locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Generate password" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy secret" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Copied");

    fireEvent.click(screen.getByRole("button", { name: "Generate password" }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("announces localized invalid class selection and ships Vietnamese copy", () => {
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
    for (const name of ["Chữ hoa", "Chữ thường", "Chữ số", "Ký hiệu"]) {
      fireEvent.click(screen.getByRole("checkbox", { name }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Tạo mật khẩu" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Chọn ít nhất một loại ký tự.",
    );
  });
});
