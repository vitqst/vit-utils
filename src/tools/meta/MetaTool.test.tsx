import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MetaTool from "./MetaTool";

describe("Meta Tags tool", () => {
  it("generates escaped tags and a non-fetching social preview", () => {
    render(<MetaTool locale="en" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Page title" }), {
      target: { value: 'Vịt & "Tools"' },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Description" }), {
      target: { value: "Private <browser> tools" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Canonical URL" }), {
      target: { value: "https://example.com/tools" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Image URL" }), {
      target: { value: "https://example.com/og.png" },
    });

    expect(screen.getByRole("region", { name: "Generated meta tags" })).toHaveTextContent(
      /Vịt &amp; &quot;Tools&quot;.*Private &lt;browser&gt; tools/s,
    );
    const preview = screen.getByRole("region", { name: "Social card preview" });
    expect(preview).toHaveTextContent('Vịt & "Tools"');
    expect(preview).toHaveTextContent("https://example.com/og.png");
    expect(preview.querySelector("img")).toBeNull();
    expect(screen.getByText(/does not fetch/i)).toBeInTheDocument();
  });

  it("announces invalid URLs and shows character guidance", () => {
    render(<MetaTool locale="en" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Page title" }), {
      target: { value: "A title" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Canonical URL" }), {
      target: { value: "javascript:alert(1)" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/HTTP/i);
    expect(screen.getByText(/7 characters/)).toBeInTheDocument();
  });

  it("ships Vietnamese controls", () => {
    render(<MetaTool locale="vi" />);
    expect(
      screen.getByRole("heading", { name: "Meta tags & OG preview", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Tiêu đề trang" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Xem trước thẻ mạng xã hội" })).toBeInTheDocument();
  });
});

