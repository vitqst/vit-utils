import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  CopyButton,
  ToolActions,
  ToolGrid,
  ToolOutput,
  ToolPanel,
  ToolTextArea,
  ToolWorkspace,
} from "./ToolWorkspace";

function ExampleWorkspace({ locale }: { locale: "en" | "vi" }) {
  const [value, setValue] = useState("");
  const copy =
    locale === "en"
      ? {
          title: "Example tool",
          description: "Transform text locally.",
          input: "Input text",
          output: "Result",
          empty: "Your result appears here.",
          run: "Transform",
        }
      : {
          title: "Công cụ mẫu",
          description: "Chuyển đổi văn bản cục bộ.",
          input: "Văn bản đầu vào",
          output: "Kết quả",
          empty: "Kết quả sẽ hiện ở đây.",
          run: "Chuyển đổi",
        };

  return (
    <ToolWorkspace title={copy.title} description={copy.description}>
      <ToolGrid>
        <ToolPanel title={copy.input}>
          <ToolTextArea
            label={copy.input}
            value={value}
            onChange={setValue}
          />
          <ToolActions>
            <button type="button">{copy.run}</button>
          </ToolActions>
        </ToolPanel>
        <ToolPanel title={copy.output}>
          <ToolOutput
            label={copy.output}
            value={value.toUpperCase()}
            emptyLabel={copy.empty}
          />
        </ToolPanel>
      </ToolGrid>
    </ToolWorkspace>
  );
}

describe("shared tool workspace", () => {
  it.each([
    ["en", "Example tool", "Input text", "Result", "Transform"],
    ["vi", "Công cụ mẫu", "Văn bản đầu vào", "Kết quả", "Chuyển đổi"],
  ] as const)(
    "renders semantic controls with %s copy",
    (locale, title, input, output, action) => {
      render(<ExampleWorkspace locale={locale} />);

      expect(screen.getByRole("heading", { name: title, level: 1 })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: input })).toBeInTheDocument();
      expect(screen.getByRole("region", { name: output })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: action })).toBeInTheDocument();
    },
  );

  it("copies a result and announces success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <CopyButton
        value="local result"
        label="Copy"
        copiedLabel="Copied"
        failedLabel="Copy failed"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(writeText).toHaveBeenCalledWith("local result");
    expect(await screen.findByRole("status")).toHaveTextContent("Copied");
  });

  it("announces clipboard failures and disables empty results", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    const { rerender } = render(
      <CopyButton
        value="local result"
        label="Copy"
        copiedLabel="Copied"
        failedLabel="Copy failed"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Copy failed");

    rerender(
      <CopyButton
        value=""
        label="Copy"
        copiedLabel="Copied"
        failedLabel="Copy failed"
      />,
    );
    expect(screen.getByRole("button", { name: "Copy" })).toBeDisabled();
  });
});
