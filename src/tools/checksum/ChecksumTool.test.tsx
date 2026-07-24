import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ChecksumTool from "./ChecksumTool";

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

describe("File checksum tool", () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal("Worker", FakeWorker);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("streams acknowledged file chunks and shows verification", async () => {
    render(<ChecksumTool locale="en" />);
    fireEvent.change(screen.getByLabelText("File"), {
      target: { files: [new File(["abc"], "abc.txt")] },
    });
    fireEvent.change(screen.getByLabelText("Expected checksum"), {
      target: {
        value:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate checksum" }));

    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "start", algorithm: "sha256", total: 3 }),
    );
    worker.onmessage?.(
      new MessageEvent("message", { data: { type: "ready", id: 1 } }),
    );
    await waitFor(() =>
      expect(worker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "chunk" }),
        expect.any(Array),
      ),
    );
    worker.onmessage?.(
      new MessageEvent("message", {
        data: { type: "progress", id: 1, processed: 3, total: 3 },
      }),
    );
    await waitFor(() =>
      expect(worker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "finish" }),
      ),
    );
    worker.onmessage?.(
      new MessageEvent("message", {
        data: {
          type: "result",
          id: 1,
          hash:
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        },
      }),
    );
    expect(await screen.findByText("Checksum matches.")).toBeInTheDocument();
  });

  it("exposes legacy labeling, cancellation, and Vietnamese privacy copy", () => {
    render(<ChecksumTool locale="vi" />);
    expect(screen.getByRole("option", { name: /MD5.*cũ/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy xử lý" })).toBeDisabled();
    expect(screen.getByText(/không rời khỏi trình duyệt/i)).toBeInTheDocument();
  });
});
