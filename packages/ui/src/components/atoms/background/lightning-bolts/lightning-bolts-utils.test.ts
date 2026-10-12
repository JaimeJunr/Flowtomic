import { describe, expect, it } from "vitest";
import {
  assertColorToken,
  clampBranches,
  clampFlicker,
  clampGlow,
  clampSpread,
  clampThickness,
  DEFAULT_LIGHTNING_BOLTS_COLOR,
  deviceScale,
  fallbackBackground,
  pointerTarget,
  resolveBolts,
  stepToward,
  toColorUniform,
} from "./lightning-bolts-utils";

describe("assertColorToken", () => {
  it("accepts a variable name", () => {
    expect(() => assertColorToken("--info")).not.toThrow();
    expect(DEFAULT_LIGHTNING_BOLTS_COLOR).toBe("--info");
  });
  it("rejects a token without the dashes, naming the received value", () => {
    expect(() => assertColorToken("info")).toThrow(/"info".*"--token-name"/);
  });
});

describe("resolveBolts", () => {
  it("accepts integers from 1 to 4", () => {
    for (const value of [1, 2, 3, 4]) expect(resolveBolts(value)).toBe(value);
  });
  it("rejects non-integers and out-of-range values with the received value", () => {
    expect(() => resolveBolts(0)).toThrow(/0.*1 to 4/);
    expect(() => resolveBolts(5)).toThrow(/5/);
    expect(() => resolveBolts(1.5)).toThrow(/1\.5/);
    expect(() => resolveBolts(Number.NaN)).toThrow(/NaN/);
  });
});

describe("clamps", () => {
  it("limits spread to 0-1", () => {
    expect(clampSpread(-1)).toBe(0);
    expect(clampSpread(0.6)).toBe(0.6);
    expect(clampSpread(3)).toBe(1);
  });
  it("limits branches to 0-1", () => {
    expect(clampBranches(-1)).toBe(0);
    expect(clampBranches(0.5)).toBe(0.5);
    expect(clampBranches(2)).toBe(1);
  });
  it("limits thickness to 0.3-3", () => {
    expect(clampThickness(0)).toBe(0.3);
    expect(clampThickness(1)).toBe(1);
    expect(clampThickness(9)).toBe(3);
  });
  it("limits glow to 0-2", () => {
    expect(clampGlow(-1)).toBe(0);
    expect(clampGlow(1.2)).toBe(1.2);
    expect(clampGlow(5)).toBe(2);
  });
  it("limits flicker to 0-1", () => {
    expect(clampFlicker(-1)).toBe(0);
    expect(clampFlicker(0.6)).toBe(0.6);
    expect(clampFlicker(4)).toBe(1);
  });
});

describe("toColorUniform", () => {
  it("returns r, g, b of the color", () => {
    const result = toColorUniform({ r: 0.1, g: 0.2, b: 0.3, a: 1 }, { r: 0, g: 0, b: 0, a: 1 });
    expect(Array.from(result).map((n) => Number(n.toFixed(2)))).toEqual([0.1, 0.2, 0.3]);
  });
  it("uses the fallback when the color is missing", () => {
    const result = toColorUniform(null, { r: 1, g: 0.5, b: 0, a: 1 });
    expect(Array.from(result)).toEqual([1, 0.5, 0]);
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
  it("normalizes to 0-1 with y pointing up", () => {
    expect(pointerTarget(110, 70, rect)).toEqual({ x: 0.5, y: 0.5 });
    expect(pointerTarget(10, 20, rect)).toEqual({ x: 0, y: 1 });
  });
  it("clamps outside the box and ignores an empty box", () => {
    expect(pointerTarget(900, 900, rect)).toEqual({ x: 1, y: 0 });
    expect(pointerTarget(1, 1, { ...rect, width: 0 })).toBeNull();
  });
});

describe("deviceScale", () => {
  it("is the ratio between canvas pixels and css pixels", () => {
    expect(deviceScale(2000, 1000, 1)).toBe(2);
  });
  it("falls back to the device ratio when the canvas has no css width", () => {
    expect(deviceScale(1000, 0, 1.5)).toBe(1.5);
  });
});

describe("fallbackBackground", () => {
  it("draws a narrow column at the center using the token", () => {
    const style = fallbackBackground("--info");
    expect(style.backgroundImage).toContain("var(--info)");
    expect(style.backgroundImage).toContain("to bottom");
    expect(style.backgroundSize).toBe("2px 100%");
    expect(style.backgroundRepeat).toBe("no-repeat");
    expect(style.backgroundPosition).toBe("center");
  });
});
