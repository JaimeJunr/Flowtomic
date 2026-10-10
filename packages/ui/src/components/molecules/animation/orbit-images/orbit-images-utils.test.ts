import { describe, expect, it } from "vitest";
import {
  ellipsePoint,
  itemFraction,
  ORBIT_SHAPES,
  type OrbitPathOptions,
  orbitPath,
  rotatePoint,
} from "./orbit-images-utils";

const OPTS: OrbitPathOptions = {
  radiusX: 42,
  radiusY: 14,
  radius: 40,
  starPoints: 5,
  starInnerRatio: 0.5,
  aspect: 1,
};

describe("orbitPath", () => {
  it.each(ORBIT_SHAPES)("%s começa com M e fecha com Z", (shape) => {
    const d = orbitPath(shape, OPTS).trim();
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
  });

  it("estrela com N pontas tem 2N vértices", () => {
    const d = orbitPath("star", { ...OPTS, starPoints: 6 });
    expect(d.match(/[ML]/g)).toHaveLength(12);
    expect(orbitPath("star", { ...OPTS, starPoints: 3 }).match(/[ML]/g)).toHaveLength(6);
  });

  it("elipse usa radiusX e radiusY; círculo usa radius", () => {
    expect(orbitPath("ellipse", OPTS)).toContain("A 42 14");
    expect(orbitPath("circle", OPTS)).toContain("A 40 40");
  });

  it("círculo com aspect 16/9 tem a mesma extensão em px nas duas direções", () => {
    const d = orbitPath("circle", { ...OPTS, aspect: 16 / 9 });
    const [, rx, ry] = d.match(/A ([\d.]+) ([\d.]+)/)?.map(Number) ?? [];
    expect(rx * 16).toBeCloseTo(ry * 9, 1);
    expect(rx * 16).toBeCloseTo(40 * 9, 1);
  });

  it("quadrado com aspect 16/9 é quadrado em px", () => {
    const d = orbitPath("square", { ...OPTS, aspect: 16 / 9 });
    const nums = (d.match(/-?[\d.]+/g) ?? []).map(Number);
    const [x0, y0, x1, , , y2] = nums;
    expect((x1 - x0) * 16).toBeCloseTo((y2 - y0) * 9, 1);
  });

  it("infinito é feito de 4 cúbicas", () => {
    expect(orbitPath("infinity", OPTS).match(/C/g)).toHaveLength(4);
  });

  it("rejeita estrela com menos de 2 pontas, citando o valor", () => {
    expect(() => orbitPath("star", { ...OPTS, starPoints: 1 })).toThrow(/received 1.*>= 2/);
  });
});

describe("rotatePoint", () => {
  it("leva (100,50) para (50,100) em 90 graus", () => {
    const [x, y] = rotatePoint(100, 50, 90);
    expect(x).toBeCloseTo(50);
    expect(y).toBeCloseTo(100);
  });

  it("zero grau não move o ponto", () => {
    expect(rotatePoint(80, 20, 0)).toEqual([80, 20]);
  });

  it("o centro é fixo", () => {
    const [x, y] = rotatePoint(50, 50, 37);
    expect(x).toBeCloseTo(50);
    expect(y).toBeCloseTo(50);
  });
});

describe("rotatePoint com aspect", () => {
  it("preserva a distância em px ao centro", () => {
    const aspect = 16 / 9;
    const [w, h] = [1600, 900];
    const px = (x: number, y: number) => Math.hypot(((x - 50) * w) / 100, ((y - 50) * h) / 100);
    const [x, y] = rotatePoint(90, 40, 33, aspect);
    expect(px(x, y)).toBeCloseTo(px(90, 40), 3);
  });

  it("aspect 1 mantém o resultado antigo", () => {
    const [x, y] = rotatePoint(100, 50, 90, 1);
    expect(x).toBeCloseTo(50);
    expect(y).toBeCloseTo(100);
  });
});

describe("itemFraction", () => {
  it("espaça igualmente os itens", () => {
    const fractions = [0, 1, 2, 3].map((i) => itemFraction(0.1, i, 4, "normal"));
    expect(fractions[0]).toBeCloseTo(0.1);
    expect(fractions[1]).toBeCloseTo(0.35);
    expect(fractions[3]).toBeCloseTo(0.85);
  });

  it("dá a volta em 1", () => {
    expect(itemFraction(0.9, 1, 2, "normal")).toBeCloseTo(0.4);
  });

  it("inverte em reverse e continua em [0,1)", () => {
    expect(itemFraction(0.25, 0, 4, "reverse")).toBeCloseTo(0.75);
    const f = itemFraction(0, 0, 3, "reverse");
    expect(f).toBeGreaterThanOrEqual(0);
    expect(f).toBeLessThan(1);
  });
});

describe("ellipsePoint", () => {
  it("em 0 fica à direita do centro", () => {
    const [x, y] = ellipsePoint(0, 42, 14);
    expect(x).toBeCloseTo(92);
    expect(y).toBeCloseTo(50);
  });

  it("em 0,25 fica abaixo do centro", () => {
    const [x, y] = ellipsePoint(0.25, 42, 14);
    expect(x).toBeCloseTo(50);
    expect(y).toBeCloseTo(64);
  });
});
