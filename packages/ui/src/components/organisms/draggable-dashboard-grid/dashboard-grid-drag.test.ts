import { describe, expect, test } from "bun:test";
import { computeWidgetGridPositionFromDrag } from "./dashboard-grid-drag";

const cellSize = 66; // 50px cell + 16px gap

describe("computeWidgetGridPositionFromDrag", () => {
  test("uses drag start position with cumulative delta (not current position)", () => {
    const dragStart = { x: 0, y: 0 };

    const afterFirstMove = computeWidgetGridPositionFromDrag({
      dragStart,
      widgetWidth: 4,
      deltaPixels: { x: cellSize, y: 0 },
      cellSize,
      columns: 12,
    });
    expect(afterFirstMove).toEqual({ x: 1, y: 0 });

    // Segundo evento: delta cumulativo de 2 células — não deve virar x=3 (1+2)
    const afterSecondMove = computeWidgetGridPositionFromDrag({
      dragStart,
      widgetWidth: 4,
      deltaPixels: { x: cellSize * 2, y: 0 },
      cellSize,
      columns: 12,
    });
    expect(afterSecondMove).toEqual({ x: 2, y: 0 });
  });

  test("clamps horizontal position to grid columns", () => {
    const position = computeWidgetGridPositionFromDrag({
      dragStart: { x: 10, y: 0 },
      widgetWidth: 4,
      deltaPixels: { x: cellSize * 5, y: 0 },
      cellSize,
      columns: 12,
    });

    expect(position.x).toBe(8); // max x = 12 - 4
  });
});
