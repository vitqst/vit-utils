import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CertificateTool from "./CertificateTool";

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

describe("X.509 decoder tool", () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal("Worker", FakeWorker);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("decodes a local DER file in a worker and renders fields", async () => {
    const view = render(<CertificateTool locale="en" />);
    fireEvent.click(screen.getByRole("radio", { name: "Certificate file" }));
    fireEvent.change(
      screen.getByLabelText("Certificate file", {
        selector: 'input[type="file"]',
      }),
      {
        target: {
          files: [
            new File([new Uint8Array([48, 3, 2, 1, 1])], "cert.cer", {
              type: "application/pkix-cert",
            }),
          ],
        },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Decode certificate" }));
    await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "decode" }),
      expect.any(Array),
    );
    worker.onmessage?.(
      new MessageEvent("message", {
        data: {
          type: "result",
          id: 2,
          certificate: {
            subject: "CN=example.com",
            issuer: "CN=Example CA",
            serialNumber: "01AB",
            notBefore: "2026-01-01T00:00:00.000Z",
            notAfter: "2027-01-01T00:00:00.000Z",
            validity: "valid",
            signatureAlgorithm: "RSASSA-PKCS1-v1_5 / SHA-256",
            publicKeyAlgorithm: "RSA 2048-bit",
            fingerprint: "AA:BB",
            selfSigned: false,
            extensions: [{ oid: "2.5.29.19", critical: true }],
          },
        },
      }),
    );
    expect(await screen.findByText("CN=example.com")).toBeInTheDocument();
    expect(screen.getByText("AA:BB")).toBeInTheDocument();
    view.unmount();
    expect(worker.terminate).toHaveBeenCalled();
  });

  it("exposes PEM, cancel, reset, and Vietnamese trust warning", () => {
    render(<CertificateTool locale="vi" />);
    expect(screen.getByLabelText("Chứng chỉ PEM")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy giải mã" })).toBeDisabled();
    expect(
      screen.getByText(/Các trường đã giải mã không xác lập độ tin cậy/i),
    ).toBeInTheDocument();
  });
});
