import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PhotoCollageTool from "./PhotoCollageTool";

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

describe("Photo collage tool", () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal("Worker", FakeWorker);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:photo-collage");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("orders local images, renders in a worker, and cleans up the preview", async () => {
    const view = render(<PhotoCollageTool locale="en" />);
    const first = new File(["first"], "first.png", { type: "image/png" });
    const second = new File(["second"], "second.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(screen.getByLabelText("Photos"), {
      target: { files: [first, second] },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Move second.jpg earlier" }),
    );
    fireEvent.change(screen.getByLabelText("Output width"), {
      target: { value: "900" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Render collage" }));

    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "render",
        id: 1,
        images: [
          expect.objectContaining({ name: "second.jpg", type: "image/jpeg" }),
          expect.objectContaining({ name: "first.png", type: "image/png" }),
        ],
        settings: expect.objectContaining({
          layout: "grid",
          fit: "fill",
          width: 900,
          format: "image/png",
        }),
      }),
      expect.any(Array),
    );

    act(() => {
      worker.onmessage?.(
        new MessageEvent("message", {
          data: {
            type: "result",
            id: 1,
            blob: new Blob(["collage"], { type: "image/png" }),
            width: 900,
            height: 900,
          },
        }),
      );
    });
    expect(
      await screen.findByRole("img", { name: "Rendered photo collage" }),
    ).toHaveAttribute("src", "blob:photo-collage");
    expect(
      screen.getByRole("link", { name: "Download collage.png" }),
    ).toHaveAttribute("download", "collage.png");
    fireEvent.change(screen.getByLabelText("Format"), {
      target: { value: "image/jpeg" },
    });
    expect(
      screen.getByRole("link", { name: "Download collage.png" }),
    ).toHaveAttribute("download", "collage.png");

    view.rerender(<PhotoCollageTool locale="vi" />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Ảnh ghép sẵn sàng · 900×900",
    );

    view.unmount();
    expect(worker.terminate).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:photo-collage");
  });

  it("validates selection and exposes cancellation and Vietnamese privacy copy", async () => {
    render(<PhotoCollageTool locale="vi" />);
    expect(screen.getByText(/không rời khỏi trình duyệt/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Ảnh"), {
      target: {
        files: [new File(["gif"], "animated.gif", { type: "image/gif" })],
      },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/PNG, JPEG hoặc WebP/);

    fireEvent.change(screen.getByLabelText("Ảnh"), {
      target: {
        files: [new File(["one"], "one.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kết xuất ảnh ghép" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/ít nhất 2 ảnh/i);

    fireEvent.change(screen.getByLabelText("Ảnh"), {
      target: {
        files: [
          new File(["one"], "one.png", { type: "image/png" }),
          new File(["two"], "two.png", { type: "image/png" }),
        ],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kết xuất ảnh ghép" }));
    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    fireEvent.click(screen.getByRole("button", { name: "Hủy kết xuất" }));
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(/đã hủy/i);
  });
});
