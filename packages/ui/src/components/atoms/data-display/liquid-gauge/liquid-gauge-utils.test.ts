import { describe, expect, it } from "vitest";
import {
  clampLevel,
  keyboardLevel,
  type LiquidState,
  levelFromPointer,
  rippleOffset,
  stepLiquid,
  surfacePolygon,
  surfaceSlope,
} from "./liquid-gauge-utils";

const OPTS = { viscosity: 0.15, splash: 0.4 };

function simulate(start: LiquidState, target: number, seconds: number, opts = OPTS): LiquidState {
  let state = start;
  for (let t = 0; t < seconds; t += 1 / 60) state = stepLiquid(state, target, 1 / 60, opts);
  return state;
}

describe("stepLiquid", () => {
  it("converge para o alvo", () => {
    const end = simulate({ level: 0, velocity: 0 }, 60, 6);
    expect(end.level).toBeCloseTo(60, 0);
    expect(Math.abs(end.velocity)).toBeLessThan(1);
  });

  it("viscosidade 0 chega no alvo no mesmo passo", () => {
    const next = stepLiquid({ level: 0, velocity: 50 }, 80, 1 / 60, { viscosity: 0, splash: 0.4 });
    expect(next).toEqual({ level: 80, velocity: 0 });
  });

  it("nunca sai de 0..100, mesmo com alvo fora", () => {
    let state: LiquidState = { level: 90, velocity: 400 };
    for (let i = 0; i < 300; i++) {
      state = stepLiquid(state, 100, 1 / 60, OPTS);
      expect(state.level).toBeGreaterThanOrEqual(0);
      expect(state.level).toBeLessThanOrEqual(100);
    }
  });

  it("splash devolve velocidade ao bater no topo; splash 0 não volta", () => {
    const hit = { level: 99.9, velocity: 300 };
    const bounced = stepLiquid(hit, 100, 1 / 240, { viscosity: 0.15, splash: 0.5 });
    expect(bounced.level).toBeGreaterThan(99);
    expect(bounced.level).toBeLessThanOrEqual(100);
    expect(bounced.velocity).toBeLessThan(0);
    const dead = stepLiquid(hit, 100, 1 / 240, { viscosity: 0.15, splash: 0 });
    expect(dead.velocity).toBeGreaterThanOrEqual(0);
  });

  it("splash 0 no fundo também não volta", () => {
    const next = stepLiquid({ level: 1, velocity: -300 }, 0, 1 / 30, {
      viscosity: 0.15,
      splash: 0,
    });
    expect(next.level).toBe(0);
    expect(next.velocity).toBeGreaterThanOrEqual(0);
  });
});

describe("surfacePolygon", () => {
  it("nível 0 colapsa no fundo e 100 sobe até o topo", () => {
    expect(surfacePolygon(0, 0, 100)).toBe(
      "polygon(0% 100px, 50% 100px, 100% 100px, 100% 100px, 0% 100px)"
    );
    expect(surfacePolygon(100, 0, 100)).toBe(
      "polygon(0% 0px, 50% 0px, 100% 0px, 100% 100px, 0% 100px)"
    );
  });

  it("inclinação muda só a borda de cima", () => {
    const flat = surfacePolygon(50, 0, 100).split(", ");
    const tilted = surfacePolygon(50, 10, 100).split(", ");
    expect(tilted[0]).not.toBe(flat[0]);
    expect(tilted[2]).not.toBe(flat[2]);
    expect(tilted.slice(3)).toEqual(flat.slice(3));
  });

  it("limita y a 0..altura", () => {
    expect(surfacePolygon(95, 50, 100)).toContain("0% 0px");
  });
});

describe("surfaceSlope e rippleOffset", () => {
  it("inclinação proporcional à velocidade e limitada", () => {
    expect(surfaceSlope(10, 0.5, 100)).toBeCloseTo(5);
    expect(surfaceSlope(-10, 0.5, 100)).toBeCloseTo(-5);
    expect(Math.abs(surfaceSlope(10_000, 0.5, 100))).toBeLessThanOrEqual(10);
    expect(surfaceSlope(0, 0.5, 100)).toBe(0);
  });

  it("ondulação some em repouso", () => {
    expect(rippleOffset(0, 0.45, 123)).toBe(0);
    expect(rippleOffset(100, 0.45, 40)).not.toBe(0);
  });
});

describe("clampLevel, levelFromPointer, keyboardLevel", () => {
  it("clampLevel limita a 0..100", () => {
    expect(clampLevel(-5)).toBe(0);
    expect(clampLevel(140)).toBe(100);
    expect(clampLevel(42)).toBe(42);
  });

  it("levelFromPointer converte y em nível inteiro", () => {
    expect(levelFromPointer(100, 0, 200)).toBe(50);
    expect(levelFromPointer(-10, 0, 200)).toBe(100);
    expect(levelFromPointer(500, 0, 200)).toBe(0);
  });

  it("levelFromPointer rejeita altura inválida", () => {
    expect(() => levelFromPointer(10, 0, 0)).toThrow(/received height 0.*expected/);
  });

  it("keyboardLevel mapeia teclas", () => {
    expect(keyboardLevel("ArrowUp", 50)).toBe(51);
    expect(keyboardLevel("ArrowRight", 50)).toBe(51);
    expect(keyboardLevel("ArrowDown", 50)).toBe(49);
    expect(keyboardLevel("ArrowLeft", 50)).toBe(49);
    expect(keyboardLevel("PageUp", 50)).toBe(60);
    expect(keyboardLevel("PageDown", 50)).toBe(40);
    expect(keyboardLevel("Home", 50)).toBe(0);
    expect(keyboardLevel("End", 50)).toBe(100);
    expect(keyboardLevel("a", 50)).toBeNull();
    expect(keyboardLevel("ArrowUp", 100)).toBe(100);
  });
});
