/**
 * Calcula posição no grid a partir do delta cumulativo do dnd-kit (desde o início do drag).
 */
export function computeWidgetGridPositionFromDrag({
  dragStart,
  widgetWidth,
  deltaPixels,
  cellSize,
  columns,
}: {
  dragStart: { x: number; y: number };
  widgetWidth: number;
  deltaPixels: { x: number; y: number };
  cellSize: number;
  columns: number;
}): { x: number; y: number } {
  const deltaX = Math.round(deltaPixels.x / cellSize);
  const deltaY = Math.round(deltaPixels.y / cellSize);

  const x = Math.max(0, Math.min(columns - widgetWidth, dragStart.x + deltaX));
  const y = Math.max(0, dragStart.y + deltaY);

  return { x, y };
}
