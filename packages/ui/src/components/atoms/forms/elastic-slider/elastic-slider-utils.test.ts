import { describe, expect, it } from "vitest";
import {
  assertRange,
  decay,
  nextValueFromKey,
  overflowFromPointer,
  percentOf,
  valueFromPointer,
} from "./elastic-slider-utils";

const rect = { left: 100, right: 300, width: 200 };

describe("valueFromPointer", () => {
  it("devolve min e max nas pontas", () => {
    expect(valueFromPointer(100, rect, 0, 100, 0)).toBe(0);
    expect(valueFromPointer(300, rect, 0, 100, 0)).toBe(100);
  });
  it("devolve o meio no centro", () => {
    expect(valueFromPointer(200, rect, 0, 100, 0)).toBe(50);
  });
  it("arredonda ao step", () => {
    expect(valueFromPointer(163, rect, 1, 10, 1)).toBe(4);
    expect(valueFromPointer(200, rect, 0, 1000, 250)).toBe(500);
  });
  it("limita fora da trilha", () => {
    expect(valueFromPointer(0, rect, 0, 100, 0)).toBe(0);
    expect(valueFromPointer(900, rect, 0, 100, 0)).toBe(100);
  });
  it("lança com min >= max informando os valores", () => {
    expect(() => valueFromPointer(0, rect, 10, 10, 0)).toThrow("min=10 and max=10");
    expect(() => assertRange(5, 1)).toThrow("min=5 and max=1");
  });
});

describe("overflowFromPointer", () => {
  it("é zero dentro da trilha", () => {
    expect(overflowFromPointer(200, rect)).toBe(0);
  });
  it("é negativo à esquerda e positivo à direita", () => {
    expect(overflowFromPointer(60, rect)).toBe(-40);
    expect(overflowFromPointer(340, rect)).toBe(40);
  });
});

describe("decay", () => {
  it("é ímpar e zero na origem", () => {
    expect(decay(0)).toBe(0);
    expect(decay(-30)).toBeCloseTo(-decay(30));
  });
  it("cresce e nunca passa de 50", () => {
    expect(decay(60)).toBeGreaterThan(decay(20));
    expect(decay(100000)).toBeLessThanOrEqual(50);
    expect(decay(100000)).toBeCloseTo(50);
  });
});

describe("percentOf e teclado", () => {
  it("converte valor em porcentagem", () => {
    expect(percentOf(25, 0, 100)).toBe(25);
    expect(percentOf(5, 1, 10)).toBeCloseTo(44.444, 2);
  });
  it("anda 1% do intervalo sem step", () => {
    expect(nextValueFromKey("ArrowRight", 50, 0, 100, 0)).toBe(51);
    expect(nextValueFromKey("PageDown", 50, 0, 100, 0)).toBe(40);
  });
  it("respeita step, limites e teclas desconhecidas", () => {
    expect(nextValueFromKey("ArrowUp", 5, 1, 10, 1)).toBe(6);
    expect(nextValueFromKey("ArrowLeft", 1, 1, 10, 1)).toBe(1);
    expect(nextValueFromKey("Home", 5, 1, 10, 1)).toBe(1);
    expect(nextValueFromKey("End", 5, 1, 10, 1)).toBe(10);
    expect(nextValueFromKey("a", 5, 1, 10, 1)).toBeNull();
  });
});
