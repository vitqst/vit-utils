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
import { PhotoCollageBottomSheet } from "./PhotoCollageBottomSheet";
import { PhotoCollagePhotoList } from "./PhotoCollagePhotoList";
import { PhotoCollagePreview } from "./PhotoCollagePreview";
import { PhotoCollageSettings } from "./PhotoCollageSettings";
import type { ImageTransform } from "./photo-collage-framing";
import { moveItemById } from "./photo-collage-order";

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
    openSettings: "Open collage settings",
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
    statusLabel: "Collage status",
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
    openSettings: "Mở cài đặt ảnh ghép",
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
    statusLabel: "Trạng thái ảnh ghép",
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [wideEditor, setWideEditor] = useState(() =>
    typeof window === "undefined" || !window.matchMedia
      ? true
      : window.matchMedia("(min-width: 1280px)").matches,
  );
  const workerRef = useRef<Worker | null>(null);
  const resultUrlRef = useRef("");
  const imagesRef = useRef<ImageItem[]>([]);
  const operationRef = useRef(0);
  const nextImageId = useRef(0);

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

  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia("(min-width: 1280px)");
    const update = () => {
      setWideEditor(query.matches);
      if (query.matches) setSettingsOpen(false);
    };
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

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
    reorder(images[index].id, images[target].id);
  };

  const reorder = (sourceId: number, targetId: number) => {
    if (sourceId === targetId) return;
    invalidateExport();
    setImages((current) => moveItemById(current, sourceId, targetId));
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

  const updateImageTransform = (id: number, transform: ImageTransform) => {
    invalidateExport();
    setImages((current) =>
      current.map((image) =>
        image.id === id ? { ...image, transform } : image,
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
  const settingsContent = (
    <PhotoCollageSettings
      locale={locale}
      templates={templates}
      template={template}
      onTemplateChange={(id) => {
        setTemplateId(id);
        invalidateExport();
      }}
      aspect={aspect}
      onAspectChange={(value) => {
        setAspect(value);
        invalidateExport();
      }}
      gap={gap}
      onGapChange={(value) => {
        setGap(value);
        invalidateExport();
      }}
      cornerRadius={cornerRadius}
      onCornerRadiusChange={(value) => {
        setCornerRadius(value);
        invalidateExport();
      }}
      background={background}
      onBackgroundChange={(value) => {
        setBackground(value);
        invalidateExport();
      }}
      fit={fit}
      onFitChange={(value) => {
        setFit(value);
        invalidateExport();
      }}
      selectedImage={selectedImage}
      onTransformChange={(transform) => {
        if (selectedImage) updateImageTransform(selectedImage.id, transform);
      }}
      width={width}
      onWidthChange={(value) => {
        setWidth(value);
        invalidateExport();
      }}
      format={format}
      onFormatChange={(value) => {
        setFormat(value);
        invalidateExport();
      }}
      privacy={t.privacy}
      error={error}
      statusText={statusText}
      running={running}
      onCancel={cancel}
      resultUrl={resultUrl}
      downloadName={downloadName}
      downloadLabel={downloadLabel}
      showFeedback={wideEditor}
      className={
        wideEditor
          ? `${panelClass} xl:col-start-3 xl:row-span-2 xl:row-start-1`
          : ""
      }
    />
  );

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

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_300px] xl:grid-rows-[auto_1fr] xl:items-start">
        <section
          data-photo-add
          className={`${panelClass} xl:col-start-1 xl:row-start-1`}
        >
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

        </section>

        <PhotoCollagePreview
          locale={locale}
          images={images}
          selectedId={selectedImage?.id ?? null}
          geometry={previewGeometry}
          previewAspect={previewAspect}
          fit={fit}
          background={background}
          cornerRadius={cornerRadius}
          onSelect={setSelectedId}
          onTransform={updateImageTransform}
          className="xl:col-start-2 xl:row-span-2 xl:row-start-1"
        />

        {wideEditor ? (
          settingsContent
        ) : (
          <>
            <button
              type="button"
              aria-label={t.openSettings}
              onClick={() => {
                document
                  .querySelector("[data-collage-preview]")
                  ?.scrollIntoView?.({ block: "start" });
                setSettingsOpen(true);
              }}
              className="min-h-11 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] px-4 py-3 text-sm font-bold"
            >
              {t.openSettings}
            </button>
            <PhotoCollageBottomSheet
              locale={locale}
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
            >
              {settingsContent}
            </PhotoCollageBottomSheet>
            {error ? (
              <p
                role="alert"
                className="rounded-lg border border-[var(--vt-red)]/40 p-3 text-xs text-[var(--vt-red)]"
              >
                {error}
              </p>
            ) : null}
            {statusText ? (
              <p
                role="status"
                aria-label={t.statusLabel}
                aria-live="polite"
                className="text-xs"
              >
                {statusText}
              </p>
            ) : null}
            {running ? (
              <button
                type="button"
                onClick={cancel}
                className="min-h-11 rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-bold"
              >
                {t.cancel}
              </button>
            ) : null}
            {resultUrl ? (
              <a
                href={resultUrl}
                download={downloadName}
                className="rounded-lg bg-emerald-700 px-3 py-3 text-center text-xs font-bold text-white"
              >
                {downloadLabel}
              </a>
            ) : null}
          </>
        )}

        {images.length ? (
          <section
            data-photo-order
            className={`${panelClass} xl:col-start-1 xl:row-start-2`}
          >
            <PhotoCollagePhotoList
              locale={locale}
              items={images}
              selectedId={selectedImage?.id ?? null}
              onSelect={setSelectedId}
              onMove={move}
              onRemove={remove}
              onReorder={reorder}
            />
          </section>
        ) : null}
      </div>
    </ToolWorkspace>
  );
}
