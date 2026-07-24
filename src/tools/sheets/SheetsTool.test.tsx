import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SheetsTool from "./SheetsTool";

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

describe("CSV ↔ XLSX tool", () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal("Worker", FakeWorker);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:sheet");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("converts CSV in a worker and presents a table preview", async () => {
    const view = render(<SheetsTool locale="en" />);
    fireEvent.change(screen.getByLabelText("CSV file"), {
      target: { files: [new File(["name\nVịt"], "data.csv", { type: "text/csv" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Convert" }));
    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "convert", mode: "csv-to-xlsx" }),
      expect.any(Array),
    );
    worker.onmessage?.(
      new MessageEvent("message", {
        data: {
          type: "result",
          id: 1,
          bytes: new Uint8Array([1]).buffer,
          name: "converted.xlsx",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          preview: [["name"], ["Vịt"]],
        },
      }),
    );
    expect(await screen.findByRole("table", { name: "Preview" })).toHaveTextContent("Vịt");
    expect(screen.getByRole("link", { name: "Download converted.xlsx" })).toHaveAttribute("href", "blob:sheet");
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:sheet");
  });

  it("exposes XLSX mode, cancellation, and Vietnamese local-only copy", () => {
    render(<SheetsTool locale="vi" />);
    fireEvent.click(screen.getByRole("radio", { name: "XLSX sang CSV" }));
    expect(screen.getByLabelText("Tệp XLSX")).toHaveAttribute("accept", expect.stringContaining(".xlsx"));
    expect(screen.getByRole("button", { name: "Hủy xử lý" })).toBeDisabled();
    expect(screen.getByText(/không rời khỏi trình duyệt/i)).toBeInTheDocument();
  });
});
