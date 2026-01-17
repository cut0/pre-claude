/**
 * Adjusts scroll offset to keep the selected item visible within the viewport.
 */
export const adjustScrollOffset = (
  newIndex: number,
  currentOffset: number,
  maxVisible: number,
): number => {
  if (newIndex < currentOffset) {
    return newIndex;
  }
  if (newIndex >= currentOffset + maxVisible) {
    return newIndex - maxVisible + 1;
  }
  return currentOffset;
};
