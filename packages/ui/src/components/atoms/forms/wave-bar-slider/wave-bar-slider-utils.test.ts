import { describe, expect, it } from "vitest";
import {
  barHeight,
  energyFromSpeed,
  handlePosition,
  litCount,
  smoothSpeed,
  type WaveShape,
} from "./wave-bar-slider-utils";

const shape: WaveShape = { height: 48, restHeight: 10, reach: 6, skew: 0.6 };

describe("litCount", () => {
  it("acende nenhuma barra no mínimo e todas no máximo", () => {
    expect(litCount(0, 0, 100, 32)).toBe(0);
    expect(litCount(100, 0, 100, 32)).toBe(32);
  });
  it("acende metade no meio e respeita faixa deslocada", () => {
    expect(litCount(50, 0, 100, 32)).toBe(16);
    expect(litCount(15, 10, 20, 10)).toBe(5);
  });
  it("rejeita faixa inválida com o valor recebido na mensagem", () => {
    expect(() => litCount(1, 5, 5, 8)).toThrow(/min=5 max=5/);
  });
});

describe("handlePosition", () => {
  it("vai da primeira à última barra", () => {
    expect(handlePosition(0, 0, 100, 32)).toBe(0);
    expect(handlePosition(100, 0, 100, 32)).toBe(31);
  });
});

describe("barHeight", () => {
  it("fica na altura de repouso com energia 0", () => {
    expect(barHeight(5, 5, 1, 0, shape)).toBe(10);
  });
  it("chega ao teto na alça com energia 1", () => {
    expect(barHeight(5, 5, 1, 1, shape)).toBeCloseTo(48);
  });
  it("fica em repouso fora do alcance", () => {
    expect(barHeight(20, 5, 1, 1, shape)).toBe(10);
  });
  it("é mais larga atrás da alça do que na frente com skew > 0", () => {
    const behind = barHeight(5 - 7, 5, 1, 1, shape);
    const ahead = barHeight(5 + 7, 5, 1, 1, shape);
    expect(behind).toBeGreaterThan(10);
    expect(ahead).toBe(10);
  });
  it("é simétrica com skew 0", () => {
    const flat = { ...shape, skew: 0 };
    expect(barHeight(3, 5, 1, 0.8, flat)).toBeCloseTo(barHeight(7, 5, 1, 0.8, flat));
  });
  it("inverte o lado de trás quando o movimento é para a esquerda", () => {
    expect(barHeight(12, 5, -1, 1, shape)).toBeGreaterThan(10);
    expect(barHeight(-2, 5, -1, 1, shape)).toBe(10);
  });
});

describe("velocidade", () => {
  it("suaviza em direção à velocidade instantânea", () => {
    const next = smoothSpeed(0, 1, 100);
    expect(next).toBeGreaterThan(0.5);
    expect(next).toBeLessThan(1);
    expect(smoothSpeed(1, 1, 16)).toBe(1);
  });
  it("limita a energia entre 0 e 1 e escala por sensitivity", () => {
    expect(energyFromSpeed(10, 1)).toBe(1);
    expect(energyFromSpeed(0.2, 1)).toBeCloseTo(0.2);
    expect(energyFromSpeed(0.2, 2)).toBeCloseTo(0.4);
  });
});
