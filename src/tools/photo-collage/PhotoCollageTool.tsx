import { useEffect, useMemo, useRef, useState } from "react";

import { ToolWorkspace } from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  COLLAGE_IMAGE_TYPES,
  MAX_COLLAGE_FILE_BYTES,
  MAX_COLLAGE_IMAGES,
  collageFromTemplate,
  getCollageTemplates,
  type CollageAspect,
  type CollageFit,
  type CollageFormat,
  type CollageTemplate,
} from "./collage";

const copy = {
  en: {
    title: "Photo collage",
    description:
      "Build a polished collage from local photos with live layouts and crop controls.",
    offline: "Works offline",
    addPhotos: "Add photos",
    photos: "Photos",
    accepted: "PNG, JPEG, or WebP · 2–12 photos · 25 MB each",
    layouts: "Layouts",
    templateNames: {
      balanced: "Balanced layout",
      "feature-left": "Feature left layout",
      "feature-top": "Feature top layout",
      columns: "Columns layout",
    },
    livePreview: "Live collage preview",
    previewAlt: (name: string) => `${name} preview`,
    select: (name: string) => `Select ${name}`,
    moveEarlier: (name: string) => `Move ${name} earlier`,
    moveLater: (name: string) => `Move ${name} later`,
    remove: (name: string) => `Remove ${name}`,
    settings: "Collage settings",
    aspect: "Aspect ratio",
    original: "Original",
    spacing: "Spacing",
    corner: "Corner radius",
    background: "Background",
    fit: "Image fit",
    fill: "Fill",
    contain: "Fit",
    selectedPhoto: "Selected photo",
    noPhoto: "Select a photo in the preview to adjust its crop.",
    zoomLabel: "Zoom",
    zoom: (name: string) => `Zoom for ${name}`,
    horizontal: (name: string) => `Horizontal position for ${name}`,
    vertical: (name: string) => `Vertical position for ${name}`,
    output: "Output",
    width: "Output width",
    format: "Format",
    export: "Export collage",
    cancel: "Cancel rendering",
    reset: "Reset",
    empty:
      "Add local photos to start. Your images appear here immediately and are never uploaded.",
    privacy:
      "Selected photos, edits, previews, and exports do not leave your browser.",
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
    invalidSettings: "Check the output and collage settings.",
    failed: "Could not render the collage.",
  },
  vi: {
    title: "Ghép ảnh (collage)",
    description:
      "Tạo ảnh ghép đẹp từ ảnh cục bộ với bố cục trực tiếp và điều khiển vùng cắt.",
    offline: "Hoạt động ngoại tuyến",
    addPhotos: "Thêm ảnh",
    photos: "Ảnh",
    accepted: "PNG, JPEG hoặc WebP · 2–12 ảnh · 25 MB mỗi ảnh",
    layouts: "Bố cục",
    templateNames: {
      balanced: "Bố cục cân bằng",
      "feature-left": "Bố cục nổi bật bên trái",
      "feature-top": "Bố cục nổi bật phía trên",
      columns: "Bố cục cột",
    },
    livePreview: "Xem trước ảnh ghép trực tiếp",
    previewAlt: (name: string) => `Xem trước ${name}`,
    select: (name: string) => `Chọn ${name}`,
    moveEarlier: (name: string) => `Chuyển ${name} lên trước`,
    moveLater: (name: string) => `Chuyển ${name} ra sau`,
    remove: (name: string) => `Xóa ${name}`,
    settings: "Cài đặt ảnh ghép",
    aspect: "Tỷ lệ khung hình",
    original: "Gốc",
    spacing: "Khoảng cách",
    corner: "Bo góc",
    background: "Nền",
    fit: "Cách đặt ảnh",
    fill: "Lấp đầy",
    contain: "Vừa ảnh",
    selectedPhoto: "Ảnh đang chọn",
    noPhoto: "Chọn một ảnh trong vùng xem trước để điều chỉnh vùng cắt.",
    zoomLabel: "Thu phóng",
    zoom: (name: string) => `Thu phóng cho ${name}`,
    horizontal: (name: string) => `Vị trí ngang cho ${name}`,
    vertical: (name: string) => `Vị trí dọc cho ${name}`,
    output: "Đầu ra",
    width: "Chiều rộng đầu ra",
    format: "Định dạng",
    export: "Xuất ảnh ghép",
    cancel: "Hủy kết xuất",
    reset: "Đặt lại",
    empty:
      "Thêm ảnh cục bộ để bắt đầu. Ảnh xuất hiện ngay tại đây và không bao giờ được tải lên.",
    privacy:
      "Ảnh đã chọn, chỉnh sửa, bản xem trước và tệp xuất không rời khỏi trình duyệt.",
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
    invalidSettings: "Hãy kiểm tra cài đặt đầu ra và ảnh ghép.",
    failed: "Không thể kết xuất ảnh ghép.",
  },
} as const;

type ImageTransform = {
  zoom: number;
  focalX: number;
  focalY: number;
};

type ImageItem = {
  id: number;
  file: File;
  previewUrl: string;
  transform: ImageTransform;
};

type WorkerResponse =
  | { type: "progress"; id: number; completed: number; total: number }
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

const aspectValues: CollageAspect[] = [
  "original",
  "1:1",
  "4:5",
  "16:9",
  "9:16",
];

const aspectNumbers: Record<Exclude<CollageAspect, "original">, number> = {
  "1:1": 1,
  "4:5": 4 / 5,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
};

const singleTemplate: CollageTemplate = {
  id: "balanced",
  naturalAspect: 1,
  cells: [{ x: 0, y: 0, width: 1, height: 1 }],
};

export default function PhotoCollageTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [templateId, setTemplateId] = useState("balanced");
  const [aspect, setAspect] = useState<CollageAspect>("1:1");
  const [fit, setFit] = useState<CollageFit>("fill");
  const [gap, setGap] = useState(16);
  const [cornerRadius, setCornerRadius] = useState(12);
  const [background, setBackground] = useState("#ffffff");
  const [width, setWidth] = useState(1200);
  const [format, setFormat] = useState<CollageFormat>("image/png");
  const [resultFormat, setResultFormat] = useState<CollageFormat | null>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<CollageStatus>(null);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const resultUrlRef = useRef("");
  const imagesRef = useRef<ImageItem[]>([]);
  const operationRef = useRef(0);
  const nextImageId = useRef(0);
  const draggedId = useRef<number | null>(null);

  const templates = useMemo(
    () => (images.length >= 2 ? getCollageTemplates(images.length) : [singleTemplate]),
    [images.length],
  );
  const template =
    templates.find((candidate) => candidate.id === templateId) ?? templates[0];
  const selectedImage =
    images.find((image) => image.id === selectedId) ?? images[0] ?? null;
  const previewAspect =
    aspect === "original" ? template.naturalAspect : aspectNumbers[aspect];
  const previewGeometry = useMemo(() => {
    if (images.length < 2) {
      return {
        width: 1000,
        height: Math.round(1000 / previewAspect),
        cells: [{ x: 0, y: 0, width: 1000, height: Math.round(1000 / previewAspect) }],
      };
    }
    try {
      return collageFromTemplate({ template, aspect, width, gap });
    } catch {
      return null;
    }
  }, [aspect, gap, images.length, previewAspect, template, width]);

  imagesRef.current = images;

  const stopWorker = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
  };

  const revokeResult = () => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = "";
    setResultUrl("");
    setResultFormat(null);
  };

  const invalidateExport = () => {
    operationRef.current += 1;
    stopWorker();
    revokeResult();
    setRunning(false);
    setStatus(null);
  };

  useEffect(
    () => () => {
      operationRef.current += 1;
      stopWorker();
      imagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    },
    [],
  );

  const selectImages = (files: FileList | null) => {
    setError("");
    setStatus(null);
    const selected = Array.from(files ?? []);
    if (images.length + selected.length > MAX_COLLAGE_IMAGES) {
      setError(t.tooMany);
      return;
    }
    if (
      selected.some(
        (file) =>
          !(COLLAGE_IMAGE_TYPES as readonly string[]).includes(file.type),
      )
    ) {
      setError(t.invalidType);
      return;
    }
    if (selected.some((file) => file.size > MAX_COLLAGE_FILE_BYTES)) {
      setError(t.tooLarge);
      return;
    }
    const added = selected.map((file) => {
      nextImageId.current += 1;
      return {
        id: nextImageId.current,
        file,
        previewUrl: URL.createObjectURL(file),
        transform: { zoom: 1, focalX: 0.5, focalY: 0.5 },
      };
    });
    if (!added.length) return;
    invalidateExport();
    setImages((current) => [...current, ...added]);
    setSelectedId((current) => current ?? added[0].id);
    setTemplateId("balanced");
    setInputKey((current) => current + 1);
  };

  const move = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= images.length) return;
    invalidateExport();
    setImages((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const swap = (sourceId: number, targetId: number) => {
    if (sourceId === targetId) return;
    invalidateExport();
    setImages((current) => {
      const sourceIndex = current.findIndex((item) => item.id === sourceId);
      const targetIndex = current.findIndex((item) => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      [next[sourceIndex], next[targetIndex]] = [
        next[targetIndex],
        next[sourceIndex],
      ];
      return next;
    });
  };

  const remove = (id: number) => {
    const removed = images.find((image) => image.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    invalidateExport();
    const nextImages = images.filter((image) => image.id !== id);
    setImages(nextImages);
    if (selectedId === id) setSelectedId(nextImages[0]?.id ?? null);
    setTemplateId("balanced");
  };

  const updateSelectedTransform = (
    key: keyof ImageTransform,
    value: number,
  ) => {
    if (!selectedImage) return;
    invalidateExport();
    setImages((current) =>
      current.map((image) =>
        image.id === selectedImage.id
          ? { ...image, transform: { ...image.transform, [key]: value } }
          : image,
      ),
    );
  };

  const exportCollage = async () => {
    setError("");
    if (images.length < 2) {
      setError(t.tooFew);
      return;
    }
    try {
      collageFromTemplate({ template, aspect, width, gap });
    } catch {
      setError(t.invalidSettings);
      return;
    }

    operationRef.current += 1;
    const id = operationRef.current;
    stopWorker();
    revokeResult();
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
        if (response.id !== id || operationRef.current !== id) return;
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
          resultUrlRef.current = url;
          setResultUrl(url);
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
          setError(t.failed);
        }
      };
      worker.onerror = () => {
        if (operationRef.current !== id) return;
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
          settings: {
            template,
            aspect,
            fit,
            gap,
            cornerRadius,
            background,
            width,
            format,
            imageTransforms: images.map((item) => item.transform),
          },
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
    revokeResult();
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    imagesRef.current = [];
    setImages([]);
    setSelectedId(null);
    setTemplateId("balanced");
    setAspect("1:1");
    setFit("fill");
    setGap(16);
    setCornerRadius(12);
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

  const panelClass =
    "min-w-0 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4";
  const labelClass =
    "block text-xs font-semibold text-[var(--vt-text-2)]";
  const controlClass =
    "mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]";

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-700/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <span aria-hidden="true">◆</span>
          {t.offline}
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-bold"
          >
            {t.reset}
          </button>
          <button
            type="button"
            onClick={() => void exportCollage()}
            disabled={running}
            className="rounded-lg bg-[var(--vt-text)] px-4 py-2 text-xs font-bold text-[var(--vt-bg-0)] disabled:opacity-50"
          >
            {t.export}
          </button>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[240px_minmax(0,1fr)_280px]">
        <section className={panelClass}>
          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              selectImages(event.dataTransfer.files);
            }}
            className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--vt-border-2)] bg-[var(--vt-bg-0)] p-4 text-center"
          >
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              + {t.addPhotos}
            </span>
            <span className="mt-1 text-[11px] leading-4 text-[var(--vt-text-3)]">
              {t.accepted}
            </span>
            <input
              key={inputKey}
              aria-label={t.addPhotos}
              type="file"
              multiple
              accept={COLLAGE_IMAGE_TYPES.join(",")}
              onChange={(event) => selectImages(event.target.files)}
              className="sr-only"
            />
          </label>

          {images.length ? (
            <ol
              aria-label={t.photos}
              className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1"
            >
              {images.map((item, index) => (
                <li
                  key={item.id}
                  data-photo-id={item.id}
                  draggable
                  onDragStart={() => {
                    draggedId.current = item.id;
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggedId.current !== null) {
                      swap(draggedId.current, item.id);
                    }
                    draggedId.current = null;
                  }}
                  onPointerUp={() => {
                    if (draggedId.current !== null) {
                      swap(draggedId.current, item.id);
                    }
                    draggedId.current = null;
                  }}
                  onPointerCancel={() => {
                    draggedId.current = null;
                  }}
                  className={`flex min-w-0 items-center gap-1.5 rounded-lg border p-1.5 ${
                    selectedImage?.id === item.id
                      ? "border-emerald-700 bg-emerald-700/5"
                      : "border-[var(--vt-border)] bg-[var(--vt-bg-0)]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    data-drag-handle
                    onPointerDown={() => {
                      draggedId.current = item.id;
                    }}
                    className="touch-none cursor-grab text-[var(--vt-text-3)]"
                  >
                    ⠿
                  </span>
                  <button
                    type="button"
                    aria-label={t.select(item.file.name)}
                    onClick={() => setSelectedId(item.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <img
                      src={item.previewUrl}
                      alt={t.previewAlt(item.file.name)}
                      className="h-11 w-14 rounded-md object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">
                      {item.file.name}
                    </span>
                  </button>
                  <div className="grid gap-0.5">
                    <button
                      type="button"
                      aria-label={t.moveEarlier(item.file.name)}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="h-5 w-5 rounded text-[10px] disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={t.moveLater(item.file.name)}
                      disabled={index === images.length - 1}
                      onClick={() => move(index, 1)}
                      className="h-5 w-5 rounded text-[10px] disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label={t.remove(item.file.name)}
                    onClick={() => remove(item.id)}
                    className="h-7 w-7 rounded text-sm"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ol>
          ) : null}

          {images.length >= 2 ? (
            <fieldset className="mt-5">
              <legend className="mb-2 text-xs font-bold">{t.layouts}</legend>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((candidate) => {
                  const name =
                    t.templateNames[
                      candidate.id as keyof typeof t.templateNames
                    ] ?? candidate.id;
                  return (
                    <label
                      key={candidate.id}
                      className={`relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-2 bg-[var(--vt-bg-0)] ${
                        template.id === candidate.id
                          ? "border-emerald-700"
                          : "border-[var(--vt-border)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="collage-template"
                        aria-label={name}
                        value={candidate.id}
                        checked={template.id === candidate.id}
                        onChange={() => {
                          setTemplateId(candidate.id);
                          invalidateExport();
                        }}
                        className="sr-only"
                      />
                      {candidate.cells.map((cell, index) => (
                        <span
                          key={index}
                          aria-hidden="true"
                          className="absolute border border-[var(--vt-bg-0)] bg-[var(--vt-border-2)]"
                          style={{
                            left: `${cell.x * 100}%`,
                            top: `${cell.y * 100}%`,
                            width: `${cell.width * 100}%`,
                            height: `${cell.height * 100}%`,
                          }}
                        />
                      ))}
                      <span className="absolute inset-x-0 bottom-0 truncate bg-[var(--vt-bg-0)]/90 px-1 py-0.5 text-center text-[9px] font-semibold">
                        {name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : null}
        </section>

        <section
          aria-label={t.livePreview}
          className={`${panelClass} flex min-h-[460px] items-center justify-center overflow-hidden bg-[var(--vt-bg-2)]`}
        >
          {images.length ? (
            <div
              className="relative w-full overflow-hidden shadow-xl ring-1 ring-black/10"
              style={{
                aspectRatio: String(previewAspect),
                maxWidth: `min(100%, ${previewAspect * 68}vh)`,
                background,
              }}
            >
              {previewGeometry?.cells.map((cell, index) => {
                const image = images[index];
                if (!image) return null;
                const radius = Math.min(
                  cornerRadius,
                  cell.width / 2,
                  cell.height / 2,
                );
                return (
                  <button
                    key={image.id}
                    type="button"
                    aria-label={t.select(image.file.name)}
                    onClick={() => setSelectedId(image.id)}
                    className={`absolute overflow-hidden ${
                      selectedImage?.id === image.id
                        ? "ring-2 ring-inset ring-emerald-700"
                        : ""
                    }`}
                    style={{
                      left: `${(cell.x / previewGeometry.width) * 100}%`,
                      top: `${(cell.y / previewGeometry.height) * 100}%`,
                      width: `${(cell.width / previewGeometry.width) * 100}%`,
                      height: `${(cell.height / previewGeometry.height) * 100}%`,
                      borderRadius: `${(radius / cell.width) * 100}% / ${(radius / cell.height) * 100}%`,
                      background,
                    }}
                  >
                    <img
                      src={image.previewUrl}
                      alt={t.previewAlt(image.file.name)}
                      className="h-full w-full"
                      style={{
                        objectFit: fit === "fill" ? "cover" : "contain",
                        objectPosition: `${image.transform.focalX * 100}% ${image.transform.focalY * 100}%`,
                        transformOrigin: `${image.transform.focalX * 100}% ${image.transform.focalY * 100}%`,
                        transform:
                          fit === "fill"
                            ? `scale(${image.transform.zoom})`
                            : undefined,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="max-w-sm text-center">
              <div
                aria-hidden="true"
                className="mx-auto mb-4 grid h-24 w-24 grid-cols-2 gap-1 rounded-xl border border-dashed border-[var(--vt-border-2)] p-2"
              >
                <span className="rounded bg-[var(--vt-border)]" />
                <span className="rounded bg-[var(--vt-border)]" />
                <span className="col-span-2 rounded bg-[var(--vt-border)]" />
              </div>
              <p className="text-sm leading-6 text-[var(--vt-text-3)]">
                {t.empty}
              </p>
            </div>
          )}
        </section>

        <section className={panelClass}>
          <h2 className="text-sm font-bold">{t.settings}</h2>

          <fieldset className="mt-4">
            <legend className="mb-2 text-xs font-semibold text-[var(--vt-text-2)]">
              {t.aspect}
            </legend>
            <div className="grid grid-cols-5 gap-1">
              {aspectValues.map((value) => {
                const name = value === "original" ? t.original : value;
                return (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-md border px-1 py-2 text-center text-[11px] font-semibold ${
                      aspect === value
                        ? "border-emerald-700 bg-emerald-700/10 text-emerald-700 dark:text-emerald-300"
                        : "border-[var(--vt-border)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="collage-aspect"
                      aria-label={name}
                      checked={aspect === value}
                      onChange={() => {
                        setAspect(value);
                        invalidateExport();
                      }}
                      className="sr-only"
                    />
                    {name}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5 space-y-4">
            <label className={labelClass}>
              <span className="flex justify-between">
                <span>{t.spacing}</span>
                <span>{gap}px</span>
              </span>
              <input
                aria-label={t.spacing}
                type="range"
                min={0}
                max={128}
                value={gap}
                onChange={(event) => {
                  setGap(Number(event.target.value));
                  invalidateExport();
                }}
                className="mt-2 w-full accent-emerald-700"
              />
            </label>
            <label className={labelClass}>
              <span className="flex justify-between">
                <span>{t.corner}</span>
                <span>{cornerRadius}px</span>
              </span>
              <input
                aria-label={t.corner}
                type="range"
                min={0}
                max={128}
                value={cornerRadius}
                onChange={(event) => {
                  setCornerRadius(Number(event.target.value));
                  invalidateExport();
                }}
                className="mt-2 w-full accent-emerald-700"
              />
            </label>
            <label className={labelClass}>
              {t.background}
              <input
                aria-label={t.background}
                type="color"
                value={background}
                onChange={(event) => {
                  setBackground(event.target.value);
                  invalidateExport();
                }}
                className={`${controlClass} h-10 p-1`}
              />
            </label>
          </div>

          <fieldset className="mt-5">
            <legend className="mb-2 text-xs font-semibold text-[var(--vt-text-2)]">
              {t.fit}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(["fill", "fit"] as CollageFit[]).map((value) => (
                <label
                  key={value}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-xs font-bold ${
                    fit === value
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-[var(--vt-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="image-fit"
                    aria-label={value === "fill" ? t.fill : t.contain}
                    checked={fit === value}
                    onChange={() => {
                      setFit(value);
                      invalidateExport();
                    }}
                    className="sr-only"
                  />
                  {value === "fill" ? t.fill : t.contain}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 border-t border-[var(--vt-border)] pt-4">
            <h3 className="text-xs font-bold">{t.selectedPhoto}</h3>
            {selectedImage ? (
              <div className="mt-3 space-y-4">
                <p className="truncate text-xs text-[var(--vt-text-3)]">
                  {selectedImage.file.name}
                </p>
                <label className={labelClass}>
                  <span className="flex justify-between">
                    <span>{t.zoomLabel}</span>
                    <span>{Math.round(selectedImage.transform.zoom * 100)}%</span>
                  </span>
                  <input
                    aria-label={t.zoom(selectedImage.file.name)}
                    type="range"
                    min={100}
                    max={300}
                    value={Math.round(selectedImage.transform.zoom * 100)}
                    onChange={(event) =>
                      updateSelectedTransform(
                        "zoom",
                        Number(event.target.value) / 100,
                      )
                    }
                    className="mt-2 w-full accent-emerald-700"
                  />
                </label>
                <label className={labelClass}>
                  <span className="flex justify-between">
                    <span>{locale === "en" ? "Horizontal" : "Ngang"}</span>
                    <span>{Math.round(selectedImage.transform.focalX * 100)}%</span>
                  </span>
                  <input
                    aria-label={t.horizontal(selectedImage.file.name)}
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(selectedImage.transform.focalX * 100)}
                    onChange={(event) =>
                      updateSelectedTransform(
                        "focalX",
                        Number(event.target.value) / 100,
                      )
                    }
                    className="mt-2 w-full accent-emerald-700"
                  />
                </label>
                <label className={labelClass}>
                  <span className="flex justify-between">
                    <span>{locale === "en" ? "Vertical" : "Dọc"}</span>
                    <span>{Math.round(selectedImage.transform.focalY * 100)}%</span>
                  </span>
                  <input
                    aria-label={t.vertical(selectedImage.file.name)}
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(selectedImage.transform.focalY * 100)}
                    onChange={(event) =>
                      updateSelectedTransform(
                        "focalY",
                        Number(event.target.value) / 100,
                      )
                    }
                    className="mt-2 w-full accent-emerald-700"
                  />
                </label>
              </div>
            ) : (
              <p className="mt-2 text-xs leading-5 text-[var(--vt-text-3)]">
                {t.noPhoto}
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-[var(--vt-border)] pt-4">
            <h3 className="text-xs font-bold">{t.output}</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className={labelClass}>
                {t.width}
                <input
                  aria-label={t.width}
                  type="number"
                  min={320}
                  max={4096}
                  value={width}
                  onChange={(event) => {
                    setWidth(Number(event.target.value));
                    invalidateExport();
                  }}
                  className={controlClass}
                />
              </label>
              <label className={labelClass}>
                {t.format}
                <select
                  aria-label={t.format}
                  value={format}
                  onChange={(event) => {
                    setFormat(event.target.value as CollageFormat);
                    invalidateExport();
                  }}
                  className={controlClass}
                >
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                </select>
              </label>
            </div>
          </div>

          <p className="mt-5 text-[11px] leading-5 text-[var(--vt-text-3)]">
            {t.privacy}
          </p>
          {error ? (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-[var(--vt-red)]/40 p-3 text-xs text-[var(--vt-red)]"
            >
              {error}
            </p>
          ) : null}
          {statusText ? (
            <p role="status" aria-live="polite" className="mt-3 text-xs">
              {statusText}
            </p>
          ) : null}
          <div className="mt-3 grid gap-2">
            {running ? (
              <button
                type="button"
                onClick={cancel}
                className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-bold"
              >
                {t.cancel}
              </button>
            ) : null}
            {resultUrl ? (
              <a
                href={resultUrl}
                download={downloadName}
                className="rounded-lg bg-emerald-700 px-3 py-2 text-center text-xs font-bold text-white"
              >
                {downloadLabel}
              </a>
            ) : null}
          </div>
        </section>
      </div>
    </ToolWorkspace>
  );
}
