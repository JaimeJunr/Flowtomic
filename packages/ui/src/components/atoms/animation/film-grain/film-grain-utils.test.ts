import { describe, expect, it } from "vitest";
import {
  dustCount,
  grainValue,
  gridSize,
  mulberry32,
  scanlineAlpha,
  scratchChance,
} from "./film-grain-utils";

describe("mulberry32", () => {
  it("é determinístico para a mesma semente", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("fica sempre em 0..1 e muda de semente para semente", () => {
    const next = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const v = next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe("grainValue", () => {
  it("r=0,5 dá 128 em qualquer contraste", () => {
    expect(grainValue(0.5, 0)).toBe(128);
    expect(grainValue(0.5, 1)).toBe(128);
  });

  it("contraste maior afasta do meio", () => {
    expect(Math.abs(grainValue(1, 1) - 128)).toBeGreaterThan(Math.abs(grainValue(1, 0) - 128));
  });

  it("sempre dentro de 0..255, mesmo com entrada fora da faixa", () => {
    for (const r of [-3, 0, 0.25, 1, 4]) {
      for (const c of [-1, 0, 0.6, 1, 2]) {
        const v = grainValue(r, c);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(255);
      }
    }
  });
});

describe("gridSize", () => {
  it("arredonda para cima", () => {
    expect(gridSize(101, 50, 4)).toEqual({ cols: 26, rows: 13 });
    expect(gridSize(0, 0, 1)).toEqual({ cols: 0, rows: 0 });
  });

  it("lança erro com size <= 0 citando o valor", () => {
    expect(() => gridSize(10, 10, 0)).toThrow(/received size 0/);
    expect(() => gridSize(10, 10, -2)).toThrow(/expected/);
  });
});

describe("helpers de efeito", () => {
  it("dustCount segue round(dust * área / 4000)", () => {
    expect(dustCount(0, 40000)).toBe(0);
    expect(dustCount(1, 40000)).toBe(10);
    expect(dustCount(0.5, 40000)).toBe(5);
  });

  it("scratchChance escala com scratches e com o tempo, limitada a 1", () => {
    expect(scratchChance(0, 1000)).toBe(0);
    expect(scratchChance(1, 1000)).toBeCloseTo(0.3);
    expect(scratchChance(1, 500)).toBeCloseTo(0.15);
    expect(scratchChance(1, 100000)).toBe(1);
  });

  it("scanlineAlpha é scanlines * 0,25", () => {
    expect(scanlineAlpha(1)).toBe(0.25);
    expect(scanlineAlpha(0)).toBe(0);
  });
});
