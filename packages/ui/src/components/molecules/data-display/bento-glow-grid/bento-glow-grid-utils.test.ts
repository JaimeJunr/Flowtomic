import { describe, expect, it } from "vitest";
import {
  bentoSpan,
  glowFor,
  particleSeeds,
  rectDistance,
  rippleDiameter,
  tiltFor,
  validateBentoProps,
} from "./bento-glow-grid-utils";

describe("bentoSpan", () => {
  it("dá 2x2 aos índices 2 e 3", () => {
    expect(bentoSpan(2)).toBe("lg:col-span-2 lg:row-span-2");
    expect(bentoSpan(3)).toBe("lg:col-span-2 lg:row-span-2");
  });
  it("deixa os demais 1x1", () => {
    expect(bentoSpan(0)).toBe("");
    expect(bentoSpan(1)).toBe("");
    expect(bentoSpan(7)).toBe("");
  });
});

describe("particleSeeds", () => {
  it("é determinístico", () => {
    expect(particleSeeds(8, 3)).toEqual(particleSeeds(8, 3));
  });
  it("muda com a semente", () => {
    expect(particleSeeds(8, 3)).not.toEqual(particleSeeds(8, 4));
  });
  it("devolve a quantidade pedida, com posições em 0..100 e duração em 2..4", () => {
    const seeds = particleSeeds(30, 1);
    expect(seeds).toHaveLength(30);
    for (const s of seeds) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThanOrEqual(100);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThanOrEqual(100);
      expect(s.duration).toBeGreaterThanOrEqual(2);
      expect(s.duration).toBeLessThanOrEqual(4);
    }
  });
  it("devolve lista vazia com zero", () => {
    expect(particleSeeds(0, 1)).toEqual([]);
  });
});

describe("glowFor", () => {
  it("vale 1 dentro do cartão", () => {
    expect(glowFor(0, 300)).toBe(1);
  });
  it("cai linearmente até 0 em radius/2", () => {
    expect(glowFor(75, 300)).toBeCloseTo(0.5);
    expect(glowFor(150, 300)).toBe(0);
    expect(glowFor(400, 300)).toBe(0);
  });
  it("vale 0 com raio zero", () => {
    expect(glowFor(10, 0)).toBe(0);
  });
});

describe("rectDistance", () => {
  const rect = { left: 100, top: 100, right: 200, bottom: 200 };
  it("é 0 dentro", () => {
    expect(rectDistance(rect, 150, 150)).toBe(0);
  });
  it("mede até a borda mais próxima", () => {
    expect(rectDistance(rect, 90, 150)).toBe(10);
    expect(rectDistance(rect, 203, 204)).toBe(5);
  });
});

describe("rippleDiameter", () => {
  it("é o dobro da maior distância até um canto", () => {
    expect(rippleDiameter(100, 50, 0, 0)).toBeCloseTo(2 * Math.hypot(100, 50));
    expect(rippleDiameter(100, 50, 100, 50)).toBeCloseTo(2 * Math.hypot(100, 50));
  });
});

describe("tiltFor", () => {
  it("normaliza o ponteiro em -1..1", () => {
    expect(tiltFor(0, 0, 100, 100)).toEqual({ px: -1, py: -1 });
    expect(tiltFor(50, 50, 100, 100)).toEqual({ px: 0, py: 0 });
    expect(tiltFor(500, -20, 100, 100)).toEqual({ px: 1, py: -1 });
  });
  it("não divide por zero", () => {
    expect(tiltFor(5, 5, 0, 0)).toEqual({ px: 0, py: 0 });
  });
});

describe("validateBentoProps", () => {
  it("aceita 1..12 itens e 0..30 partículas", () => {
    expect(() => validateBentoProps(1, 0)).not.toThrow();
    expect(() => validateBentoProps(12, 30)).not.toThrow();
  });
  it("recusa itens vazios ou acima de 12 informando o valor", () => {
    expect(() => validateBentoProps(0, 12)).toThrow(/1\.\.12.*0/);
    expect(() => validateBentoProps(13, 12)).toThrow(/1\.\.12.*13/);
  });
  it("recusa partículas fora de 0..30", () => {
    expect(() => validateBentoProps(3, -1)).toThrow(/0\.\.30.*-1/);
    expect(() => validateBentoProps(3, 31)).toThrow(/0\.\.30.*31/);
  });
});
