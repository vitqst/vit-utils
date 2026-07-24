import { useRef, useState } from "react";

import {
  ToolPanel,
  ToolTextArea,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  buildQrPayload,
  generateQrPng,
  generateQrSvg,
  type ContactPayload,
  type QrErrorCorrection,
  type QrPayloadType,
  type QrRenderOptions,
  type WifiPayload,
  type WifiSecurity,
} from "./qr";

const copy = {
  en: {
    title: "QR code",
    description:
      "Generate private QR codes for text, links, Wi-Fi, or contacts with SVG and PNG downloads.",
    settings: "Content and rendering",
    type: "Payload type",
    text: "Text",
    url: "Web link",
    wifi: "Wi-Fi",
    contact: "Contact",
    content: "QR content",
    network: "Network name",
    security: "Security",
    password: "Wi-Fi password",
    hidden: "Hidden network",
    name: "Contact name",
    phone: "Phone",
    email: "Email",
    organization: "Organization",
    correction: "Error correction",
    width: "Image width",
    margin: "Margin",
    dark: "Dark color",
    light: "Light color",
    generate: "Generate QR code",
    preview: "QR preview",
    imageAlt: "Generated QR code",
    empty: "Generate a QR code to preview it.",
    svg: "Download SVG",
    png: "Download PNG",
  },
  vi: {
    title: "Mã QR",
    description:
      "Tạo mã QR riêng tư cho văn bản, liên kết, Wi-Fi hoặc liên hệ, tải SVG và PNG.",
    settings: "Nội dung và hiển thị",
    type: "Loại nội dung",
    text: "Văn bản",
    url: "Liên kết web",
    wifi: "Wi-Fi",
    contact: "Liên hệ",
    content: "Nội dung QR",
    network: "Tên mạng",
    security: "Bảo mật",
    password: "Mật khẩu Wi-Fi",
    hidden: "Mạng ẩn",
    name: "Tên liên hệ",
    phone: "Điện thoại",
    email: "Email",
    organization: "Tổ chức",
    correction: "Sửa lỗi",
    width: "Chiều rộng ảnh",
    margin: "Lề",
    dark: "Màu tối",
    light: "Màu sáng",
    generate: "Tạo mã QR",
    preview: "Xem trước QR",
    imageAlt: "Mã QR đã tạo",
    empty: "Tạo mã QR để xem trước.",
    svg: "Tải SVG",
    png: "Tải PNG",
  },
} as const;

export default function QrTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const requestId = useRef(0);
  const [type, setType] = useState<QrPayloadType>("text");
  const [text, setText] = useState("");
  const [wifi, setWifi] = useState<WifiPayload>({
    security: "WPA",
    ssid: "",
    password: "",
    hidden: false,
  });
  const [contact, setContact] = useState<ContactPayload>({
    name: "",
    phone: "",
    email: "",
    organization: "",
  });
  const [options, setOptions] = useState<QrRenderOptions>({
    width: 384,
    margin: 4,
    dark: "#111111",
    light: "#ffffff",
    errorCorrectionLevel: "M",
  });
  const [payload, setPayload] = useState("");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const svgHref = svg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    : "";

  const currentPayload = () =>
    type === "wifi"
      ? buildQrPayload(type, wifi)
      : type === "contact"
        ? buildQrPayload(type, contact)
        : buildQrPayload(type, { text });

  const generate = async () => {
    const currentRequest = ++requestId.current;
    setBusy(true);
    try {
      const nextPayload = currentPayload();
      const nextSvg = await generateQrSvg(nextPayload, options);
      if (requestId.current !== currentRequest) return;
      setPayload(nextPayload);
      setSvg(nextSvg);
      setError("");
    } catch (generationError) {
      if (requestId.current !== currentRequest) return;
      setPayload("");
      setSvg("");
      setError(
        generationError instanceof Error
          ? generationError.message
          : String(generationError),
      );
    } finally {
      if (requestId.current === currentRequest) setBusy(false);
    }
  };

  const downloadPng = async () => {
    try {
      const href = await generateQrPng(payload, options);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = "qr-code.png";
      anchor.click();
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : String(generationError),
      );
    }
  };

  const textInput = (label: string, value: string, update: (value: string) => void) => (
    <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
      {label}
      <input
        aria-label={label}
        value={value}
        onChange={(event) => update(event.target.value)}
        className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
      />
    </label>
  );

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel title={t.settings}>
          <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.type}
            <select
              aria-label={t.type}
              value={type}
              onChange={(event) => setType(event.target.value as QrPayloadType)}
              className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
            >
              {(["text", "url", "wifi", "contact"] as const).map((value) => (
                <option key={value} value={value}>{t[value]}</option>
              ))}
            </select>
          </label>
          {type === "text" || type === "url" ? (
            <div className="mt-4">
              <ToolTextArea
                label={t.content}
                value={text}
                onChange={setText}
                rows={5}
              />
            </div>
          ) : type === "wifi" ? (
            <div className="mt-4 space-y-3">
              {textInput(t.network, wifi.ssid, (ssid) =>
                setWifi((current) => ({ ...current, ssid })))}
              <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
                {t.security}
                <select
                  aria-label={t.security}
                  value={wifi.security}
                  onChange={(event) =>
                    setWifi((current) => ({
                      ...current,
                      security: event.target.value as WifiSecurity,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
                >
                  <option value="WPA">WPA/WPA2/WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </select>
              </label>
              {wifi.security !== "nopass"
                ? textInput(t.password, wifi.password, (password) =>
                    setWifi((current) => ({ ...current, password })))
                : null}
              <label className="flex items-center gap-2 text-sm text-[var(--vt-text)]">
                <input
                  type="checkbox"
                  checked={wifi.hidden}
                  onChange={(event) =>
                    setWifi((current) => ({
                      ...current,
                      hidden: event.target.checked,
                    }))
                  }
                />
                {t.hidden}
              </label>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  ["name", t.name],
                  ["phone", t.phone],
                  ["email", t.email],
                  ["organization", t.organization],
                ] as const
              ).map(([key, label]) =>
                textInput(label, contact[key], (value) =>
                  setContact((current) => ({ ...current, [key]: value }))),
              )}
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.correction}
              <select
                aria-label={t.correction}
                value={options.errorCorrectionLevel}
                onChange={(event) =>
                  setOptions((current) => ({
                    ...current,
                    errorCorrectionLevel: event.target.value as QrErrorCorrection,
                  }))
                }
                className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
              >
                {(["L", "M", "Q", "H"] as const).map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>
            {(
              [
                [t.width, "width", options.width, 128, 2048],
                [t.margin, "margin", options.margin, 0, 20],
              ] as const
            ).map(([label, key, value, min, max]) => (
              <label key={key} className="text-xs font-semibold text-[var(--vt-text-2)]">
                {label}
                <input
                  type="number"
                  aria-label={label}
                  value={value}
                  min={min}
                  max={max}
                  onChange={(event) =>
                    setOptions((current) => ({
                      ...current,
                      [key]: Number(event.target.value),
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 font-mono text-sm text-[var(--vt-text)]"
                />
              </label>
            ))}
            {(
              [
                [t.dark, "dark", options.dark],
                [t.light, "light", options.light],
              ] as const
            ).map(([label, key, value]) => (
              <label key={key} className="text-xs font-semibold text-[var(--vt-text-2)]">
                {label}
                <input
                  type="color"
                  aria-label={label}
                  value={value}
                  onChange={(event) =>
                    setOptions((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  className="mt-1.5 h-10 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] p-1"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            aria-label={t.generate}
            disabled={busy}
            onClick={() => void generate()}
            className="mt-4 w-full rounded-lg bg-[var(--vt-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--vt-accent-ink)] disabled:opacity-50"
          >
            {t.generate}
          </button>
        </ToolPanel>
        <ToolPanel title={t.preview}>
          {error ? (
            <p role="alert" className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 text-xs text-[var(--vt-red)]">
              {error}
            </p>
          ) : svgHref ? (
            <img
              src={svgHref}
              alt={t.imageAlt}
              className="mx-auto max-h-[420px] max-w-full rounded-lg bg-white p-3"
            />
          ) : (
            <p className="text-sm text-[var(--vt-text-3)]">{t.empty}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {svgHref ? (
              <a
                href={svgHref}
                download="qr-code.svg"
                className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)]"
              >
                {t.svg}
              </a>
            ) : null}
            <button
              type="button"
              disabled={!payload || busy}
              onClick={() => void downloadPng()}
              className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-accent)] disabled:opacity-50"
            >
              {t.png}
            </button>
          </div>
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}

