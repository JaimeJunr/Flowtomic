import { describe, expect, it } from "vitest";
import {
  bringToFront,
  DEFAULT_POSE_OPTIONS,
  identityOrder,
  rotateNext,
  rotatePrev,
  shouldThrow,
  slotPose,
  springForBounce,
  validateCardCycleOptions,
} from "./card-cycle-utils";

const opts = DEFAULT_POSE_OPTIONS;

describe("slotPose", () => {
  it("coloca o degrau 0 na origem, opaco e sem véu", () => {
    const pose = slotPose(0, opts);
    expect(pose).toMatchObject({ x: 0, y: 0, z: 0, opacity: 1, veil: 0, zIndex: 100 });
    expect(pose.skewY).toBe(opts.skew);
  });

  it("empurra os degraus para a direita, para cima e para o fundo", () => {
    const a = slotPose(1, opts);
    const b = slotPose(2, opts);
    expect(a.x).toBe(opts.stepX);
    expect(a.y).toBe(-opts.stepY);
    expect(a.z).toBe(-opts.depth);
    expect(b.x).toBeGreaterThan(a.x);
    expect(b.y).toBeLessThan(a.y);
    expect(b.z).toBeLessThan(a.z);
    expect(b.zIndex).toBeLessThan(a.zIndex);
  });

  it("abre o degrau com o spread, sem mexer na profundidade", () => {
    const closed = slotPose(2, opts, 0);
    const open = slotPose(2, opts, 0.5);
    expect(open.x).toBe(closed.x * 1.5);
    expect(open.y).toBe(closed.y * 1.5);
    expect(open.z).toBe(closed.z);
  });

  it("esconde o que passa de visibleCards", () => {
    expect(slotPose(3, { ...opts, visibleCards: 4 }).opacity).toBe(1);
    expect(slotPose(4, { ...opts, visibleCards: 4 }).opacity).toBe(0);
  });

  it("escurece o véu até dim no último degrau visível", () => {
    const last = slotPose(3, { ...opts, visibleCards: 4, dim: 0.6 });
    expect(last.veil).toBeCloseTo(0.6);
    expect(slotPose(7, { ...opts, visibleCards: 4, dim: 0.6 }).veil).toBeCloseTo(0.6);
  });

  it("não divide por zero com um único cartão visível", () => {
    expect(slotPose(0, { ...opts, visibleCards: 1 }).veil).toBe(0);
  });
});

describe("ordem", () => {
  it("cria a ordem identidade", () => {
    expect(identityOrder(3)).toEqual([0, 1, 2]);
  });

  it("next move o primeiro para o fim", () => {
    expect(rotateNext([0, 1, 2, 3])).toEqual([1, 2, 3, 0]);
  });

  it("prev traz o último para a frente", () => {
    expect(rotatePrev([0, 1, 2, 3])).toEqual([3, 0, 1, 2]);
  });

  it("traz o índice escolhido para a frente mantendo a ordem cíclica", () => {
    expect(bringToFront([0, 1, 2, 3], 2)).toEqual([2, 3, 0, 1]);
    expect(bringToFront([0, 1, 2, 3], 0)).toEqual([0, 1, 2, 3]);
  });

  it("recusa índice que não está na ordem, citando o valor", () => {
    expect(() => bringToFront([0, 1], 5)).toThrow(/5/);
  });
});

describe("física e arrasto", () => {
  it("amortece de 30 a 12 conforme o bounce", () => {
    expect(springForBounce(0)).toMatchObject({ stiffness: 220, damping: 30 });
    expect(springForBounce(1).damping).toBe(12);
  });

  it("arremessa por distância ou velocidade", () => {
    expect(shouldThrow(81, 0)).toBe(true);
    expect(shouldThrow(10, 501)).toBe(true);
    expect(shouldThrow(80, 500)).toBe(false);
  });
});

describe("validateCardCycleOptions", () => {
  const ok = {
    itemCount: 3,
    visibleCards: 4,
    bounce: 0.35,
    dim: 0.5,
    parallax: 0.5,
    hoverSpread: 0.12,
  };

  it("aceita os defaults", () => {
    expect(() => validateCardCycleOptions(ok)).not.toThrow();
  });

  it("exige ao menos 2 itens, citando o valor recebido", () => {
    expect(() => validateCardCycleOptions({ ...ok, itemCount: 1 })).toThrow(/1/);
  });

  it("recusa visibleCards fora de 1..8", () => {
    expect(() => validateCardCycleOptions({ ...ok, visibleCards: 0 })).toThrow(/0/);
    expect(() => validateCardCycleOptions({ ...ok, visibleCards: 9 })).toThrow(/9/);
    expect(() => validateCardCycleOptions({ ...ok, visibleCards: 2.5 })).toThrow(/2.5/);
  });

  it.each([
    "bounce",
    "dim",
    "parallax",
    "hoverSpread",
  ] as const)("recusa %s fora de 0..1", (key) => {
    expect(() => validateCardCycleOptions({ ...ok, [key]: 1.5 })).toThrow(/1.5/);
    expect(() => validateCardCycleOptions({ ...ok, [key]: -0.1 })).toThrow(/-0.1/);
  });
});
