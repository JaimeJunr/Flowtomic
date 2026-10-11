import { describe, expect, it } from "vitest";
import {
  assertExpandPanelsConfig,
  openPanelSize,
  panelBasis,
  parallaxShift,
  tiltFor,
} from "./expand-panels-utils";

describe("panelBasis", () => {
  it("soma 1 e dá expandRatio ao ativo", () => {
    const basis = panelBasis(5, 2, 0.52);
    expect(basis).toHaveLength(5);
    expect(basis.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    expect(basis[2]).toBeCloseTo(0.52, 10);
    expect(basis[0]).toBeCloseTo(0.12, 10);
  });

  it("com 2 painéis, o resto vai inteiro para o outro", () => {
    const basis = panelBasis(2, 0, 0.6);
    expect(basis[0]).toBeCloseTo(0.6, 10);
    expect(basis[1]).toBeCloseTo(0.4, 10);
  });
});

describe("assertExpandPanelsConfig", () => {
  it("aceita uma configuração válida", () => {
    expect(() => assertExpandPanelsConfig({ count: 5, index: 0, expandRatio: 0.52 })).not.toThrow();
  });

  it("rejeita menos de 2 e mais de 10 itens, citando o valor", () => {
    expect(() => assertExpandPanelsConfig({ count: 1, index: 0, expandRatio: 0.5 })).toThrow(
      /received 1/
    );
    expect(() => assertExpandPanelsConfig({ count: 11, index: 0, expandRatio: 0.5 })).toThrow(
      /received 11/
    );
  });

  it("rejeita expandRatio fora de 0.2..0.9", () => {
    expect(() => assertExpandPanelsConfig({ count: 3, index: 0, expandRatio: 0.1 })).toThrow(
      /received 0.1/
    );
    expect(() => assertExpandPanelsConfig({ count: 3, index: 0, expandRatio: 0.95 })).toThrow(
      /received 0.95/
    );
  });

  it("rejeita índice fora da faixa", () => {
    expect(() => assertExpandPanelsConfig({ count: 3, index: 3, expandRatio: 0.5 })).toThrow(
      /received 3/
    );
    expect(() => assertExpandPanelsConfig({ count: 3, index: -1, expandRatio: 0.5 })).toThrow(
      /received -1/
    );
  });
});

describe("tiltFor", () => {
  it("+tilt à esquerda do ativo, -tilt à direita, 0 no ativo", () => {
    expect(tiltFor(0, 2, 8)).toBe(8);
    expect(tiltFor(2, 2, 8)).toBe(0);
    expect(tiltFor(4, 2, 8)).toBe(-8);
  });
});

describe("parallaxShift", () => {
  it("empurra para o lado oposto ao ativo; zero no ativo", () => {
    expect(parallaxShift(0, 2, 0.5)).toBe(-20);
    expect(parallaxShift(3, 2, 0.5)).toBe(20);
    expect(parallaxShift(2, 2, 0.5)).toBe(0);
    expect(parallaxShift(0, 2, 0)).toBe(0);
  });
});

describe("openPanelSize", () => {
  it("desconta os vãos antes de aplicar a fração", () => {
    expect(openPanelSize(1000, 10, 5, 0.5)).toBe(480);
  });
  it("devolve 0 sem medida", () => {
    expect(openPanelSize(0, 10, 5, 0.5)).toBe(0);
  });
});
