import { describe, expect, it } from "vitest";
import {
  assertSameLength,
  cycle,
  flightTarget,
  mulberry32,
  pointerVelocity,
  restPose,
  shouldSend,
  tiltAngles,
  uncycle,
} from "./swipe-stack-utils";

describe("cycle e uncycle", () => {
  it("manda o primeiro ao fim", () => {
    expect(cycle([0, 1, 2, 3])).toEqual([1, 2, 3, 0]);
  });
  it("traz o ultimo para o topo", () => {
    expect(uncycle([1, 2, 3, 0])).toEqual([0, 1, 2, 3]);
  });
  it("nao quebra com lista vazia ou de um item", () => {
    expect(cycle([])).toEqual([]);
    expect(uncycle([7])).toEqual([7]);
  });
});

describe("restPose", () => {
  const layouts = ["fan", "cascade", "deck", "pile"] as const;

  it.each(layouts)("posicao 0 e neutra em %s", (layout) => {
    expect(restPose(0, layout, 0.5, 0.5)).toEqual({
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      shade: 0,
    });
  });

  it.each(layouts)("a escala cai com a posicao em %s", (layout) => {
    const first = restPose(1, layout, 0.5, 0.5).scale;
    const second = restPose(2, layout, 0.5, 0.5).scale;
    expect(first).toBeLessThan(1);
    expect(second).toBeLessThan(first);
  });

  it("fan gira 6 graus por posicao com spread 0.5", () => {
    expect(restPose(2, "fan", 0.5, 0.5).rotate).toBeCloseTo(12);
  });

  it("cascade desloca x e y igualmente", () => {
    const pose = restPose(2, "cascade", 0.5, 0.5);
    expect(pose.x).toBeCloseTo(28);
    expect(pose.y).toBeCloseTo(28);
  });

  it("deck sobe no eixo y", () => {
    expect(restPose(3, "deck", 0.5, 0.5).y).toBeCloseTo(-30);
  });

  it("pile e estavel para a mesma posicao e respeita o teto", () => {
    const a = restPose(3, "pile", 1, 0.5);
    const b = restPose(3, "pile", 1, 0.5);
    expect(a).toEqual(b);
    expect(Math.abs(a.rotate)).toBeLessThanOrEqual(24);
    expect(Math.abs(a.x)).toBeLessThanOrEqual(36);
    expect(Math.abs(a.y)).toBeLessThanOrEqual(36);
  });

  it("shade cresce com a posicao e a profundidade", () => {
    expect(restPose(2, "fan", 0.5, 0.5).shade).toBeCloseTo(0.3);
    expect(restPose(2, "fan", 0.5, 1).shade).toBeCloseTo(0.6);
  });
});

describe("shouldSend", () => {
  it("envia quando passa da distancia", () => {
    expect(shouldSend(120, 0, 90)).toBe(true);
    expect(shouldSend(-120, 0, 90)).toBe(true);
  });
  it("envia por velocidade mesmo curto", () => {
    expect(shouldSend(20, 900, 90)).toBe(true);
    expect(shouldSend(20, -900, 90)).toBe(true);
  });
  it("nao envia quando ambos ficam abaixo", () => {
    expect(shouldSend(50, 300, 90)).toBe(false);
  });
});

describe("tiltAngles", () => {
  it("inclina em proporcao ao deslocamento e limita no maximo", () => {
    expect(tiltAngles(50, 0, 100, 100, 30)).toEqual({ rotateX: 0, rotateY: 15 });
    expect(tiltAngles(500, 0, 100, 100, 30).rotateY).toBe(30);
    expect(tiltAngles(0, 50, 100, 100, 30).rotateX).toBe(-15);
  });
  it("tilt 0 deixa plano", () => {
    expect(tiltAngles(80, 80, 100, 100, 0)).toEqual({ rotateX: 0, rotateY: 0 });
  });
});

describe("pointerVelocity e flightTarget", () => {
  it("calcula px por segundo", () => {
    expect(pointerVelocity({ x: 0, y: 0, t: 0 }, { x: 30, y: 40, t: 100 })).toEqual({
      vx: 300,
      vy: 400,
    });
  });
  it("sem tempo decorrido devolve zero", () => {
    expect(pointerVelocity({ x: 0, y: 0, t: 5 }, { x: 30, y: 40, t: 5 })).toEqual({ vx: 0, vy: 0 });
  });
  it("voa na direcao do arraste", () => {
    const target = flightTarget(30, 40, 200);
    expect(target.x).toBeCloseTo(120);
    expect(target.y).toBeCloseTo(160);
  });
  it("sem direcao voa para a direita", () => {
    expect(flightTarget(0, 0, 100)).toEqual({ x: 100, y: 0 });
  });
});

describe("mulberry32 e assertSameLength", () => {
  it("e deterministico", () => {
    expect(mulberry32(3)()).toBe(mulberry32(3)());
  });
  it("lanca com os dois tamanhos", () => {
    expect(() => assertSameLength(3, 2)).toThrow(/3.*2/);
    expect(() => assertSameLength(2, 2)).not.toThrow();
  });
});
