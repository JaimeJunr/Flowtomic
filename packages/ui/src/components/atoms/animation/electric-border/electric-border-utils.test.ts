import { describe, expect, it } from "vitest";
import {
  displacePoint,
  periodicNoise,
  roundedRectPerimeter,
  roundedRectPoints,
  valueNoise,
} from "./electric-border-utils";

describe("roundedRectPoints", () => {
  it("gera ~perímetro/step pontos", () => {
    const points = roundedRectPoints(200, 100, 16, 4);
    const expected = roundedRectPerimeter(200, 100, 16) / 4;
    expect(Math.abs(points.length - expected)).toBeLessThanOrEqual(1);
  });

  it("devolve normais unitárias", () => {
    for (const p of roundedRectPoints(200, 100, 16, 4)) {
      expect(Math.hypot(p.nx, p.ny)).toBeCloseTo(1, 5);
    }
  });

  it("o meio da borda de cima tem normal (0, -1)", () => {
    const points = roundedRectPoints(200, 100, 16, 4);
    const top = points.filter((p) => Math.abs(p.y) < 1e-6);
    const middle = top.reduce((best, p) =>
      Math.abs(p.x - 100) < Math.abs(best.x - 100) ? p : best
    );
    expect(Math.abs(middle.x - 100)).toBeLessThan(3);
    expect(middle.nx).toBeCloseTo(0, 5);
    expect(middle.ny).toBeCloseTo(-1, 5);
  });

  it("os pontos ficam dentro da caixa e espaçados de forma regular", () => {
    const points = roundedRectPoints(200, 100, 16, 4);
    for (const p of points) {
      expect(p.x).toBeGreaterThanOrEqual(-1e-6);
      expect(p.x).toBeLessThanOrEqual(200 + 1e-6);
      expect(p.y).toBeGreaterThanOrEqual(-1e-6);
      expect(p.y).toBeLessThanOrEqual(100 + 1e-6);
    }
    expect(points[1].s - points[0].s).toBeCloseTo(points[2].s - points[1].s, 6);
  });

  it("limita o raio à metade do menor lado e aceita raio zero", () => {
    expect(roundedRectPoints(40, 20, 999, 4).length).toBeGreaterThan(4);
    const square = roundedRectPoints(40, 20, 0, 4);
    expect(square.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
  });

  it("devolve lista vazia sem tamanho e rejeita step inválido com o valor recebido", () => {
    expect(roundedRectPoints(0, 100, 16, 4)).toEqual([]);
    expect(() => roundedRectPoints(100, 100, 16, 0)).toThrow(
      /step received 0, expected a number > 0/
    );
  });
});

describe("valueNoise", () => {
  it("é determinístico e depende da semente", () => {
    expect(valueNoise(3.7, 1)).toBe(valueNoise(3.7, 1));
    expect(valueNoise(3.7, 1)).not.toBe(valueNoise(3.7, 2));
  });

  it("fica em -1..1", () => {
    for (let i = 0; i < 2000; i++) {
      const v = valueNoise(i * 0.137, 5);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("é contínuo", () => {
    for (let i = 0; i < 500; i++) {
      const x = i * 0.31;
      expect(Math.abs(valueNoise(x + 0.001) - valueNoise(x))).toBeLessThan(0.02);
    }
  });
});

describe("periodicNoise e displacePoint", () => {
  it("o fim do perímetro encontra o começo", () => {
    const length = 500;
    const end = periodicNoise(length - 1e-6, length, 0.02, 1.3);
    expect(end).toBeCloseTo(periodicNoise(0, length, 0.02, 1.3), 3);
  });

  it("chaos 0 não desloca; chaos maior desloca ao longo da normal", () => {
    const p = { x: 10, y: 0, nx: 0, ny: -1, s: 37 };
    expect(displacePoint(p, 500, 2, 0)).toEqual({ x: 10, y: 0 });
    const moved = displacePoint(p, 500, 2, 1);
    expect(moved.x).toBe(10);
    expect(Math.abs(moved.y)).toBeLessThanOrEqual(40);
    expect(moved.y).not.toBe(0);
  });
});
