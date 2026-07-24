import { useEffect, useRef, useState } from "react";

import {
  ToolActions,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  COLLAGE_IMAGE_TYPES,
  MAX_COLLAGE_FILE_BYTES,
  MAX_COLLAGE_IMAGES,
  layoutCollage,
  type CollageFit,
  type CollageFormat,
  type CollageLayout,
} from "./collage";

const copy = {
  en: {
    title: "Photo collage",
    description:
      "Arrange local photos into a clean grid and download one image.",
    input: "Photos and layout",
    photos: "Photos",
    accepted: "Select 2–12 PNG, JPEG, or WebP images, up to 25 MB each.",
    privacy: "Selected photos and the collage do not leave your browser.",
    layout: "Layout",
    grid: "Grid",
    horizontal: "Horizontal",
    vertical: "Vertical",
    fit: "Image placement",
    fill: "Fill and crop",
    contain: "Fit whole image",
    gap: "Gap",
    background: "Background",
    width: "Output width",
    format: "Format",
    moveEarlier: (name: string) => `Move ${name} earlier`,
    moveLater: (name: string) => `Move ${name} later`,
    remove: (name: string) => `Remove ${name}`,
    render: "Render collage",
    cancel: "Cancel rendering",
    reset: "Reset",
    output: "Collage preview",
    empty: "The rendered collage will appear here.",
    preview: "Rendered photo collage",
    ready: (width: number, height: number) =>
      `Collage ready · ${width}×${height}`,
    processing: "Rendering collage…",
    cancelled: "Rendering cancelled.",
    downloadPng: "Download collage.png",
    downloadJpeg: "Download collage.jpg",
    invalidType: "Choose only PNG, JPEG, or WebP images.",
    tooLarge: "Each image must be 25 MB or smaller.",
    tooMany: "Choose no more than 12 images.",
    tooFew: "Choose at least 2 images.",
    invalidSettings: "Check the output width and gap settings.",
    failed: "Could not render the collage.",
  },
  vi: {
    title: "Ghép ảnh (collage)",
    description:
      "Sắp xếp ảnh cục bộ thành một lưới gọn gàng và tải xuống một ảnh.",
    input: "Ảnh và bố cục",
    photos: "Ảnh",
    accepted: "Chọn 2–12 ảnh PNG, JPEG hoặc WebP, tối đa 25 MB mỗi ảnh.",
    privacy: "Ảnh đã chọn và ảnh ghép không rời khỏi trình duyệt.",
    layout: "Bố cục",
    grid: "Lưới",
    horizontal: "Ngang",
    vertical: "Dọc",
    fit: "Cách đặt ảnh",
    fill: "Lấp đầy và cắt",
    contain: "Vừa toàn bộ ảnh",
    gap: "Khoảng cách",
    background: "Nền",
    width: "Chiều rộng đầu ra",
    format: "Định dạng",
    moveEarlier: (name: string) => `Chuyển ${name} lên trước`,
    moveLater: (name: string) => `Chuyển ${name} ra sau`,
    remove: (name: string) => `Xóa ${name}`,
    render: "Kết xuất ảnh ghép",
    cancel: "Hủy kết xuất",
    reset: "Đặt lại",
    output: "Xem trước ảnh ghép",
    empty: "Ảnh ghép đã kết xuất sẽ hiện ở đây.",
    preview: "Ảnh ghép đã kết xuất",
    ready: (width: number, height: number) =>
      `Ảnh ghép sẵn sàng · ${width}×${height}`,
    processing: "Đang kết xuất ảnh ghép…",
    cancelled: "Đã hủy kết xuất.",
    downloadPng: "Tải collage.png",
    downloadJpeg: "Tải collage.jpg",
    invalidType: "Chỉ chọn ảnh PNG, JPEG hoặc WebP.",
    tooLarge: "Mỗi ảnh phải có dung lượng từ 25 MB trở xuống.",
    tooMany: "Chọn không quá 12 ảnh.",
    tooFew: "Hãy chọn ít nhất 2 ảnh.",
    invalidSettings: "Hãy kiểm tra chiều rộng đầu ra và khoảng cách.",
    failed: "Không thể kết xuất ảnh ghép.",
  },
} as const;

type ImageItem = {
  id: number;
  file: File;
};

type WorkerResponse =
  | {
      type: "progress";
      id: number;
      completed: number;
      total: number;
    }
  | {
      type: "result";
      id: number;
      blob: Blob;
      width: number;
      height: number;
    }
  | { type: "error"; id: number; message?: string };

type CollageStatus =
  | { type: "processing" }
  | { type: "progress"; completed: number; total: number }
  | { type: "ready"; width: number; height: number }
  | { type: "cancelled" }
  | null;

export default function PhotoCollageTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [images, setImages] = useState<ImageItem[]>([]);
  const [layout, setLayout] = useState<CollageLayout>("grid");
  const [fit, setFit] = useState<CollageFit>("fill");
  const [gap, setGap] = useState(16);
  const [background, setBackground] = useState("#ffffff");
  const [width, setWidth] = useState(1200);
  const [format, setFormat] = useState<CollageFormat>("image/png");
  const [resultFormat, setResultFormat] = useState<CollageFormat | null>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<CollageStatus>(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef("");
  const operationRef = useRef(0);
  const nextImageId = useRef(0);

  const stopWorker = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
  };

  const revokePreview = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = "";
    setPreviewUrl("");
    setResultFormat(null);
  };

  useEffect(
    () => () => {
      stopWorker();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const selectImages = (files: FileList | null) => {
    setError("");
    setStatus(null);
    revokePreview();
    const selected = Array.from(files ?? []);
    if (selected.length > MAX_COLLAGE_IMAGES) {
      setImages([]);
      setError(t.tooMany);
      return;
    }
    if (
      selected.some(
        (file) =>
          !(COLLAGE_IMAGE_TYPES as readonly string[]).includes(file.type),
      )
    ) {
      setImages([]);
      setError(t.invalidType);
      return;
    }
    if (selected.some((file) => file.size > MAX_COLLAGE_FILE_BYTES)) {
      setImages([]);
      setError(t.tooLarge);
      return;
    }
    setImages(
      selected.map((file) => {
        nextImageId.current += 1;
        return { id: nextImageId.current, file };
      }),
    );
  };

  const move = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= images.length) return;
    setImages((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    revokePreview();
  };

  const remove = (id: number) => {
    setImages((current) => current.filter((item) => item.id !== id));
    revokePreview();
  };

  const renderCollage = async () => {
    setError("");
    if (images.length < 2) {
      setError(t.tooFew);
      return;
    }
    try {
      layoutCollage({ layout, count: images.length, width, gap });
    } catch {
      setError(t.invalidSettings);
      return;
    }

    operationRef.current += 1;
    const id = operationRef.current;
    stopWorker();
    revokePreview();
    setRunning(true);
    setStatus({ type: "processing" });
    try {
      const buffers = await Promise.all(
        images.map((item) => item.file.arrayBuffer()),
      );
      if (operationRef.current !== id) return;
      const worker = new Worker(
        new URL("./photo-collage.worker.ts", import.meta.url),
        { type: "module" },
      );
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const response = event.data;
        if (response.id !== id) return;
        if (response.type === "progress") {
          setStatus({
            type: "progress",
            completed: response.completed,
            total: response.total,
          });
          return;
        }
        setRunning(false);
        stopWorker();
        if (response.type === "result") {
          const url = URL.createObjectURL(response.blob);
          urlRef.current = url;
          setPreviewUrl(url);
          setResultFormat(
            response.blob.type === "image/jpeg" ? "image/jpeg" : "image/png",
          );
          setStatus({
            type: "ready",
            width: response.width,
            height: response.height,
          });
        } else {
          setStatus(null);
          setError(response.message || t.failed);
        }
      };
      worker.onerror = () => {
        setRunning(false);
        setStatus(null);
        setError(t.failed);
        stopWorker();
      };
      worker.postMessage(
        {
          type: "render",
          id,
          images: images.map((item, index) => ({
            name: item.file.name,
            type: item.file.type,
            bytes: buffers[index],
          })),
          settings: { layout, fit, gap, background, width, format },
        },
        buffers,
      );
    } catch {
      setRunning(false);
      setStatus(null);
      setError(t.failed);
    }
  };

  const cancel = () => {
    if (!running) return;
    operationRef.current += 1;
    stopWorker();
    setRunning(false);
    setStatus({ type: "cancelled" });
  };

  const reset = () => {
    operationRef.current += 1;
    stopWorker();
    revokePreview();
    setImages([]);
    setLayout("grid");
    setFit("fill");
    setGap(16);
    setBackground("#ffffff");
    setWidth(1200);
    setFormat("image/png");
    setRunning(false);
    setStatus(null);
    setError("");
    setInputKey((current) => current + 1);
  };

  const downloadFormat = resultFormat ?? format;
  const downloadName =
    downloadFormat === "image/png" ? "collage.png" : "collage.jpg";
  const downloadLabel =
    downloadFormat === "image/png" ? t.downloadPng : t.downloadJpeg;
  const statusText =
    status?.type === "ready"
      ? t.ready(status.width, status.height)
      : status?.type === "progress"
        ? `${t.processing} ${status.completed}/${status.total}`
        : status?.type === "processing"
          ? t.processing
          : status?.type === "cancelled"
            ? t.cancelled
            : "";
  const controlClass =
    "mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]";

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[460px_1fr]">
        <ToolPanel title={t.input}>
          <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.photos}
            <input
              key={inputKey}
              aria-label={t.photos}
              type="file"
              multiple
              accept={COLLAGE_IMAGE_TYPES.join(",")}
              onChange={(event) => selectImages(event.target.files)}
              className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--vt-border-2)] file:px-3 file:py-2 file:text-xs"
            />
            <span className="mt-1 block font-normal text-[var(--vt-text-3)]">
              {t.accepted}
            </span>
          </label>

          {images.length ? (
            <ol className="mt-4 space-y-2">
              {images.map((item, index) => (
                <li
                  key={item.id}
                  className="flex min-w-0 items-center gap-2 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] p-2"
                >
                  <span className="min-w-0 flex-1 truncate text-xs">
                    {item.file.name}
                  </span>
                  <button
                    type="button"
                    aria-label={t.moveEarlier(item.file.name)}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="rounded border border-[var(--vt-border-2)] px-2 py-1 text-xs disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={t.moveLater(item.file.name)}
                    disabled={index === images.length - 1}
                    onClick={() => move(index, 1)}
                    className="rounded border border-[var(--vt-border-2)] px-2 py-1 text-xs disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={t.remove(item.file.name)}
                    onClick={() => remove(item.id)}
                    className="rounded border border-[var(--vt-border-2)] px-2 py-1 text-xs"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ol>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.layout}
              <select
                aria-label={t.layout}
                value={layout}
                onChange={(event) =>
                  setLayout(event.target.value as CollageLayout)
                }
                className={controlClass}
              >
                <option value="grid">{t.grid}</option>
                <option value="horizontal">{t.horizontal}</option>
                <option value="vertical">{t.vertical}</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.fit}
              <select
                aria-label={t.fit}
                value={fit}
                onChange={(event) => setFit(event.target.value as CollageFit)}
                className={controlClass}
              >
                <option value="fill">{t.fill}</option>
                <option value="fit">{t.contain}</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.gap}
              <input
                aria-label={t.gap}
                type="number"
                min={0}
                max={128}
                value={gap}
                onChange={(event) => setGap(Number(event.target.value))}
                className={controlClass}
              />
            </label>
            <label className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.background}
              <input
                aria-label={t.background}
                type="color"
                value={background}
                onChange={(event) => setBackground(event.target.value)}
                className={`${controlClass} h-10 p-1`}
              />
            </label>
            <label className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.width}
              <input
                aria-label={t.width}
                type="number"
                min={320}
                max={4096}
                value={width}
                onChange={(event) => setWidth(Number(event.target.value))}
                className={controlClass}
              />
            </label>
            <label className="text-xs font-semibold text-[var(--vt-text-2)]">
              {t.format}
              <select
                aria-label={t.format}
                value={format}
                onChange={(event) =>
                  setFormat(event.target.value as CollageFormat)
                }
                className={controlClass}
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG</option>
              </select>
            </label>
          </div>

          <p className="mt-4 text-xs text-[var(--vt-text-3)]">{t.privacy}</p>
          {error ? (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-[var(--vt-red)]/40 p-3 text-xs text-[var(--vt-red)]"
            >
              {error}
            </p>
          ) : null}
          <ToolActions>
            <button
              type="button"
              onClick={() => void renderCollage()}
              disabled={running}
            >
              {t.render}
            </button>
            <button type="button" onClick={cancel} disabled={!running}>
              {t.cancel}
            </button>
            <button type="button" onClick={reset}>
              {t.reset}
            </button>
          </ToolActions>
        </ToolPanel>

        <ToolPanel title={t.output}>
          {statusText ? (
            <p role="status" aria-live="polite" className="mb-3 text-sm">
              {statusText}
            </p>
          ) : null}
          {previewUrl ? (
            <div>
              <img
                src={previewUrl}
                alt={t.preview}
                className="max-h-[620px] w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] object-contain"
              />
              <a
                href={previewUrl}
                download={downloadName}
                className="mt-4 inline-flex rounded-lg bg-[var(--vt-accent)] px-3 py-2 text-xs font-bold text-white"
              >
                {downloadLabel}
              </a>
            </div>
          ) : (
            <p className="text-sm text-[var(--vt-text-3)]">{t.empty}</p>
          )}
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}
