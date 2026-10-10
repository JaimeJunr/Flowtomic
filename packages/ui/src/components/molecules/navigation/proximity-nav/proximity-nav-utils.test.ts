import { describe, expect, it } from "vitest";
import { formatIndex, proximity, tickInfluence } from "./proximity-nav-utils";

describe("proximity", () => {
  it("vale 0 na distância igual ou maior que o raio", () => {
    expect(proximity(100, 100, "linear")).toBe(0);
    expect(proximity(-250, 100, "smooth")).toBe(0);
  });

  it("vale 1 na distância zero em qualquer curva", () => {
    expect(proximity(0, 100, "linear")).toBe(1);
    expect(proximity(0, 100, "smooth")).toBe(1);
    expect(proximity(0, 100, "sharp")).toBe(1);
  });

  it("smooth em 0,5 vale 0,5 e é simétrico na distância", () => {
    expect(proximity(50, 100, "smooth")).toBeCloseTo(0.5, 6);
    expect(proximity(-50, 100, "smooth")).toBeCloseTo(proximity(50, 100, "smooth"), 6);
  });

  it("sharp < linear < 1 no meio do alcance", () => {
    const sharp = proximity(50, 100, "sharp");
    const linear = proximity(50, 100, "linear");
    expect(sharp).toBeLessThan(linear);
    expect(linear).toBeLessThan(1);
  });

  it("lança erro com o valor recebido quando o raio é inválido", () => {
    expect(() => proximity(10, 0, "linear")).toThrow(/received 0/);
    expect(() => proximity(10, -5, "linear")).toThrow(/received -5/);
  });
});

describe("formatIndex", () => {
  it("usa dois dígitos e conta a partir de 1", () => {
    expect(formatIndex(0)).toBe("01");
    expect(formatIndex(11)).toBe("12");
  });
});

describe("tickInfluence", () => {
  it("é a média dos dois vizinhos", () => {
    expect(tickInfluence(1, 0)).toBe(0.5);
    expect(tickInfluence(0.2, 0.4)).toBeCloseTo(0.3, 6);
  });
});
