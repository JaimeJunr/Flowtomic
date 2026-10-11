import { describe, expect, it } from "vitest";
import { disappearTimerSeconds, fadeVariants, offsetFor } from "./fade-in-view-utils";

const base = {
  blur: false,
  initialOpacity: 0,
  duration: 0.8,
  delay: 0.2,
  ease: "easeOut" as const,
  disappearDuration: 0.5,
  disappearEase: "easeIn" as const,
};

describe("fadeVariants", () => {
  it("sem blur não define filter", () => {
    const v = fadeVariants(base);
    expect(v.hidden.opacity).toBe(0);
    expect(v.hidden.filter).toBeUndefined();
    expect(v.shown).toMatchObject({
      opacity: 1,
      transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
    });
    expect(v.gone).toMatchObject({
      opacity: 0,
      transition: { duration: 0.5, ease: "easeIn" },
    });
  });

  it("com blur desfoca o estado oculto e limpa no exibido", () => {
    const v = fadeVariants({ ...base, blur: true });
    expect(v.hidden.filter).toBe("blur(10px)");
    expect(v.shown.filter).toBe("blur(0px)");
  });

  it("respeita initialOpacity", () => {
    expect(fadeVariants({ ...base, initialOpacity: 0.3 }).hidden.opacity).toBe(0.3);
  });
});

describe("disappearTimerSeconds", () => {
  it("soma delay, duração e espera", () => {
    expect(disappearTimerSeconds(0.2, 0.8, 3)).toBeCloseTo(4);
  });
});

describe("offsetFor", () => {
  it("up começa abaixo, down acima, left à direita, right à esquerda", () => {
    expect(offsetFor("up", 40)).toEqual({ x: 0, y: 40 });
    expect(offsetFor("down", 40)).toEqual({ x: 0, y: -40 });
    expect(offsetFor("left", 40)).toEqual({ x: 40, y: 0 });
    expect(offsetFor("right", 40)).toEqual({ x: -40, y: 0 });
  });

  it("com distância 0 não desloca", () => {
    expect(offsetFor("left", 0)).toEqual({ x: 0, y: 0 });
  });

  it("distância negativa lança erro com o valor", () => {
    expect(() => offsetFor("up", -5)).toThrow(/-5/);
  });
});

describe("fadeVariants com deslocamento e escala", () => {
  it("coloca os iniciais no hidden e zera no shown", () => {
    const v = fadeVariants({ ...base, direction: "left", distance: 30, scale: 0.9 });
    expect(v.hidden).toMatchObject({ x: 30, y: 0, scale: 0.9 });
    expect(v.shown).toMatchObject({ x: 0, y: 0, scale: 1 });
    expect(v.gone).toMatchObject({ x: 30, y: 0, scale: 0.9 });
  });

  it("sem as props novas mantém tudo neutro", () => {
    const v = fadeVariants(base);
    expect(v.hidden).toMatchObject({ x: 0, y: 0, scale: 1 });
  });

  it("scale <= 0 lança erro com o valor", () => {
    expect(() => fadeVariants({ ...base, scale: 0 })).toThrow(/0/);
    expect(() => fadeVariants({ ...base, scale: -1 })).toThrow(/-1/);
  });
});
