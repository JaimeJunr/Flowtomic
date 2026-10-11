import { describe, expect, it } from "vitest";
import {
  assertGroupCount,
  cardTransition,
  openHeight,
  toneClasses,
} from "./expanding-card-nav-utils";

describe("openHeight", () => {
  it("soma barra, conteúdo e respiro", () => {
    expect(openHeight(200)).toBe(268);
    expect(openHeight(0)).toBe(68);
  });
  it("rejeita altura negativa dizendo valor e esperado", () => {
    expect(() => openHeight(-1)).toThrow(/-1.*>= 0/);
  });
});

describe("assertGroupCount", () => {
  it("aceita 1 a 4", () => {
    expect(() => assertGroupCount(1)).not.toThrow();
    expect(() => assertGroupCount(4)).not.toThrow();
  });
  it("rejeita 0 e 5", () => {
    expect(() => assertGroupCount(0)).toThrow(/0 groups.*between 1 and 4/);
    expect(() => assertGroupCount(5)).toThrow(/5 groups/);
  });
});

describe("toneClasses", () => {
  it("mapeia os tons, muted por padrão", () => {
    expect(toneClasses("primary")).toBe("bg-primary text-primary-foreground");
    expect(toneClasses("foreground")).toBe("bg-foreground text-background");
    expect(toneClasses()).toBe("bg-muted text-foreground");
  });
});

describe("cardTransition", () => {
  it("escalona ao abrir", () => {
    expect(cardTransition(2, true, false).delay).toBeCloseTo(0.24);
  });
  it("fecha junto em 0,2 s", () => {
    expect(cardTransition(2, false, false)).toEqual({ duration: 0.2 });
  });
  it("sem animação em movimento reduzido", () => {
    expect(cardTransition(1, true, true)).toEqual({ duration: 0 });
  });
});
