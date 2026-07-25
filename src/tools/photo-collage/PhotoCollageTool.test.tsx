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

describe("Photo collage editor", () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal("Worker", FakeWorker);
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(URL, "createObjectURL").mockImplementation((value) =>
      value instanceof File ? `blob:${value.name}` : "blob:photo-collage",
    );
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("previews local photos and exports the selected template, aspect, and crop controls", async () => {
    const view = render(<PhotoCollageTool locale="en" />);
    const first = new File(["first"], "first.png", { type: "image/png" });
    const second = new File(["second"], "second.jpg", {
      type: "image/jpeg",
    });

    fireEvent.drop(screen.getByText(/Add photos/).closest("label")!, {
      dataTransfer: { files: [first, second] },
    });

    expect(screen.getAllByAltText("first.png preview")).not.toHaveLength(0);
    expect(screen.getByRole("region", { name: "Live collage preview" })).toBeInTheDocument();
    expect(screen.getByText("Feature left layout")).toBeVisible();
    fireEvent.click(
      screen.getByRole("radio", { name: "Feature left layout" }),
    );
    const firstCell = screen
      .getAllByRole("button", { name: "Select first.png" })
      .find((button) => button.classList.contains("absolute"))!;
    expect(firstCell.style.width).not.toContain("calc");
    expect(firstCell.style.borderRadius).toContain("/");
    fireEvent.click(screen.getByRole("radio", { name: "4:5" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: "Select second.jpg" })[0],
    );
    fireEvent.change(screen.getByLabelText("Zoom for second.jpg"), {
      target: { value: "180" },
    });
    fireEvent.change(screen.getByLabelText("Horizontal position for second.jpg"), {
      target: { value: "80" },
    });
    const livePhoto = screen
      .getAllByAltText("second.jpg preview")
      .find((image) => image.classList.contains("h-full"));
    expect(livePhoto).toHaveStyle({
      objectPosition: "80% 50%",
      transformOrigin: "80% 50%",
    });
    fireEvent.change(screen.getByLabelText("Corner radius"), {
      target: { value: "24" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Export collage" }));

    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "render",
        id: expect.any(Number),
        images: [
          expect.objectContaining({ name: "first.png", type: "image/png" }),
          expect.objectContaining({ name: "second.jpg", type: "image/jpeg" }),
        ],
        settings: expect.objectContaining({
          template: expect.objectContaining({ id: "feature-left" }),
          aspect: "4:5",
          fit: "fill",
          cornerRadius: 24,
          imageTransforms: [
            { zoom: 1, focalX: 0.5, focalY: 0.5 },
            { zoom: 1.8, focalX: 0.8, focalY: 0.5 },
          ],
          width: 1200,
          format: "image/png",
        }),
      }),
      expect.any(Array),
    );
    expect(fetch).not.toHaveBeenCalled();
    const requestId = worker.postMessage.mock.calls[0][0].id;

    act(() => {
      worker.onmessage?.(
        new MessageEvent("message", {
          data: {
            type: "result",
            id: requestId,
            blob: new Blob(["collage"], { type: "image/png" }),
            width: 1200,
            height: 1500,
          },
        }),
      );
    });
    expect(
      await screen.findByRole("link", { name: "Download collage.png" }),
    ).toHaveAttribute("download", "collage.png");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Collage ready · 1200×1500",
    );

    view.unmount();
    expect(worker.terminate).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:first.png");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:second.jpg");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:photo-collage");
  });

  it("keeps semantic reordering and removal alongside the visual editor", () => {
    render(<PhotoCollageTool locale="en" />);
    const first = new File(["first"], "first.png", { type: "image/png" });
    const second = new File(["second"], "second.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(screen.getByLabelText("Add photos"), {
      target: { files: [first, second] },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Move second.jpg earlier" }),
    );

    const photoList = screen.getByRole("list", { name: "Photos" });
    expect(photoList.textContent?.indexOf("second.jpg")).toBeLessThan(
      photoList.textContent?.indexOf("first.png") ?? 0,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove first.png" }));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:first.png");
  });

  it("swaps photos with touch pointer dragging", () => {
    render(<PhotoCollageTool locale="en" />);
    fireEvent.change(screen.getByLabelText("Add photos"), {
      target: {
        files: [
          new File(["first"], "first.png", { type: "image/png" }),
          new File(["second"], "second.png", { type: "image/png" }),
        ],
      },
    });
    const photoList = screen.getByRole("list", { name: "Photos" });
    const items = photoList.querySelectorAll("li");
    const handle = items[1].querySelector("span")!;

    fireEvent.pointerDown(handle, { pointerId: 7, pointerType: "touch" });
    fireEvent.pointerUp(items[0], {
      pointerId: 7,
      pointerType: "touch",
      clientX: 10,
      clientY: 10,
    });

    expect(photoList.textContent?.indexOf("second.png")).toBeLessThan(
      photoList.textContent?.indexOf("first.png") ?? 0,
    );
  });

  it("validates selection, exposes cancellation, and ships Vietnamese offline copy", async () => {
    render(<PhotoCollageTool locale="vi" />);
    expect(screen.getByText(/không rời khỏi trình duyệt/i)).toBeInTheDocument();
    expect(screen.getByText(/hoạt động ngoại tuyến/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Thêm ảnh"), {
      target: {
        files: [new File(["gif"], "animated.gif", { type: "image/gif" })],
      },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/PNG, JPEG hoặc WebP/);

    fireEvent.change(screen.getByLabelText("Thêm ảnh"), {
      target: {
        files: [new File(["one"], "one.png", { type: "image/png" })],
      },
    });
    expect(screen.getByText("Thu phóng")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Xuất ảnh ghép" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/ít nhất 2 ảnh/i);

    fireEvent.change(screen.getByLabelText("Thêm ảnh"), {
      target: {
        files: [new File(["two"], "two.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Xuất ảnh ghép" }));
    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    fireEvent.click(screen.getByRole("button", { name: "Hủy kết xuất" }));
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(/đã hủy/i);
  });

  it("does not start a worker when unmounted during file reads", async () => {
    let resolveRead!: (value: ArrayBuffer) => void;
    const read = new Promise<ArrayBuffer>((resolve) => {
      resolveRead = resolve;
    });
    const first = new File(["first"], "first.png", { type: "image/png" });
    const second = new File(["second"], "second.png", { type: "image/png" });
    vi.spyOn(first, "arrayBuffer").mockReturnValue(read);
    vi.spyOn(second, "arrayBuffer").mockReturnValue(read);
    const view = render(<PhotoCollageTool locale="en" />);

    fireEvent.change(screen.getByLabelText("Add photos"), {
      target: { files: [first, second] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Export collage" }));
    view.unmount();
    resolveRead(new Uint8Array([1]).buffer);
    await act(async () => {
      await read;
    });

    expect(FakeWorker.instances).toHaveLength(0);
  });

  it("terminates and ignores an active export when the composition changes", async () => {
    render(<PhotoCollageTool locale="en" />);
    fireEvent.change(screen.getByLabelText("Add photos"), {
      target: {
        files: [
          new File(["one"], "one.png", { type: "image/png" }),
          new File(["two"], "two.png", { type: "image/png" }),
        ],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Export collage" }));
    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];

    fireEvent.change(screen.getByLabelText("Spacing"), {
      target: { value: "32" },
    });
    expect(worker.terminate).toHaveBeenCalled();
    act(() => {
      worker.onmessage?.(
        new MessageEvent("message", {
          data: {
            type: "result",
            id: 1,
            blob: new Blob(["stale"], { type: "image/png" }),
            width: 1200,
            height: 1200,
          },
        }),
      );
    });
    expect(
      screen.queryByRole("link", { name: "Download collage.png" }),
    ).not.toBeInTheDocument();
  });

  it("localizes worker failures instead of exposing English internals", async () => {
    render(<PhotoCollageTool locale="vi" />);
    fireEvent.change(screen.getByLabelText("Thêm ảnh"), {
      target: {
        files: [
          new File(["one"], "one.png", { type: "image/png" }),
          new File(["two"], "two.png", { type: "image/png" }),
        ],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Xuất ảnh ghép" }));
    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    const requestId = worker.postMessage.mock.calls[0][0].id;

    act(() => {
      worker.onmessage?.(
        new MessageEvent("message", {
          data: {
            type: "error",
            id: requestId,
            message: "Rounded corners are unavailable in this browser.",
          },
        }),
      );
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Không thể kết xuất ảnh ghép.",
    );
  });
});
