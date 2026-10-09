import { describe, expect, it } from "vitest";
import { approach, copiesNeeded, wrapOffset } from "./logo-marquee-utils";

describe("copiesNeeded", () => {
  it("cobre 2x a área visível", () => {
    expect(copiesNeeded(100, 500)).toBe(10);
    expect(copiesNeeded(300, 500)).toBe(4);
  });

  it("nunca devolve menos que 2", () => {
    expect(copiesNeeded(1000, 200)).toBe(2);
    expect(copiesNeeded(0, 500)).toBe(2);
  });

  it("rejeita medidas inválidas com valor recebido e esperado", () => {
    expect(() => copiesNeeded(-1, 100)).toThrow(/received -1, expected a finite number >= 0/);
    expect(() => copiesNeeded(100, Number.NaN)).toThrow(/expected a finite number >= 0/);
  });
});

describe("wrapOffset", () => {
  it("mantém valores dentro do tamanho", () => {
    expect(wrapOffset(30, 100)).toBe(30);
    expect(wrapOffset(130, 100)).toBe(30);
  });

  it("trata negativos e o valor exatamente igual ao tamanho", () => {
    expect(wrapOffset(-30, 100)).toBe(70);
    expect(wrapOffset(100, 100)).toBe(0);
    expect(wrapOffset(-100, 100)).toBe(0);
  });

  it("devolve 0 quando a cópia ainda não tem tamanho", () => {
    expect(wrapOffset(50, 0)).toBe(0);
  });

  it("rejeita entrada inválida", () => {
    expect(() => wrapOffset(Number.NaN, 100)).toThrow(/received NaN/);
    expect(() => wrapOffset(10, -5)).toThrow(/received -5/);
  });
});

describe("approach", () => {
  it("fica no lugar com dt 0 e chega no alvo com dt grande", () => {
    expect(approach(60, 0, 0, 0.25)).toBe(60);
    expect(approach(60, 0, 10, 0.25)).toBeCloseTo(0, 5);
  });

  it("anda 63% do caminho em uma constante de tempo", () => {
    expect(approach(100, 0, 0.25, 0.25)).toBeCloseTo(100 * Math.exp(-1), 5);
  });

  it("tau 0 salta direto para o alvo", () => {
    expect(approach(60, 10, 0.016, 0)).toBe(10);
  });

  it("rejeita dt negativo", () => {
    expect(() => approach(1, 0, -1, 0.25)).toThrow(/received -1/);
  });
});
