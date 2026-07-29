export type OrderedItemId = string | number;

export function moveItemById<T extends { id: OrderedItemId }>(
  items: readonly T[],
  activeId: OrderedItemId,
  overId: OrderedItemId,
): T[] {
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const overIndex = items.findIndex((item) => item.id === overId);
  if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
    return [...items];
  }
  const next = [...items];
  const [active] = next.splice(activeIndex, 1);
  next.splice(overIndex, 0, active);
  return next;
}
