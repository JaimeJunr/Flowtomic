import { describe, expect, it } from "vitest";
import {
  clampStars,
  glowFilter,
  lapBoost,
  orbitPhase,
  perimeterFraction,
  starGlow,
  starOpacity,
  trailSegments,
} from "./star-border-utils";

describe("trailSegments", () => {
  it("gera 3 segmentos de 1, 0,6 e 0,25 do rastro com opacidades 0,25, 0,5 e 1", () => {
    const segs = trailSegments(0.3, 0.5, "clockwise");
    expect(segs.map((s) => s.length)).toEqual([0.3, 0.3 * 0.6, 0.3 * 0.25]);
    expect(segs.map((s) => s.opacity)).toEqual([0.25, 0.5, 1]);
  });

  it("alinha as pontas no sentido horário: start + length é a cabeça", () => {
    for (const s of trailSegments(0.3, 0.5, "clockwise")) {
      expect(s.start + s.length).toBeCloseTo(0.5, 10);
      expect(s.dashArray).toBe(`${s.length} ${1 - s.length}`);
      expect(s.dashOffset).toBeCloseTo(-s.start, 10);
    }
  });

  it("alinha as pontas no anti-horário: o rastro fica à frente da cabeça", () => {
    for (const s of trailSegments(0.3, 0.5, "counterclockwise")) {
      expect(s.start).toBeCloseTo(0.5, 10);
    }
  });

  it("normaliza o início quando o rastro cruza a origem do caminho", () => {
    const [first] = trailSegments(0.3, 0.1, "clockwise");
    expect(first.start).toBeCloseTo(0.8, 10);
    expect(first.dashOffset).toBeCloseTo(-0.8, 10);
  });

  it("recusa trailLength fora de 0..1 com o valor recebido", () => {
    expect(() => trailSegments(1.5, 0, "clockwise")).toThrow(/1\.5/);
  });
});

describe("perimeterFraction", () => {
  const box = { width: 200, height: 100 };

  it("topo: ponto no meio do lado de cima", () => {
    // perímetro = 2*(200-20) + 2*(100-20) + 2*pi*10
    const perimeter = 2 * 180 + 2 * 80 + 2 * Math.PI * 10;
    expect(perimeterFraction(box, 10, 100, 0)).toBeCloseTo((90 + 0) / perimeter, 5);
  });

  it("direita, base e esquerda caem em ordem horária crescente", () => {
    const top = perimeterFraction(box, 10, 100, 0);
    const right = perimeterFraction(box, 10, 200, 50);
    const bottom = perimeterFraction(box, 10, 100, 100);
    const left = perimeterFraction(box, 10, 0, 50);
    expect(top).toBeLessThan(right);
    expect(right).toBeLessThan(bottom);
    expect(bottom).toBeLessThan(left);
    expect(left).toBeLessThan(1);
  });

  it("canto superior direito fica entre o topo e a direita", () => {
    const corner = perimeterFraction(box, 10, 200, 0);
    expect(corner).toBeGreaterThan(perimeterFraction(box, 10, 100, 0));
    expect(corner).toBeLessThan(perimeterFraction(box, 10, 200, 50));
  });

  it("projeta ponto de dentro no lado mais próximo", () => {
    expect(perimeterFraction(box, 10, 100, 5)).toBeCloseTo(perimeterFraction(box, 10, 100, 0), 5);
  });

  it("raio maior que metade da altura vira pílula sem NaN", () => {
    const f = perimeterFraction(box, 999, 100, 0);
    expect(Number.isFinite(f)).toBe(true);
    expect(f).toBeGreaterThanOrEqual(0);
    expect(f).toBeLessThanOrEqual(1);
  });

  it("caixa sem tamanho devolve 0", () => {
    expect(perimeterFraction({ width: 0, height: 0 }, 12, 5, 5)).toBe(0);
  });
});

describe("orbitPhase e lapBoost", () => {
  it("avança 1 volta a cada duration segundos, sempre em 0..1", () => {
    expect(orbitPhase(0, 4)).toBe(0);
    expect(orbitPhase(1000, 4)).toBeCloseTo(0.25, 10);
    expect(orbitPhase(5000, 4)).toBeCloseTo(0.25, 10);
  });

  it("recusa duration não positiva com o valor recebido", () => {
    expect(() => orbitPhase(0, 0)).toThrow(/0/);
    expect(() => orbitPhase(0, Number.NaN)).toThrow(/NaN/);
  });

  it("lapBoost vai de 0 a 1 em 600 ms com easing", () => {
    expect(lapBoost(0)).toBe(0);
    expect(lapBoost(300)).toBeCloseTo(0.5, 5);
    expect(lapBoost(600)).toBe(1);
    expect(lapBoost(5000)).toBe(1);
  });
});

describe("modos de hover", () => {
  it("clampStars limita a 1..6 e arredonda", () => {
    expect(clampStars(0)).toBe(1);
    expect(clampStars(3.4)).toBe(3);
    expect(clampStars(10)).toBe(6);
  });

  it("reveal esconde em repouso e mostra ativo; brighten sobe opacidade e brilho", () => {
    expect(starOpacity("reveal", false)).toBe(0);
    expect(starOpacity("reveal", true)).toBe(1);
    expect(starOpacity("brighten", false)).toBeLessThan(1);
    expect(starOpacity("brighten", true)).toBe(1);
    expect(starOpacity("lap", false)).toBe(1);
    expect(starGlow("brighten", 0.5, true)).toBeCloseTo(0.8, 10);
    expect(starGlow("brighten", 0.5, false)).toBe(0.5);
    expect(starGlow("lap", 0.5, true)).toBe(0.5);
  });

  it("glowFilter usa glow*8 px na cor recebida", () => {
    expect(glowFilter(0.5, "var(--primary)")).toBe("drop-shadow(0 0 4px var(--primary))");
  });
});
