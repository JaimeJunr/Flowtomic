import { describe, expect, it } from "vitest";
import { applyEasing, sparkAngle, sparkSegment } from "./click-spark-utils";

const OPTS = { sparkSize: 10, sparkRadius: 20, extraScale: 1 };

describe("sparkSegment", () => {
  it("em p=0 começa na origem com o comprimento cheio", () => {
    const s = sparkSegment(0, 0, OPTS);
    expect(s).toEqual({ x1: 0, y1: 0, x2: 10, y2: 0 });
  });

  it("em p=0.5 afasta o início e encurta o traço", () => {
    const s = sparkSegment(0, 0.5, OPTS);
    expect(s.x1).toBeCloseTo(10);
    expect(s.x2).toBeCloseTo(15);
  });

  it("em p=1 o comprimento some e a distância é o raio", () => {
    const s = sparkSegment(Math.PI / 2, 1, OPTS);
    expect(s.x1).toBeCloseTo(0);
    expect(s.y1).toBeCloseTo(20);
    expect(s.y2).toBeCloseTo(20);
  });

  it("extraScale multiplica a distância", () => {
    const s = sparkSegment(0, 1, { ...OPTS, extraScale: 2 });
    expect(s.x1).toBeCloseTo(40);
  });
});

describe("sparkAngle", () => {
  it("espaça igualmente 4 traços", () => {
    const angles = [0, 1, 2, 3].map((i) => sparkAngle(i, 4));
    expect(angles).toEqual([0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]);
  });

  it("espaça igualmente 8 traços", () => {
    expect(sparkAngle(1, 8)).toBeCloseTo(Math.PI / 4);
    expect(sparkAngle(7, 8)).toBeCloseTo((7 * Math.PI) / 4);
  });

  it("rejeita contagem inválida com valor recebido", () => {
    expect(() => sparkAngle(0, 0)).toThrow(/received sparkCount 0/);
  });
});

describe("applyEasing", () => {
  it.each(["linear", "ease-in", "ease-out", "ease-in-out"] as const)("%s vai de 0 a 1", (name) => {
    expect(applyEasing(name, 0)).toBe(0);
    expect(applyEasing(name, 1)).toBe(1);
  });

  it("ease-out anda mais rápido no começo que linear", () => {
    expect(applyEasing("ease-out", 0.5)).toBeGreaterThan(0.5);
    expect(applyEasing("ease-in", 0.5)).toBeLessThan(0.5);
  });

  it("limita t fora de 0..1", () => {
    expect(applyEasing("linear", 2)).toBe(1);
    expect(applyEasing("linear", -1)).toBe(0);
  });
});
