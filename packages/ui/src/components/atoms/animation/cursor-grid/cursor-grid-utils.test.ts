import { describe, expect, it } from "vitest";
import {
  cellAlpha,
  cellsInRadius,
  falloffCurve,
  gridSize,
  isPulseDone,
  pulseHitsCell,
  pulseRadius,
} from "./cursor-grid-utils";

describe("falloffCurve", () => {
  it.each(["linear", "smooth", "sharp"] as const)("%s: 0 vira 0 e 1 vira 1", (kind) => {
    expect(falloffCurve(kind, 0)).toBe(0);
    expect(falloffCurve(kind, 1)).toBe(1);
  });

  it("no meio, sharp < linear < smooth", () => {
    const sharp = falloffCurve("sharp", 0.7);
    const linear = falloffCurve("linear", 0.7);
    const smooth = falloffCurve("smooth", 0.7);
    expect(sharp).toBeLessThan(linear);
    expect(linear).toBeLessThan(smooth);
  });

  it("limita t ao intervalo 0..1", () => {
    expect(falloffCurve("linear", -2)).toBe(0);
    expect(falloffCurve("linear", 3)).toBe(1);
  });
});

describe("cellAlpha", () => {
  it("mantém o pico até holdTime", () => {
    expect(cellAlpha(0.8, 0, 400, 800)).toBe(0.8);
    expect(cellAlpha(0.8, 400, 400, 800)).toBe(0.8);
  });

  it("cai linear durante fadeDuration", () => {
    expect(cellAlpha(0.8, 800, 400, 800)).toBeCloseTo(0.4);
  });

  it("zera depois de hold + fade", () => {
    expect(cellAlpha(0.8, 1200, 400, 800)).toBe(0);
    expect(cellAlpha(0.8, 5000, 400, 800)).toBe(0);
  });

  it("fadeDuration 0 apaga assim que o hold acaba", () => {
    expect(cellAlpha(1, 401, 400, 0)).toBe(0);
  });
});

describe("gridSize", () => {
  it("arredonda para cima as colunas e linhas", () => {
    expect(gridSize(200, 100, 56)).toEqual({ cols: 4, rows: 2 });
  });

  it("área vazia não tem células", () => {
    expect(gridSize(0, 0, 56)).toEqual({ cols: 0, rows: 0 });
  });

  it("recusa cellSize inválido com o valor recebido", () => {
    expect(() => gridSize(100, 100, 0)).toThrow(/received cellSize 0/);
  });
});

describe("cellsInRadius", () => {
  it("devolve só as células com centro dentro do raio", () => {
    const cells = cellsInRadius(4, 4, 50, { x: 25, y: 25 }, 60);
    const indexes = cells.map((c) => c.index).sort((a, b) => a - b);
    expect(indexes).toEqual([0, 1, 4]);
  });

  it("informa coluna, linha e distância ao ponteiro", () => {
    const [cell] = cellsInRadius(4, 4, 50, { x: 25, y: 25 }, 10);
    expect(cell).toMatchObject({ index: 0, col: 0, row: 0, dist: 0 });
  });

  it("ponteiro longe da grade não acende nada", () => {
    expect(cellsInRadius(4, 4, 50, { x: 900, y: 900 }, 60)).toEqual([]);
  });
});

describe("pulso", () => {
  it("raio cresce com a velocidade em px/s", () => {
    expect(pulseRadius(600, 500)).toBe(300);
  });

  it("acende célula cujo centro está a menos de cellSize/2 do anel", () => {
    expect(pulseHitsCell(100, 110, 56)).toBe(true);
    expect(pulseHitsCell(100, 140, 56)).toBe(false);
  });

  it("termina quando o raio passa a diagonal da área", () => {
    expect(isPulseDone(499, 300, 400)).toBe(false);
    expect(isPulseDone(501, 300, 400)).toBe(true);
  });
});
