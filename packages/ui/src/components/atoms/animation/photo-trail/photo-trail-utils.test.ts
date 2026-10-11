import { describe, expect, it } from "vitest";
import {
  isPhotoItem,
  moveVector,
  nextIndex,
  shouldSpawn,
  trimCards,
  variantMotion,
} from "./photo-trail-utils";

describe("shouldSpawn", () => {
  const last = { x: 0, y: 0 };
  it("não dispara abaixo do espaçamento", () => {
    expect(shouldSpawn(last, { x: 30, y: 40 }, 80)).toBe(false);
  });
  it("dispara no espaçamento exato", () => {
    expect(shouldSpawn(last, { x: 48, y: 64 }, 80)).toBe(true);
  });
  it("dispara acima do espaçamento", () => {
    expect(shouldSpawn(last, { x: 100, y: 0 }, 80)).toBe(true);
  });
});

describe("moveVector", () => {
  it("normaliza o trecho vezes o espaçamento", () => {
    const v = moveVector({ x: 0, y: 0 }, { x: 300, y: 400 }, 80);
    expect(v.dx).toBeCloseTo(48);
    expect(v.dy).toBeCloseTo(64);
  });
  it("devolve zero para trecho nulo", () => {
    expect(moveVector({ x: 5, y: 5 }, { x: 5, y: 5 }, 80)).toEqual({ dx: 0, dy: 0 });
  });
});

describe("variantMotion", () => {
  it("pop cresce de 0.4 a 1 e sai para 0.2", () => {
    const m = variantMotion("pop", 10, 10);
    expect(m.initial).toMatchObject({ scale: 0.4, opacity: 0 });
    expect(m.animate).toMatchObject({ scale: 1, opacity: 1 });
    expect(m.exit).toMatchObject({ scale: 0.2, opacity: 0 });
  });
  it("drift entra por trás e sai continuando o movimento", () => {
    const m = variantMotion("drift", 40, -20);
    expect(m.initial).toMatchObject({ x: -20, y: 10, opacity: 0 });
    expect(m.exit).toMatchObject({ x: 32, y: -16, opacity: 0 });
  });
  it("tilt gira pelo ângulo do movimento", () => {
    const m = variantMotion("tilt", 10, 10);
    expect(m.initial).toMatchObject({ rotate: 15, scale: 0.6 });
    expect(m.exit).toMatchObject({ y: 40, rotate: 30, opacity: 0 });
  });
  it("tilt limita o ângulo a 15 graus nos dois sentidos", () => {
    expect(variantMotion("tilt", 0, 50).initial.rotate).toBe(15);
    expect(variantMotion("tilt", 0, -50).initial.rotate).toBe(-15);
    expect(variantMotion("tilt", 50, 5).initial.rotate).toBeCloseTo(5.71, 1);
  });
});

describe("nextIndex", () => {
  it("cicla pela lista", () => {
    expect(nextIndex(0, 3)).toBe(1);
    expect(nextIndex(2, 3)).toBe(0);
  });
  it("lista de um item fica em zero", () => {
    expect(nextIndex(0, 1)).toBe(0);
  });
  it("recusa lista vazia informando o valor recebido", () => {
    expect(() => nextIndex(0, 0)).toThrow(/0/);
  });
});

describe("trimCards", () => {
  it("mantém só os mais recentes", () => {
    const cards = [1, 2, 3, 4];
    const { kept, dropped } = trimCards(cards, 3);
    expect(kept).toEqual([2, 3, 4]);
    expect(dropped).toEqual([1]);
  });
  it("não mexe quando cabe", () => {
    expect(trimCards([1, 2], 3)).toEqual({ kept: [1, 2], dropped: [] });
  });
});

describe("isPhotoItem", () => {
  it("reconhece objeto com src", () => {
    expect(isPhotoItem({ src: "a.jpg" })).toBe(true);
  });
  it("rejeita texto, nulo e elemento", () => {
    expect(isPhotoItem("texto")).toBe(false);
    expect(isPhotoItem(null)).toBe(false);
    expect(isPhotoItem({ type: "div", props: {}, key: null })).toBe(false);
  });
});
