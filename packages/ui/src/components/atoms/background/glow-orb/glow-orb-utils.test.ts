import { describe, expect, it } from "vitest";
import {
  angleDelta,
  assertColorTokens,
  clampGlow,
  clampHighlight,
  clampSize,
  clampTrail,
  clampWobble,
  DEFAULT_GLOW_ORB_COLORS,
  fallbackBackground,
  pointerTarget,
  stepToward,
  toColorUniform,
} from "./glow-orb-utils";

describe("assertColorTokens", () => {
  it("accepts exactly three variable names", () => {
    expect(() => assertColorTokens(["--primary", "--info", "--primary"])).not.toThrow();
    expect(DEFAULT_GLOW_ORB_COLORS).toEqual(["--primary", "--info", "--primary"]);
  });
  it("rejects a token without the dashes, naming the received value", () => {
    expect(() => assertColorTokens(["primary", "--info", "--primary"])).toThrow(
      /"primary".*"--token-name"/
    );
  });
  it("rejects a list that does not have exactly three tokens", () => {
    expect(() => assertColorTokens(["--primary", "--info"])).toThrow(
      /\["--primary","--info"\].*3 tokens/
    );
    expect(() => assertColorTokens(["--a", "--b", "--c", "--d"])).toThrow(/3 tokens/);
  });
});

describe("clamps", () => {
  it("limits size to 0.2-1.5", () => {
    expect(clampSize(0)).toBe(0.2);
    expect(clampSize(1)).toBe(1);
    expect(clampSize(4)).toBe(1.5);
  });
  it("limits glow to 0-2", () => {
    expect(clampGlow(-1)).toBe(0);
    expect(clampGlow(1.2)).toBe(1.2);
    expect(clampGlow(9)).toBe(2);
  });
  it("limits wobble to 0-2", () => {
    expect(clampWobble(-1)).toBe(0);
    expect(clampWobble(9)).toBe(2);
  });
  it("limits highlight to 0-2", () => {
    expect(clampHighlight(-3)).toBe(0);
    expect(clampHighlight(0.5)).toBe(0.5);
    expect(clampHighlight(7)).toBe(2);
  });
  it("limits trail to 0-2", () => {
    expect(clampTrail(-0.1)).toBe(0);
    expect(clampTrail(5)).toBe(2);
  });
});

describe("angleDelta", () => {
  it("returns the signed shortest difference in -PI..PI", () => {
    expect(angleDelta(1, 1)).toBe(0);
    expect(angleDelta(0.5, 0.25)).toBeCloseTo(0.25, 10);
    expect(angleDelta(0, Math.PI / 2)).toBeCloseTo(-Math.PI / 2, 10);
  });
  it("wraps across the seam instead of going the long way", () => {
    expect(angleDelta(3, -3)).toBeCloseTo(6 - 2 * Math.PI, 10);
    expect(angleDelta(-3, 3)).toBeCloseTo(2 * Math.PI - 6, 10);
    expect(angleDelta(10 * Math.PI + 0.1, 0)).toBeCloseTo(0.1, 10);
  });
  it("stays inside the interval for any input", () => {
    for (const a of [-20, -3.2, 0, 3.2, 20]) {
      for (const b of [-7, -1, 0, 1, 7]) {
        const d = angleDelta(a, b);
        expect(d).toBeGreaterThanOrEqual(-Math.PI);
        expect(d).toBeLessThan(Math.PI + 1e-12);
      }
    }
  });
});

describe("toColorUniform", () => {
  it("packs three colors and uses the fallback for a missing one", () => {
    const result = toColorUniform(
      [{ r: 1, g: 0.5, b: 0, a: 1 }, null, { r: 0, g: 0, b: 1, a: 1 }],
      { r: 0.1, g: 0.2, b: 0.3, a: 1 }
    );
    expect(Array.from(result).map((n) => Number(n.toFixed(2)))).toEqual([
      1, 0.5, 0, 0.1, 0.2, 0.3, 0, 0, 1,
    ]);
  });
});

describe("pointerTarget", () => {
  const rect = { left: 10, top: 20, width: 200, height: 100 };
  it("normalizes to 0-1 with y pointing up", () => {
    expect(pointerTarget(110, 45, rect)).toEqual({ x: 0.5, y: 0.75 });
  });
  it("clamps outside the box and ignores an empty box", () => {
    expect(pointerTarget(-500, 900, rect)).toEqual({ x: 0, y: 0 });
    expect(pointerTarget(1, 1, { ...rect, height: 0 })).toBeNull();
  });
});

describe("stepToward", () => {
  it("moves a fraction and snaps when close", () => {
    expect(stepToward(0, 1, 0.5)).toBe(0.5);
    expect(stepToward(0.9999, 1, 0.15)).toBe(1);
  });
});

describe("fallbackBackground", () => {
  it("builds the ring gradient from the first token", () => {
    const { background } = fallbackBackground("--primary");
    expect(background).toContain("radial-gradient(circle, transparent 30%");
    expect(background).toContain("color-mix(in oklch, var(--primary) 50%, transparent) 34%");
    expect(background).toContain("transparent 42%)");
  });
});
