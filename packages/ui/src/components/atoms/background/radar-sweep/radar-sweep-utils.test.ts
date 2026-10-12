import { describe, expect, it } from "vitest";
import {
  assertColorToken,
  assertMode,
  clampClutter,
  clampRings,
  clampScale,
  clampSpokes,
  clampTargets,
  clampTrail,
  fallbackBackground,
  modeCode,
  pointerTarget,
  stepToward,
  sweepLag,
} from "./radar-sweep-utils";

const TAU = Math.PI * 2;

describe("clamps", () => {
  it("limits trail to 0-1", () => {
    expect(clampTrail(-1)).toBe(0);
    expect(clampTrail(4)).toBe(1);
    expect(clampTrail(0.35)).toBe(0.35);
  });
  it("limits scale to 0.2-1.5", () => {
    expect(clampScale(0)).toBe(0.2);
    expect(clampScale(9)).toBe(1.5);
    expect(clampScale(0.9)).toBe(0.9);
  });
  it("limits rings to whole numbers from 1 to 12", () => {
    expect(clampRings(0)).toBe(1);
    expect(clampRings(40)).toBe(12);
    expect(clampRings(5.6)).toBe(6);
  });
  it("limits spokes to whole numbers from 0 to 36", () => {
    expect(clampSpokes(-2)).toBe(0);
    expect(clampSpokes(99)).toBe(36);
    expect(clampSpokes(12)).toBe(12);
  });
  it("limits targets to whole numbers from 0 to 16", () => {
    expect(clampTargets(-1)).toBe(0);
    expect(clampTargets(50)).toBe(16);
    expect(clampTargets(6.2)).toBe(6);
  });
  it("limits clutter to 0-1", () => {
    expect(clampClutter(-1)).toBe(0);
    expect(clampClutter(3)).toBe(1);
  });
});

describe("assertions", () => {
  it("accepts css variable names and rejects anything else with the value", () => {
    expect(() => assertColorToken("--success")).not.toThrow();
    expect(() => assertColorToken("success")).toThrow(/"success"/);
  });
  it("accepts the two modes and rejects others with the value", () => {
    expect(() => assertMode("sweep")).not.toThrow();
    expect(() => assertMode("pulse")).not.toThrow();
    expect(() => assertMode("radar")).toThrow(/"radar".*"sweep" or "pulse"/);
  });
  it("maps modes to shader codes", () => {
    expect(modeCode("sweep")).toBe(0);
    expect(modeCode("pulse")).toBe(1);
  });
});

describe("sweepLag", () => {
  it("is zero on the beam", () => {
    expect(sweepLag(1, 1, 1)).toBe(0);
    expect(sweepLag(2, 2, -1)).toBe(0);
  });
  it("grows behind the beam in the rotation direction", () => {
    expect(sweepLag(0.5, 1, 1)).toBeCloseTo(0.5);
    expect(sweepLag(1.5, 1, -1)).toBeCloseTo(0.5);
    expect(sweepLag(0.2, 1, 1)).toBeGreaterThan(sweepLag(0.5, 1, 1));
  });
  it("wraps around and is never negative", () => {
    expect(sweepLag(1, 0.5, 1)).toBeCloseTo(TAU - 0.5);
    for (let a = -7; a < 7; a += 0.37) {
      for (const dir of [1, -1] as const) {
        const lag = sweepLag(a, 1.3, dir);
        expect(lag).toBeGreaterThanOrEqual(0);
        expect(lag).toBeLessThan(TAU);
      }
    }
  });
});

describe("stepToward and pointerTarget", () => {
  it("approaches the target and snaps when close", () => {
    expect(stepToward(0, 1, 0.5)).toBe(0.5);
    expect(stepToward(0.9999, 1, 0.1)).toBe(1);
  });
  it("normalizes the pointer with y up", () => {
    const rect = { left: 0, top: 0, width: 200, height: 100 };
    expect(pointerTarget(100, 25, rect)).toEqual({ x: 0.5, y: 0.75 });
    expect(pointerTarget(-50, 500, rect)).toEqual({ x: 0, y: 0 });
    expect(pointerTarget(1, 1, { ...rect, width: 0 })).toBeNull();
  });
});

describe("fallbackBackground", () => {
  it("builds a circular radar grid from the token", () => {
    const style = fallbackBackground("--success");
    expect(style.background).toContain("repeating-radial-gradient");
    expect(style.background).toContain("var(--success)");
    expect(style.clipPath).toContain("circle");
  });
});
