import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeWidgetGridPositionFromDrag } from "./useDashboardLayout";

const GRID = {
  gridColumns: 12,
  cellSize: 50,
  gap: 16,
} as const;

const cellSize = GRID.cellSize + GRID.gap;

describe("computeWidgetGridPositionFromDrag", () => {
  it("derives position from drag start plus cumulative delta", () => {
    const firstMove = computeWidgetGridPositionFromDrag({
      startX: 0,
      startY: 0,
      widgetWidth: 4,
      deltaX: cellSize,
      deltaY: 0,
      ...GRID,
    });

    assert.deepEqual(firstMove, { x: 1, y: 0 });

    const secondMove = computeWidgetGridPositionFromDrag({
      startX: 0,
      startY: 0,
      widgetWidth: 4,
      deltaX: cellSize * 2,
      deltaY: 0,
      ...GRID,
    });

    assert.deepEqual(secondMove, { x: 2, y: 0 });
  });

  it("clamps position to grid bounds", () => {
    const clamped = computeWidgetGridPositionFromDrag({
      startX: 10,
      startY: 0,
      widgetWidth: 4,
      deltaX: cellSize * 5,
      deltaY: 0,
      ...GRID,
    });

    assert.deepEqual(clamped, { x: 8, y: 0 });
  });

  it("returns start position when delta is below one cell", () => {
    const unchanged = computeWidgetGridPositionFromDrag({
      startX: 3,
      startY: 2,
      widgetWidth: 2,
      deltaX: 10,
      deltaY: 10,
      ...GRID,
    });

    assert.deepEqual(unchanged, { x: 3, y: 2 });
  });
});
