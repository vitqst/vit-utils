import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import {
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
});
