import { describe, expect, it } from "vitest";
import {
  assertColorTokens,
  clampDensity,
  clampFlare,
  clampStarSize,
  clampTravel,
  clampTwinkle,
  DEFAULT_STAR_WARP_COLORS,
  fallbackBackground,
  pointerTarget,
  resolveLayers,
  stepToward,
  toColorUniform,
} from "./star-warp-utils";

describe("assertColorTokens", () => {
  it("accepts 1 to 4 variable names", () => {
    expect(() => assertColorTokens(["--primary"])).not.toThrow();
    expect(() => assertColorTokens(["--a", "--b", "--c", "--d"])).not.toThrow();
    expect(DEFAULT_STAR_WARP_COLORS).toEqual(["--foreground", "--info", "--primary"]);
  });
  it("rejects an empty list and more than 4, naming the received count", () => {
    expect(() => assertColorTokens([])).toThrow(/0.*1 to 4/);
    expect(() => assertColorTokens(["--a", "--b", "--c", "--d", "--e"])).toThrow(/5.*1 to 4/);
  });
  it("rejects a token without the dashes, naming the received value", () => {
    expect(() => assertColorTokens(["primary"])).toThrow(/"primary".*"--token-name"/);
  });
});

describe("resolveLayers", () => {
  it("accepts integers from 2 to 8", () => {
    for (const value of [2, 3, 4, 5, 6, 7, 8]) expect(resolveLayers(value)).toBe(value);
  });
  it("rejects non-integers and out-of-range values with the received value", () => {
    expect(() => resolveLayers(1)).toThrow(/1.*2 to 8/);
    expect(() => resolveLayers(9)).toThrow(/9/);
    expect(() => resolveLayers(3.5)).toThrow(/3\.5/);
    expect(() => resolveLayers(Number.NaN)).toThrow(/NaN/);
  });
});

describe("clamps", () => {
  it("limits each prop to its range", () => {
    expect(clampDensity(0)).toBe(0.3);
    expect(clampDensity(9)).toBe(3);
    expect(clampDensity(1.5)).toBe(1.5);
    expect(clampStarSize(0)).toBe(0.3);
    expect(clampStarSize(9)).toBe(3);
    expect(clampFlare(-1)).toBe(0);
    expect(clampFlare(5)).toBe(2);
    expect(clampTwinkle(-1)).toBe(0);
    expect(clampTwinkle(5)).toBe(1);
    expect(clampTravel(-9)).toBe(-2);
    expect(clampTravel(9)).toBe(2);
    expect(clampTravel(-0.5)).toBe(-0.5);
  });
});

describe("toColorUniform", () => {
  const fallback = { r: 1, g: 1, b: 1, a: 1 };
  it("fills 4 slots, repeating the last color", () => {
    const result = toColorUniform([{ r: 0.1, g: 0.2, b: 0.3, a: 1 }], fallback);
    expect(result).toHaveLength(12);
    expect(result[0]).toBeCloseTo(0.1);
    expect(result[9]).toBeCloseTo(0.1);
    expect(result[11]).toBeCloseTo(0.3);
  });
  it("uses the fallback for a missing color", () => {
    const result = toColorUniform([null, { r: 0, g: 0, b: 0, a: 1 }], fallback);
    expect(Array.from(result.slice(0, 3))).toEqual([1, 1, 1]);
    expect(Array.from(result.slice(3, 6))).toEqual([0, 0, 0]);
  });
});

describe("stepToward", () => {
  it("moves a fraction of the way and snaps when close", () => {
    expect(stepToward(0, 1, 0.5)).toBe(0.5);
    expect(stepToward(0.9999, 1, 0.15)).toBe(1);
  });
});

describe("pointerTarget", () => {
  const rect = { left: 10, top: 20, width: 200, height: 100 };
  it("normalizes with y flipped", () => {
    expect(pointerTarget(110, 70, rect)).toEqual({ x: 0.5, y: 0.5 });
    expect(pointerTarget(10, 20, rect)).toEqual({ x: 0, y: 1 });
  });
  it("clamps and returns null for an empty box", () => {
    expect(pointerTarget(999, 999, rect)).toEqual({ x: 1, y: 0 });
    expect(pointerTarget(1, 1, { ...rect, width: 0 })).toBeNull();
  });
});

describe("fallbackBackground", () => {
  it("draws two 1px dot layers of different sizes with the token", () => {
    const { background, backgroundSize } = fallbackBackground("--info");
    expect(background.match(/radial-gradient/g)).toHaveLength(2);
    expect(background).toContain("var(--info)");
    expect(backgroundSize).toBe("50px 50px, 73px 73px");
  });
});
