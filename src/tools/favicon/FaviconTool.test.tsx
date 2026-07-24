import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FaviconTool from "./FaviconTool";

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

describe("Favicon set tool", () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal("Worker", FakeWorker);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:favicon-result");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("generates locally, exposes progress and cleans up its result URL", async () => {
    const view = render(<FaviconTool locale="en" />);
    const file = new File(["image"], "source.png", { type: "image/png" });

    fireEvent.change(screen.getByLabelText("Source image"), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate favicon set" }));

    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "generate",
        mimeType: "image/png",
        appName: "Vịt Tools",
      }),
      expect.any(Array),
    );

    worker.onmessage?.(
      new MessageEvent("message", {
        data: { type: "progress", id: 1, completed: 3, total: 6 },
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("3 of 6");

    worker.onmessage?.(
      new MessageEvent("message", {
        data: {
          type: "result",
          id: 1,
          bytes: new Uint8Array([80, 75]).buffer,
        },
      }),
    );
    const download = await screen.findByRole("link", {
      name: "Download favicon-set.zip",
    });
    expect(download).toHaveAttribute("href", "blob:favicon-result");
    expect(download).toHaveAttribute("download", "favicon-set.zip");

    view.unmount();
    expect(worker.terminate).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:favicon-result");
  });

  it("offers cancellation, reset, validation, and Vietnamese privacy copy", async () => {
    render(<FaviconTool locale="vi" />);

    expect(screen.getByText(/không rời khỏi trình duyệt/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Ảnh nguồn"), {
      target: {
        files: [new File(["bad"], "source.gif", { type: "image/gif" })],
      },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/PNG, JPEG hoặc WebP/);

    fireEvent.click(screen.getByRole("button", { name: "Đặt lại" }));
    expect(screen.getByLabelText("Tên ứng dụng")).toHaveValue("Vịt Tools");
    expect(screen.getByRole("button", { name: "Hủy xử lý" })).toBeDisabled();
  });
});
