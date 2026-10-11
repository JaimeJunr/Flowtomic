import { describe, expect, it } from "vitest";
import {
  filterIdFrom,
  mulberry32,
  PARTICLE_COLORS,
  particleDuration,
  particlePath,
} from "./goo-tabs-utils";

const middle = () => 0.5;

describe("mulberry32", () => {
  it("repete a sequência para a mesma semente", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("devolve valores em [0, 1) e sementes diferentes divergem", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const v = a();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
    expect(v).not.toBe(b());
  });
});

describe("particlePath", () => {
  it("espaça os ângulos igualmente sem ruído", () => {
    const angles = [0, 1, 2, 3].map((i) => particlePath(i, 4, [90, 10], middle).angle);
    expect(angles).toEqual([0, 90, 180, 270]);
  });

  it("respeita as distâncias externa e interna", () => {
    const p = particlePath(1, 8, [90, 10], middle);
    expect(Math.hypot(p.outX, p.outY)).toBeCloseTo(90);
    expect(Math.hypot(p.inX, p.inY)).toBeCloseTo(10);
  });

  it("mantém o ruído de ângulo e de duração dentro dos limites", () => {
    const low = particlePath(0, 4, [90, 10], () => 0);
    const high = particlePath(0, 4, [90, 10], () => 0.999999);
    expect(low.angle).toBeCloseTo(-22.5);
    expect(high.angle).toBeLessThanOrEqual(22.5);
    expect(low.durationOffset).toBeCloseTo(-300);
    expect(high.durationOffset).toBeLessThanOrEqual(300);
  });

  it("lança erro com contagem inválida citando o valor", () => {
    expect(() => particlePath(0, 0, [90, 10], middle)).toThrow(/received count=0/);
  });
});

describe("filterIdFrom e particleDuration", () => {
  it("remove caracteres inválidos do id", () => {
    expect(filterIdFrom(":r1:")).toBe("goo-tabs-r1");
    expect(filterIdFrom("«r0»")).toBe("goo-tabs-r0");
  });

  it("nunca devolve duração menor que 100 ms", () => {
    expect(particleDuration(600, -300)).toBe(300);
    expect(particleDuration(50, -300)).toBe(100);
  });

  it("bolinhas usam só tons que contrastam com o fundo claro da barra", () => {
    expect(PARTICLE_COLORS.every((c) => c.startsWith("bg-primary"))).toBe(true);
  });
});
