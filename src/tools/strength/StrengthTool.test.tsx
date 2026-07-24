import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import StrengthTool from "./StrengthTool";

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

describe("Password strength tool", () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal("Worker", FakeWorker);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("evaluates in a worker without receiving the password back", async () => {
    const view = render(<StrengthTool locale="en" />);
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct horse battery staple" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Check strength" }));
    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith({
      type: "check",
      id: 1,
      password: "correct horse battery staple",
    });
    worker.onmessage?.(
      new MessageEvent("message", {
        data: {
          type: "result",
          id: 1,
          score: 4,
          guesses: 1e14,
          crackTime: "3 hours",
          warning: null,
          suggestions: [],
          patterns: ["dictionary", "bruteforce"],
        },
      }),
    );
    expect(await screen.findByText("Very strong")).toBeInTheDocument();
    expect(screen.getByText("Keep this password unique to one account.")).toBeInTheDocument();
    view.unmount();
    expect(worker.terminate).toHaveBeenCalled();
  });

  it("supports show/hide, cancel, reset, and Vietnamese copy", async () => {
    render(<StrengthTool locale="vi" />);
    const password = screen.getByLabelText("Mật khẩu");
    expect(password).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Hiện mật khẩu" }));
    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hủy đánh giá" })).toBeDisabled();
    expect(screen.getByText(/không được gửi hoặc lưu/i)).toBeInTheDocument();
  });
});
