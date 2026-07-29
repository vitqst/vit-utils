import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import type { CollageFit, Rect } from "./collage";
import {
  RESET_IMAGE_TRANSFORM,
  panImageTransform,
  pinchImageTransform,
  previewImagePlacement,
  type ImageTransform,
} from "./photo-collage-framing";

type PreviewItem = {
  id: number;
  file: File;
  previewUrl: string;
  transform: ImageTransform;
};

type PreviewGeometry = {
  width: number;
  height: number;
  cells: Rect[];
};

type Point = {
  startX: number;
  startY: number;
  x: number;
  y: number;
};

type Gesture = {
  photoId: number;
  startTransform: ImageTransform;
  pointers: Map<number, Point>;
  moved: boolean;
};

const previewCopy = {
  en: {
    livePreview: "Live collage preview",
    previewAlt: (name: string) => `${name} preview`,
    select: (name: string) => `Select ${name}`,
    frameHelp:
      "Drag to pan, pinch to zoom, or double-tap to reset. Exact controls are available in collage settings.",
    empty:
      "Add local photos to start. Your images appear here immediately and are never uploaded.",
  },
  vi: {
    livePreview: "Xem trước ảnh ghép trực tiếp",
    previewAlt: (name: string) => `Xem trước ${name}`,
    select: (name: string) => `Chọn ${name}`,
    frameHelp:
      "Kéo để di chuyển, chụm để thu phóng hoặc chạm hai lần để đặt lại. Các điều khiển chính xác nằm trong cài đặt ảnh ghép.",
    empty:
      "Thêm ảnh cục bộ để bắt đầu. Ảnh xuất hiện ngay tại đây và không bao giờ được tải lên.",
  },
} as const;

const distance = (first: Point, second: Point, start = false) =>
  Math.hypot(
    (start ? second.startX : second.x) -
      (start ? first.startX : first.x),
    (start ? second.startY : second.y) -
      (start ? first.startY : first.y),
  );

export function PhotoCollagePreview({
  locale,
  images,
  selectedId,
  geometry,
  previewAspect,
  fit,
  background,
  cornerRadius,
  onSelect,
  onTransform,
  className = "",
}: {
  locale: "en" | "vi";
  images: readonly PreviewItem[];
  selectedId: number | null;
  geometry: PreviewGeometry | null;
  previewAspect: number;
  fit: CollageFit;
  background: string;
  cornerRadius: number;
  onSelect: (id: number) => void;
  onTransform: (id: number, transform: ImageTransform) => void;
  className?: string;
}) {
  const t = previewCopy[locale];
  const [dimensions, setDimensions] = useState<
    Record<number, { width: number; height: number }>
  >({});
  const gestureRef = useRef<Gesture | null>(null);
  const latestTransforms = useRef(new Map<number, ImageTransform>());
  const lastTap = useRef<{ id: number; time: number; x: number; y: number } | null>(
    null,
  );
  images.forEach((image) => latestTransforms.current.set(image.id, image.transform));

  const resetFraming = (id: number) => {
    latestTransforms.current.set(id, RESET_IMAGE_TRANSFORM);
    onTransform(id, RESET_IMAGE_TRANSFORM);
  };

  const restoreGesture = () => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    latestTransforms.current.set(gesture.photoId, gesture.startTransform);
    onTransform(gesture.photoId, gesture.startTransform);
    gestureRef.current = null;
  };

  const beginPointer = (
    event: PointerEvent<HTMLButtonElement>,
    image: PreviewItem,
    selected: boolean,
  ) => {
    onSelect(image.id);
    if (!selected || fit !== "fill" || !dimensions[image.id]) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const current = latestTransforms.current.get(image.id) ?? image.transform;
    const point = {
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
    };
    const active = gestureRef.current;
    if (!active || active.photoId !== image.id) {
      gestureRef.current = {
        photoId: image.id,
        startTransform: current,
        pointers: new Map([[event.pointerId, point]]),
        moved: false,
      };
      return;
    }
    active.startTransform = current;
    active.pointers.forEach((pointer) => {
      pointer.startX = pointer.x;
      pointer.startY = pointer.y;
    });
    active.pointers.set(event.pointerId, point);
    active.moved = false;
  };

  const movePointer = (
    event: PointerEvent<HTMLButtonElement>,
    image: PreviewItem,
  ) => {
    const gesture = gestureRef.current;
    const source = dimensions[image.id];
    const pointer = gesture?.pointers.get(event.pointerId);
    if (!gesture || gesture.photoId !== image.id || !source || !pointer) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    if (
      Math.hypot(pointer.x - pointer.startX, pointer.y - pointer.startY) > 3
    ) {
      gesture.moved = true;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    let next: ImageTransform;
    const pointers = Array.from(gesture.pointers.values());
    if (pointers.length > 1) {
      const [first, second] = pointers;
      next = pinchImageTransform({
        transform: gesture.startTransform,
        sourceWidth: source.width,
        sourceHeight: source.height,
        viewportWidth: bounds.width,
        viewportHeight: bounds.height,
        startDistance: distance(first, second, true),
        currentDistance: distance(first, second),
        midpointX:
          (first.startX + second.startX) / 2 - bounds.left,
        midpointY:
          (first.startY + second.startY) / 2 - bounds.top,
      });
    } else {
      next = panImageTransform({
        transform: gesture.startTransform,
        sourceWidth: source.width,
        sourceHeight: source.height,
        viewportWidth: bounds.width,
        viewportHeight: bounds.height,
        deltaX: pointer.x - pointer.startX,
        deltaY: pointer.y - pointer.startY,
      });
    }
    latestTransforms.current.set(image.id, next);
    onTransform(image.id, next);
  };

  const endPointer = (
    event: PointerEvent<HTMLButtonElement>,
    image: PreviewItem,
  ) => {
    const gesture = gestureRef.current;
    const pointer = gesture?.pointers.get(event.pointerId);
    if (!gesture || gesture.photoId !== image.id || !pointer) return;
    const wasTap = !gesture.moved && gesture.pointers.size === 1;
    gesture.pointers.delete(event.pointerId);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (wasTap && event.pointerType === "touch") {
      const now = event.timeStamp;
      const previous = lastTap.current;
      if (
        previous?.id === image.id &&
        now - previous.time <= 320 &&
        Math.hypot(event.clientX - previous.x, event.clientY - previous.y) <= 24
      ) {
        resetFraming(image.id);
        lastTap.current = null;
      } else {
        lastTap.current = {
          id: image.id,
          time: now,
          x: event.clientX,
          y: event.clientY,
        };
      }
    }
    if (!gesture.pointers.size) {
      gestureRef.current = null;
      return;
    }
    gesture.startTransform =
      latestTransforms.current.get(image.id) ?? image.transform;
    gesture.pointers.forEach((remaining) => {
      remaining.startX = remaining.x;
      remaining.startY = remaining.y;
    });
    gesture.moved = false;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Escape" || !gestureRef.current) return;
    event.preventDefault();
    restoreGesture();
  };

  return (
    <section
      aria-label={t.livePreview}
      data-collage-preview
      className={`min-w-0 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-2)] p-2 sm:p-4 flex min-h-[280px] items-center justify-center overflow-hidden sm:min-h-[420px] xl:min-h-[460px] ${className}`}
    >
      {images.length && geometry ? (
        <div
          className="relative w-full overflow-hidden shadow-xl ring-1 ring-black/10"
          style={{
            aspectRatio: String(previewAspect),
            maxWidth: `min(100%, ${previewAspect * 68}vh)`,
            background,
          }}
        >
          {geometry.cells.map((cell, index) => {
            const image = images[index];
            if (!image) return null;
            const selected = selectedId === image.id;
            const radius = Math.min(
              cornerRadius,
              cell.width / 2,
              cell.height / 2,
            );
            const source = dimensions[image.id];
            const placement =
              fit === "fill" && source
                ? previewImagePlacement({
                    transform: image.transform,
                    sourceWidth: source.width,
                    sourceHeight: source.height,
                    viewportWidth: cell.width,
                    viewportHeight: cell.height,
                  })
                : null;
            const placementStyle = placement
              ? {
                  left: `${(placement.left / cell.width) * 100}%`,
                  top: `${(placement.top / cell.height) * 100}%`,
                  width: `${(placement.width / cell.width) * 100}%`,
                  height: `${(placement.height / cell.height) * 100}%`,
                }
              : null;
            return (
              <button
                key={image.id}
                type="button"
                aria-label={t.select(image.file.name)}
                aria-describedby={selected && fit === "fill" ? "collage-frame-help" : undefined}
                data-framing-surface={selected ? "true" : undefined}
                onClick={() => onSelect(image.id)}
                onPointerDown={(event) =>
                  beginPointer(event, image, selected)
                }
                onPointerMove={(event) => movePointer(event, image)}
                onPointerUp={(event) => endPointer(event, image)}
                onPointerCancel={restoreGesture}
                onLostPointerCapture={(event) => {
                  if (gestureRef.current?.pointers.has(event.pointerId)) {
                    restoreGesture();
                  }
                }}
                onKeyDown={handleKeyDown}
                onDoubleClick={() => {
                  if (selected && fit === "fill") resetFraming(image.id);
                }}
                className={`absolute overflow-hidden ${
                  selected
                    ? "touch-none ring-2 ring-inset ring-emerald-700"
                    : ""
                }`}
                style={{
                  left: `${(cell.x / geometry.width) * 100}%`,
                  top: `${(cell.y / geometry.height) * 100}%`,
                  width: `${(cell.width / geometry.width) * 100}%`,
                  height: `${(cell.height / geometry.height) * 100}%`,
                  borderRadius: `${(radius / cell.width) * 100}% / ${(radius / cell.height) * 100}%`,
                  background,
                }}
              >
                <img
                  src={image.previewUrl}
                  alt={t.previewAlt(image.file.name)}
                  draggable={false}
                  onLoad={(event) => {
                    const node = event.currentTarget;
                    if (!node.naturalWidth || !node.naturalHeight) return;
                    setDimensions((current) => ({
                      ...current,
                      [image.id]: {
                        width: node.naturalWidth,
                        height: node.naturalHeight,
                      },
                    }));
                  }}
                  className={
                    placementStyle
                      ? "pointer-events-none absolute max-w-none select-none"
                      : "pointer-events-none h-full w-full select-none"
                  }
                  style={
                    placementStyle
                      ? placementStyle
                      : {
                          objectFit: fit === "fill" ? "cover" : "contain",
                          objectPosition: `${image.transform.focalX * 100}% ${image.transform.focalY * 100}%`,
                          transformOrigin: `${image.transform.focalX * 100}% ${image.transform.focalY * 100}%`,
                          transform:
                            fit === "fill"
                              ? `scale(${image.transform.zoom})`
                              : undefined,
                        }
                  }
                />
              </button>
            );
          })}
          <span id="collage-frame-help" className="sr-only">
            {t.frameHelp}
          </span>
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
          <p className="text-sm leading-6 text-[var(--vt-text-3)]">{t.empty}</p>
        </div>
      )}
    </section>
  );
}
