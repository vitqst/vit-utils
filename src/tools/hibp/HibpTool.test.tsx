import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import HibpTool from "./HibpTool";

describe("HIBP breach checker", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("waits for explicit activation and sends only a padded SHA-1 prefix", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        "1E4C9B93F3F0682250B6CF8331B7EE68FD8:42\r\n" +
        `${"A".repeat(35)}:0\r\n`,
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<HibpTool locale="en" />);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password" },
    });
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Check HIBP" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.pwnedpasswords.com/range/5BAA6",
      expect.objectContaining({
        method: "GET",
        headers: { "Add-Padding": "true" },
        cache: "no-store",
        credentials: "omit",
        mode: "cors",
        redirect: "error",
        referrerPolicy: "no-referrer",
        signal: expect.any(AbortSignal),
      }),
    );
    expect(await screen.findByText(/42 known breach records/i)).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][1]).not.toHaveProperty("body");
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain(
      "5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8",
    );
  });

  it("aborts, clears secrets, and discloses the request in Vietnamese", async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, options: RequestInit) => {
        signal = options.signal as AbortSignal;
        return new Promise((_resolve, reject) => {
          signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        });
      }),
    );
    render(<HibpTool locale="vi" />);
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "bí mật" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kiểm tra HIBP" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Hủy yêu cầu" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Hủy yêu cầu" }));
    expect(signal?.aborted).toBe(true);
    expect(screen.getByText(/5 ký tự đầu.*SHA-1/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xóa" }));
    expect(screen.getByLabelText("Mật khẩu")).toHaveValue("");
  });
});
