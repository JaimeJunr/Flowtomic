import { describe, expect, it } from "vitest";
import {
  barOutline,
  centerPath,
  clampRadius,
  pointAtX,
  pointOnCurve,
  scrollOffset,
  viewBoxFor,
} from "./curved-input-utils";

describe("pointOnCurve", () => {
  it("o meio sobe `bend` em relacao as pontas", () => {
    const end = pointOnCurve(0, 400, 28);
    const mid = pointOnCurve(0.5, 400, 28);
    expect(end.y - mid.y).toBeCloseTo(28);
    expect(mid.x).toBeCloseTo(200);
  });

  it("bend negativo desce o meio", () => {
    const end = pointOnCurve(0, 400, -20);
    const mid = pointOnCurve(0.5, 400, -20);
    expect(mid.y - end.y).toBeCloseTo(20);
  });
});

describe("barOutline", () => {
  it("comeca com M e fecha com Z", () => {
    const d = barOutline(450, 64, 28, 18);
    expect(d.startsWith("M")).toBe(true);
    expect(d.trim().endsWith("Z")).toBe(true);
  });

  it("bend=0 gera topo reto", () => {
    const d = barOutline(450, 64, 0, 18);
    const quad = /Q\s*([-\d.]+)[ ,]([-\d.]+)\s+([-\d.]+)[ ,]([-\d.]+)/.exec(d);
    expect(quad).not.toBeNull();
    const startY = /^M\s*([-\d.]+)[ ,]([-\d.]+)/.exec(d)?.[2];
    expect(Number(quad?.[2])).toBeCloseTo(Number(startY));
    expect(Number(quad?.[4])).toBeCloseTo(Number(startY));
  });

  it("limita o raio a metade da altura", () => {
    expect(clampRadius(100, 64)).toBe(32);
    expect(clampRadius(10, 64)).toBe(10);
    expect(barOutline(450, 64, 28, 100)).toBe(barOutline(450, 64, 28, 32));
  });
});

describe("centerPath", () => {
  it("devolve o trecho da curva entre x0 e x1", () => {
    const d = centerPath(100, 300, 400, 28);
    expect(d.startsWith("M")).toBe(true);
    expect(d).toContain("Q");
    const [, x0] = /^M\s*([-\d.]+)/.exec(d) ?? [];
    expect(Number(x0)).toBeCloseTo(100);
  });
});

describe("scrollOffset", () => {
  it("e 0 quando o cursor cabe no trilho", () => {
    expect(scrollOffset(100, 80, 200)).toBe(0);
  });

  it("e positivo quando passa do trilho", () => {
    expect(scrollOffset(300, 280, 200)).toBe(80);
  });
});

describe("viewBoxFor", () => {
  it("tem folga de |bend| + height/2", () => {
    const vb = viewBoxFor(450, 64, -28);
    expect(vb.minY).toBe(-60);
    expect(vb.height).toBe(120);
    expect(vb.width).toBe(450);
  });
});

describe("pointAtX", () => {
  it("devolve y da curva e angulo zero no meio", () => {
    const p = pointAtX(200, 400, 28);
    expect(p.y).toBeCloseTo(0);
    expect(p.angle).toBeCloseTo(0);
  });

  it("inclina para baixo a direita do meio", () => {
    expect(pointAtX(300, 400, 28).angle).toBeGreaterThan(0);
  });
});
