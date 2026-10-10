import { describe, expect, it } from "vitest";
import {
  approach,
  circularDistance,
  type OptionLayoutOptions,
  optionLayout,
  stepIndex,
  wrapIndex,
} from "./option-wheel-utils";

const BASE: OptionLayoutOptions = {
  fontSize: 3,
  spacing: 1.4,
  curve: 1,
  tilt: 6,
  blur: 2,
  fade: 0.25,
  minOpacity: 0.05,
  side: "left",
};

describe("approach", () => {
  it("converge ao alvo sem ultrapassar", () => {
    let position = 0;
    for (let i = 0; i < 200; i++) {
      position = approach(position, 3, 16, 200);
      expect(position).toBeLessThanOrEqual(3);
    }
    expect(position).toBeCloseTo(3, 3);
  });

  it("anda em direção ao alvo também para baixo", () => {
    const next = approach(5, 2, 16, 200);
    expect(next).toBeLessThan(5);
    expect(next).toBeGreaterThan(2);
  });

  it("recusa suavização menor ou igual a zero", () => {
    expect(() => approach(0, 1, 16, 0)).toThrow(/smoothing/);
  });
});

describe("optionLayout", () => {
  it("d=0 fica parado, na vertical, nítido e opaco", () => {
    const l = optionLayout(0, BASE);
    expect(l.x).toBeCloseTo(0);
    expect(l.y).toBeCloseTo(0);
    expect(l.angle).toBeCloseTo(0);
    expect(l.opacity).toBe(1);
    expect(l.blur).toBe(0);
  });

  it("distância maior dá mais blur e menos opacidade", () => {
    const near = optionLayout(1, BASE);
    const far = optionLayout(2, BASE);
    expect(far.blur).toBeGreaterThan(near.blur);
    expect(far.opacity).toBeLessThan(near.opacity);
    expect(far.y).toBeCloseTo(2 * 3 * 1.4);
  });

  it("opacidade nunca cai abaixo de minOpacity", () => {
    expect(optionLayout(10, BASE).opacity).toBe(0.05);
    expect(optionLayout(-10, BASE).opacity).toBe(0.05);
  });

  it("curve=0 mantém x em zero", () => {
    expect(optionLayout(3, { ...BASE, curve: 0 }).x).toBe(0);
  });

  it("tilt=0 não gera x infinito", () => {
    const l = optionLayout(3, { ...BASE, tilt: 0 });
    expect(l.x).toBe(0);
    expect(l.angle).toBe(0);
  });

  it("empurra para dentro da curva conforme se afasta", () => {
    const l = optionLayout(2, BASE);
    expect(l.x).toBeGreaterThan(0);
    expect(optionLayout(3, BASE).x).toBeGreaterThan(l.x);
  });

  it("espelha x e rotação em side=right", () => {
    const left = optionLayout(2, BASE);
    const right = optionLayout(2, { ...BASE, side: "right" });
    expect(right.x).toBeCloseTo(-left.x);
    expect(right.angle).toBeCloseTo(-left.angle);
    expect(right.y).toBeCloseTo(left.y);
  });
});

describe("circularDistance", () => {
  it("usa o caminho mais curto", () => {
    expect(circularDistance(4, 5)).toBe(-1);
    expect(circularDistance(-4, 5)).toBe(1);
    expect(circularDistance(2, 5)).toBe(2);
  });
});

describe("wrapIndex e stepIndex", () => {
  it("wrapIndex normaliza negativos", () => {
    expect(wrapIndex(-1, 4)).toBe(3);
    expect(wrapIndex(5, 4)).toBe(1);
  });

  it("stepIndex limita nos extremos sem loop", () => {
    expect(stepIndex(3, 1, 4, false)).toBe(3);
    expect(stepIndex(0, -1, 4, false)).toBe(0);
  });

  it("stepIndex dá a volta com loop", () => {
    expect(stepIndex(3, 1, 4, true)).toBe(0);
    expect(stepIndex(0, -1, 4, true)).toBe(3);
  });
});
