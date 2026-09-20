import { describe, expect, it } from "vitest";
import { computeWidgetGridPositionFromDrag } from "./useDashboardLayout";

const GRID = {
  gridColumns: 12,
  cellSize: 50,
  gap: 16,
} as const;

// Uma célula de grid ocupa cellSize + gap em pixels
const CELL = GRID.cellSize + GRID.gap;

describe("computeWidgetGridPositionFromDrag", () => {
  it("deriva a posição da origem do drag, não da posição já movida", () => {
    // O delta do dnd-kit é cumulativo desde o início do drag: dois eventos
    // consecutivos partem sempre da MESMA origem. Somar em cima da posição
    // já atualizada faria o segundo evento cair em x: 3 em vez de x: 2.
    const primeiroEvento = computeWidgetGridPositionFromDrag({
      startX: 0,
      startY: 0,
      widgetWidth: 4,
      deltaX: CELL,
      deltaY: 0,
      ...GRID,
    });
    expect(primeiroEvento).toEqual({ x: 1, y: 0 });

    const segundoEvento = computeWidgetGridPositionFromDrag({
      startX: 0,
      startY: 0,
      widgetWidth: 4,
      deltaX: CELL * 2,
      deltaY: 0,
      ...GRID,
    });
    expect(segundoEvento).toEqual({ x: 2, y: 0 });
  });

  it("limita a posição à última coluna que comporta o widget", () => {
    const clamped = computeWidgetGridPositionFromDrag({
      startX: 10,
      startY: 0,
      widgetWidth: 4,
      deltaX: CELL * 5,
      deltaY: 0,
      ...GRID,
    });

    expect(clamped).toEqual({ x: 8, y: 0 });
  });

  it("mantém a posição quando o delta não completa uma célula", () => {
    const parado = computeWidgetGridPositionFromDrag({
      startX: 3,
      startY: 2,
      widgetWidth: 2,
      deltaX: 10,
      deltaY: 10,
      ...GRID,
    });

    expect(parado).toEqual({ x: 3, y: 2 });
  });

  it("move na vertical e não deixa o widget subir acima da primeira linha", () => {
    const paraBaixo = computeWidgetGridPositionFromDrag({
      startX: 1,
      startY: 2,
      widgetWidth: 2,
      deltaX: 0,
      deltaY: CELL * 3,
      ...GRID,
    });
    expect(paraBaixo).toEqual({ x: 1, y: 5 });

    const paraCima = computeWidgetGridPositionFromDrag({
      startX: 1,
      startY: 1,
      widgetWidth: 2,
      deltaX: 0,
      deltaY: -CELL * 4,
      ...GRID,
    });
    expect(paraCima).toEqual({ x: 1, y: 0 });
  });
});
