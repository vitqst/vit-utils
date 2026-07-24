import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PdfTool from "./PdfTool";

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

describe("Merge / split PDF tool", () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal("Worker", FakeWorker);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:pdf-result");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("sends ordered PDFs to a worker and cleans up the download", async () => {
    const view = render(<PdfTool locale="en" />);
    const files = [
      new File(["first"], "first.pdf", { type: "application/pdf" }),
      new File(["second"], "second.pdf", { type: "application/pdf" }),
    ];
    fireEvent.change(screen.getByLabelText("PDF files"), {
      target: { files },
    });
    fireEvent.click(screen.getByRole("button", { name: "Process PDF" }));

    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "process",
        mode: "merge",
        files: [
          expect.objectContaining({ name: "first.pdf" }),
          expect.objectContaining({ name: "second.pdf" }),
        ],
      }),
      expect.any(Array),
    );

    worker.onmessage?.(
      new MessageEvent("message", {
        data: {
          type: "result",
          id: 1,
          bytes: new Uint8Array([37, 80, 68, 70]).buffer,
          pageCount: 2,
        },
      }),
    );
    expect(
      await screen.findByRole("link", { name: "Download merged.pdf" }),
    ).toHaveAttribute("href", "blob:pdf-result");
    view.unmount();
    expect(worker.terminate).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:pdf-result");
  });

  it("exposes split, range, cancel, reset, and Vietnamese privacy controls", () => {
    render(<PdfTool locale="vi" />);
    fireEvent.click(screen.getByRole("radio", { name: "Tách trang" }));
    expect(screen.getByLabelText("Phạm vi trang")).toHaveValue("");
    expect(screen.getByText(/không rời khỏi trình duyệt/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy xử lý" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Đặt lại" }));
    expect(screen.getByRole("radio", { name: "Gộp tệp" })).toBeChecked();
  });
});
