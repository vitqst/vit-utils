import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PdfImageTool from "./PdfImageTool";

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
  constructor() {
    FakeWorker.instances.push(this);
  }
}

describe("PDF ↔ image tool", () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal("Worker", FakeWorker);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:conversion");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("sends a local PDF to the rendering worker and downloads its result", async () => {
    const view = render(<PdfImageTool locale="en" />);
    fireEvent.change(screen.getByLabelText("PDF file"), {
      target: {
        files: [new File(["pdf"], "doc.pdf", { type: "application/pdf" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Convert" }));

    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "convert", mode: "pdf-to-image", range: "" }),
      expect.any(Array),
    );
    worker.onmessage?.(
      new MessageEvent("message", {
        data: {
          type: "result",
          id: 1,
          bytes: new Uint8Array([1]).buffer,
          name: "page-1.png",
          mimeType: "image/png",
        },
      }),
    );
    expect(
      await screen.findByRole("link", { name: "Download page-1.png" }),
    ).toHaveAttribute("href", "blob:conversion");
    view.unmount();
    expect(worker.terminate).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:conversion");
  });

  it("exposes image-to-PDF, cancellation, and Vietnamese privacy controls", () => {
    render(<PdfImageTool locale="vi" />);
    fireEvent.click(screen.getByRole("radio", { name: "Ảnh sang PDF" }));
    expect(screen.getByLabelText("Các ảnh")).toHaveAttribute("multiple");
    expect(screen.getByText(/không rời khỏi trình duyệt/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy xử lý" })).toBeDisabled();
  });
});
