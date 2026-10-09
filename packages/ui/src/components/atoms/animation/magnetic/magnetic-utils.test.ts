import { describe, expect, it } from "vitest";
import { isInZone, magnetOffset } from "./magnetic-utils";

const RECT = { left: 100, top: 100, right: 200, bottom: 140, width: 100, height: 40 };

describe("isInZone", () => {
  it("ativa com o ponteiro dentro do retângulo", () => {
    expect(isInZone(RECT, 150, 120, 80)).toBe(true);
  });

  it("ativa exatamente na borda do padding", () => {
    expect(isInZone(RECT, 20, 120, 80)).toBe(true);
    expect(isInZone(RECT, 280, 220, 80)).toBe(true);
  });

  it("não ativa fora do padding", () => {
    expect(isInZone(RECT, 19, 120, 80)).toBe(false);
    expect(isInZone(RECT, 150, 221, 80)).toBe(false);
  });
});

describe("magnetOffset", () => {
  it("devolve zero no centro", () => {
    expect(magnetOffset(RECT, 150, 120, 3, 24)).toEqual({ x: 0, y: 0 });
  });

  it("puxa para a direita e para baixo com sinal positivo", () => {
    const { x, y } = magnetOffset(RECT, 180, 130, 3, 24);
    expect(x).toBeCloseTo(10);
    expect(y).toBeCloseTo(10 / 3);
  });

  it("puxa para a esquerda com sinal negativo", () => {
    expect(magnetOffset(RECT, 120, 120, 3, 24).x).toBeCloseTo(-10);
  });

  it("respeita maxOffset por eixo", () => {
    expect(magnetOffset(RECT, 1000, -1000, 3, 24)).toEqual({ x: 24, y: -24 });
  });

  it("strength maior desloca menos", () => {
    const fraco = magnetOffset(RECT, 180, 120, 6, 24).x;
    const forte = magnetOffset(RECT, 180, 120, 3, 24).x;
    expect(fraco).toBeLessThan(forte);
  });

  it("rejeita strength não positivo informando o valor recebido", () => {
    expect(() => magnetOffset(RECT, 150, 120, 0, 24)).toThrow(/received 0.*expected/);
  });
});
