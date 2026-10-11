import { describe, expect, it } from "vitest";
import {
  clampMove,
  dropShadowFor,
  foldShadowOpacity,
  normalizeDirection,
  peelExtent,
  peelGeometry,
  placementStyle,
} from "./peel-sticker-utils";

describe("peelGeometry", () => {
  it("calcula altura da aba, linha de dobra e corte", () => {
    expect(peelGeometry(200, 0.25)).toEqual({ clipBottomPct: 25, flapHeight: 50, foldY: 150 });
  });

  it("limita a fração a 0.9 e a 0", () => {
    expect(peelGeometry(100, 2).clipBottomPct).toBeCloseTo(90);
    expect(peelGeometry(100, -1)).toEqual({ clipBottomPct: 0, flapHeight: 0, foldY: 100 });
  });

  it("falha com altura inválida citando valor e esperado", () => {
    expect(() => peelGeometry(0, 0.3)).toThrow(/> 0.*received 0/);
    expect(() => peelGeometry(-5, 0.3)).toThrow(/-5/);
    expect(() => peelGeometry(Number.NaN, 0.3)).toThrow(/NaN/);
  });
});

describe("normalizeDirection e peelExtent", () => {
  it("normaliza para 0-360", () => {
    expect(normalizeDirection(370)).toBe(10);
    expect(normalizeDirection(-90)).toBe(270);
  });

  it("extensão é a largura em 0 e 90 graus e maior na diagonal", () => {
    expect(peelExtent(100, 0)).toBeCloseTo(100);
    expect(peelExtent(100, 90)).toBeCloseTo(100);
    expect(peelExtent(100, 45)).toBeCloseTo(141.42, 1);
  });
});

describe("foldShadowOpacity", () => {
  it("é intensidade vezes fração vezes 2, limitada a 1", () => {
    expect(foldShadowOpacity(0.5, 0.3)).toBeCloseTo(0.3);
    expect(foldShadowOpacity(1, 0.9)).toBe(1);
    expect(foldShadowOpacity(0.5, 0)).toBe(0);
  });
});

describe("dropShadowFor", () => {
  it("cresce com a fração e usa só token", () => {
    const rest = dropShadowFor(0.5, 0);
    const peeled = dropShadowFor(0.5, 0.5);
    expect(rest).toContain("var(--foreground)");
    expect(rest).not.toBe(peeled);
    expect(rest).not.toMatch(/rgb|#/);
  });
});

describe("clampMove", () => {
  it("limita o deslocamento à área", () => {
    expect(clampMove(16, 100, 260, 0, 270)).toBe(10);
    expect(clampMove(-16, 5, 165, 0, 400)).toBe(-5);
    expect(clampMove(16, 100, 260, 0, 400)).toBe(16);
  });

  it("não move quando o item é maior que a área", () => {
    expect(clampMove(16, 0, 300, 10, 100)).toBe(0);
  });
});

describe("placementStyle", () => {
  it("usa margem de 16 px nos cantos", () => {
    expect(placementStyle("top-left", 160)).toEqual({ top: 16, left: 16 });
    expect(placementStyle("bottom-right", 160)).toEqual({ bottom: 16, right: 16 });
  });

  it("centraliza com margem negativa", () => {
    expect(placementStyle("center", 160)).toEqual({
      top: "50%",
      left: "50%",
      marginTop: -80,
      marginLeft: -80,
    });
  });
});
