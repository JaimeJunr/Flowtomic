import { describe, expect, it } from "vitest";
import {
  assertColorTokens,
  clampBend,
  clampCore,
  clampGlow,
  clampGrain,
  clampThickness,
  DEFAULT_BEND,
  DEFAULT_PLASMA_RIBBONS_COLORS,
  fallbackBackground,
  pointerTarget,
  stepToward,
  toColorUniform,
} from "./plasma-ribbons-utils";

describe("assertColorTokens", () => {
  it("accepts exactly two variable names", () => {
    expect(() => assertColorTokens(["--primary", "--info"])).not.toThrow();
    expect(DEFAULT_PLASMA_RIBBONS_COLORS).toEqual(["--primary", "--info"]);
    expect(DEFAULT_BEND).toEqual([1, 0.5]);
  });
  it("rejects a token without the dashes, naming the received value", () => {
    expect(() => assertColorTokens(["primary", "--info"])).toThrow(/"primary".*"--token-name"/);
  });
  it("rejects a list that does not have exactly two tokens", () => {
    expect(() => assertColorTokens(["--primary"])).toThrow(/\["--primary"\].*2 tokens/);
    expect(() => assertColorTokens(["--a", "--b", "--c"])).toThrow(/2 tokens/);
  });
});

describe("clamps", () => {
  it("limits bend to 0-2", () => {
    expect(clampBend(-1)).toBe(0);
    expect(clampBend(1.5)).toBe(1.5);
    expect(clampBend(9)).toBe(2);
  });
  it("limits thickness to 0.05-1", () => {
    expect(clampThickness(0)).toBe(0.05);
    expect(clampThickness(0.3)).toBe(0.3);
    expect(clampThickness(4)).toBe(1);
  });
  it("limits glow to 0-2", () => {
    expect(clampGlow(-3)).toBe(0);
    expect(clampGlow(7)).toBe(2);
  });
  it("limits core to 0-1", () => {
    expect(clampCore(-1)).toBe(0);
    expect(clampCore(2)).toBe(1);
  });
  it("limits grain to 0-1", () => {
    expect(clampGrain(-1)).toBe(0);
    expect(clampGrain(4)).toBe(1);
    expect(clampGrain(0.25)).toBe(0.25);
  });
});

describe("toColorUniform", () => {
  it("packs two colors and uses the fallback for a missing one", () => {
    const result = toColorUniform([{ r: 1, g: 0.5, b: 0, a: 1 }, null], {
      r: 0.1,
      g: 0.2,
      b: 0.3,
      a: 1,
    });
    expect(Array.from(result).map((n) => Number(n.toFixed(2)))).toEqual([1, 0.5, 0, 0.1, 0.2, 0.3]);
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
  it("builds the two-band gradient from both tokens", () => {
    const { background } = fallbackBackground("--primary", "--info");
    expect(background).toContain("linear-gradient(170deg, transparent 35%");
    expect(background).toContain("color-mix(in oklch, var(--primary) 40%, transparent) 45%");
    expect(background).toContain("color-mix(in oklch, var(--info) 40%, transparent) 55%");
  });
});
