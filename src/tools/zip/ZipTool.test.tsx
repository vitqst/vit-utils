import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ZipTool from "./ZipTool";

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

describe("Zip / unzip tool", () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal("Worker", FakeWorker);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:archive");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates an archive in a worker and cleans up its result", async () => {
    const view = render(<ZipTool locale="en" />);
    fireEvent.change(screen.getByLabelText("Files"), {
      target: { files: [new File(["a"], "a.txt"), new File(["b"], "b.txt")] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create ZIP" }));
    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "process", mode: "create" }),
      expect.any(Array),
    );
    worker.onmessage?.(
      new MessageEvent("message", {
        data: {
          type: "result",
          id: 1,
          bytes: new Uint8Array([80, 75]).buffer,
          name: "archive.zip",
          entries: ["a.txt", "b.txt"],
        },
      }),
    );
    expect(await screen.findByRole("link", { name: "Download archive.zip" })).toHaveAttribute("href", "blob:archive");
    expect(screen.getByRole("list", { name: "Archive entries" })).toHaveTextContent("a.txt");
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:archive");
  });

  it("exposes safe extraction, cancellation, and Vietnamese privacy copy", () => {
    render(<ZipTool locale="vi" />);
    fireEvent.click(screen.getByRole("radio", { name: "Giải nén an toàn" }));
    expect(screen.getByLabelText("Tệp ZIP")).toHaveAttribute("accept", expect.stringContaining(".zip"));
    expect(screen.getByRole("button", { name: "Hủy xử lý" })).toBeDisabled();
    expect(screen.getByText(/không rời khỏi trình duyệt/i)).toBeInTheDocument();
  });
});
