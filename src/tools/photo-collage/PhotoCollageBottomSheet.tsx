import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";

const sheetCopy = {
  en: {
    title: "Collage settings",
    close: "Close settings",
    drag: "Drag to close settings",
  },
  vi: {
    title: "Cài đặt ảnh ghép",
    close: "Đóng cài đặt",
    drag: "Kéo để đóng cài đặt",
  },
} as const;

export function PhotoCollageBottomSheet({
  locale,
  open,
  onClose,
  children,
}: {
  locale: "en" | "vi";
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const t = sheetCopy[locale];
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);
  const handleMovedRef = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    if (!open) {
      setDragOffset(0);
      return;
    }
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const finishHandleDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (dragOffset >= 80) {
      onClose();
    }
    setDragOffset(0);
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/25 motion-safe:transition-opacity" />
      <div className="fixed inset-0 flex items-end">
        <DialogPanel
          data-mobile-settings-sheet
          className="max-h-[50dvh] w-full overflow-hidden rounded-t-2xl border border-b-0 border-[var(--vt-border)] bg-[var(--vt-bg-1)] shadow-2xl motion-safe:transition-transform"
          style={{ transform: `translateY(${dragOffset}px)` }}
        >
          <div className="relative border-b border-[var(--vt-border)] px-4 pb-3 pt-2">
            <button
              type="button"
              aria-label={t.drag}
              onPointerDown={(event) => {
                handleMovedRef.current = false;
                dragRef.current = {
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startY: event.clientY,
                };
                event.currentTarget.setPointerCapture?.(event.pointerId);
              }}
              onPointerMove={(event) => {
                const drag = dragRef.current;
                if (!drag || drag.pointerId !== event.pointerId) return;
                const offset = Math.max(0, event.clientY - drag.startY);
                if (
                  Math.hypot(
                    event.clientX - drag.startX,
                    event.clientY - drag.startY,
                  ) > 3
                ) {
                  handleMovedRef.current = true;
                }
                setDragOffset(offset);
              }}
              onPointerUp={finishHandleDrag}
              onPointerCancel={() => {
                dragRef.current = null;
                handleMovedRef.current = true;
                setDragOffset(0);
              }}
              onClick={() => {
                if (handleMovedRef.current) {
                  handleMovedRef.current = false;
                  return;
                }
                onClose();
              }}
              className="mx-auto flex h-11 w-24 touch-none items-center justify-center"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-12 rounded-full bg-[var(--vt-border-2)]"
              />
            </button>
            <DialogTitle className="pr-12 text-sm font-bold">
              {t.title}
            </DialogTitle>
            <button
              ref={closeRef}
              type="button"
              aria-label={t.close}
              onClick={onClose}
              className="absolute bottom-2 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--vt-border)] text-lg"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="max-h-[calc(50dvh-76px)] overflow-y-auto overscroll-contain p-3">
            {children}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
