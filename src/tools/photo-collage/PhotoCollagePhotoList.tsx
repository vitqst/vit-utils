import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";

type PhotoListItem = {
  id: number;
  file: File;
  previewUrl: string;
};

type PhotoListProps = {
  locale: "en" | "vi";
  items: readonly PhotoListItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onMove: (index: number, offset: -1 | 1) => void;
  onRemove: (id: number) => void;
  onReorder: (activeId: number, overId: number) => void;
};

export const photoListCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (args.pointerCoordinates) return pointerCollisions;
  return closestCenter(args);
};

const listCopy = {
  en: {
    photos: "Photos",
    previewAlt: (name: string) => `${name} preview`,
    select: (name: string) => `Select ${name}`,
    reorder: (name: string) => `Reorder ${name}`,
    roleDescription: "sortable",
    orderStatus: "Photo order status",
    moveEarlier: (name: string) => `Move ${name} earlier`,
    moveLater: (name: string) => `Move ${name} later`,
    remove: (name: string) => `Remove ${name}`,
    instructions:
      "Press Space or Enter to pick up a photo. Use the arrow keys to move it, then press Space or Enter to drop. Press Escape to cancel.",
    picked: (name: string) => `Picked up ${name}.`,
    over: (name: string, position: number) =>
      `${name} is over position ${position}.`,
    dropped: (name: string, position: number) =>
      `${name} moved to position ${position}.`,
    cancelled: (name: string) => `Reordering ${name} cancelled.`,
  },
  vi: {
    photos: "Ảnh",
    previewAlt: (name: string) => `Xem trước ${name}`,
    select: (name: string) => `Chọn ${name}`,
    reorder: (name: string) => `Sắp xếp lại ${name}`,
    roleDescription: "có thể sắp xếp",
    orderStatus: "Trạng thái thứ tự ảnh",
    moveEarlier: (name: string) => `Chuyển ${name} lên trước`,
    moveLater: (name: string) => `Chuyển ${name} ra sau`,
    remove: (name: string) => `Xóa ${name}`,
    instructions:
      "Nhấn Phím cách hoặc Enter để nhấc ảnh. Dùng các phím mũi tên để di chuyển, rồi nhấn Phím cách hoặc Enter để thả. Nhấn Escape để hủy.",
    picked: (name: string) => `Đã nhấc ${name}.`,
    over: (name: string, position: number) =>
      `${name} đang ở vị trí ${position}.`,
    dropped: (name: string, position: number) =>
      `Đã chuyển ${name} đến vị trí ${position}.`,
    cancelled: (name: string) => `Đã hủy sắp xếp ${name}.`,
  },
} as const;

function SortablePhoto({
  item,
  index,
  count,
  selected,
  locale,
  activeId,
  onSelect,
  onMove,
  onRemove,
}: {
  item: PhotoListItem;
  index: number;
  count: number;
  selected: boolean;
  locale: "en" | "vi";
  activeId: number | null;
  onSelect: (id: number) => void;
  onMove: (index: number, offset: -1 | 1) => void;
  onRemove: (id: number) => void;
}) {
  const t = listCopy[locale];
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: item.id,
    attributes: { roleDescription: t.roleDescription },
  });

  return (
    <li
      ref={setNodeRef}
      data-photo-id={item.id}
      data-drop-target={isOver && activeId !== item.id ? "true" : undefined}
      className={`relative flex min-w-0 items-center gap-1 rounded-lg border p-1.5 transition-colors ${
        selected
          ? "border-emerald-700 bg-emerald-700/5"
          : "border-[var(--vt-border)] bg-[var(--vt-bg-0)]"
      } ${isOver && activeId !== item.id ? "ring-2 ring-emerald-600 ring-offset-1" : ""} ${
        isDragging ? "opacity-35" : ""
      }`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        aria-label={t.reorder(item.file.name)}
        data-drag-handle
        className="flex h-11 w-11 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-lg text-[var(--vt-text-3)] active:cursor-grabbing"
      >
        <span aria-hidden="true">⠿</span>
      </button>
      <button
        type="button"
        aria-label={t.select(item.file.name)}
        onClick={() => onSelect(item.id)}
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
      <div className="grid grid-cols-2 gap-0.5">
        <button
          type="button"
          aria-label={t.moveEarlier(item.file.name)}
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
          className="h-11 w-11 rounded text-sm disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          aria-label={t.moveLater(item.file.name)}
          disabled={index === count - 1}
          onClick={() => onMove(index, 1)}
          className="h-11 w-11 rounded text-sm disabled:opacity-30"
        >
          ↓
        </button>
      </div>
      <button
        type="button"
        aria-label={t.remove(item.file.name)}
        onClick={() => onRemove(item.id)}
        className="h-11 w-11 shrink-0 rounded text-base"
      >
        ×
      </button>
    </li>
  );
}

export function PhotoCollagePhotoList({
  locale,
  items,
  selectedId,
  onSelect,
  onMove,
  onRemove,
  onReorder,
}: PhotoListProps) {
  const t = listCopy[locale];
  const [activeId, setActiveId] = useState<number | null>(null);
  const [moveAnnouncement, setMoveAnnouncement] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const names = useMemo(
    () => new Map(items.map((item) => [item.id, item.file.name])),
    [items],
  );
  const positions = useMemo(
    () => new Map(items.map((item, index) => [item.id, index + 1])),
    [items],
  );
  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      t.picked(names.get(Number(active.id)) ?? String(active.id)),
    onDragOver: ({ active, over }) =>
      over
        ? t.over(
            names.get(Number(active.id)) ?? String(active.id),
            positions.get(Number(over.id)) ?? 1,
          )
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? t.dropped(
            names.get(Number(active.id)) ?? String(active.id),
            positions.get(Number(over.id)) ?? 1,
          )
        : t.cancelled(names.get(Number(active.id)) ?? String(active.id)),
    onDragCancel: ({ active }) =>
      t.cancelled(names.get(Number(active.id)) ?? String(active.id)),
  };
  const activeItem = items.find((item) => item.id === activeId);

  const finishDrag = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    onReorder(Number(active.id), Number(over.id));
  };
  return (
    <DndContext
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: t.instructions },
      }}
      sensors={sensors}
      collisionDetection={photoListCollisionDetection}
      onDragStart={({ active }) => setActiveId(Number(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={finishDrag}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol
          aria-label={t.photos}
          className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1"
        >
          {items.map((item, index) => (
            <SortablePhoto
              key={item.id}
              item={item}
              index={index}
              count={items.length}
              selected={selectedId === item.id}
              locale={locale}
              activeId={activeId}
              onSelect={onSelect}
              onMove={(index, offset) => {
                const targetIndex = index + offset;
                onMove(index, offset);
                setMoveAnnouncement(
                  t.dropped(item.file.name, targetIndex + 1),
                );
              }}
              onRemove={onRemove}
            />
          ))}
        </ol>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <div
            data-drag-overlay
            className="flex max-w-56 items-center gap-2 rounded-lg border border-emerald-700 bg-[var(--vt-bg-0)] p-2 shadow-xl"
          >
            <img
              src={activeItem.previewUrl}
              alt=""
              className="h-11 w-14 rounded-md object-cover"
            />
            <span className="truncate text-xs font-semibold">
              {activeItem.file.name}
            </span>
          </div>
        ) : null}
      </DragOverlay>
      <p
        role="status"
        aria-label={t.orderStatus}
        aria-live="polite"
        className="sr-only"
      >
        {moveAnnouncement}
      </p>
    </DndContext>
  );
}
