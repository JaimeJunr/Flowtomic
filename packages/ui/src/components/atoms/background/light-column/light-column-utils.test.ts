import { describe, expect, it } from "vitest";
import {
  assertColorTokens,
  clampGrain,
  clampIntensity,
  clampTwist,
  clampWidth,
  DEFAULT_LIGHT_COLUMN_COLORS,
  fallbackBackground,
  pointerTarget,
  resolveDetail,
  stepToward,
  toColorUniform,
} from "./light-column-utils";

describe("assertColorTokens", () => {
  it("accepts exactly two variable names", () => {
    expect(() => assertColorTokens(["--primary", "--warning"])).not.toThrow();
    expect(DEFAULT_LIGHT_COLUMN_COLORS).toEqual(["--primary", "--warning"]);
  });
  it("rejects a token without the dashes, naming the received value", () => {
    expect(() => assertColorTokens(["primary", "--warning"])).toThrow(/"primary".*"--token-name"/);
  });
  it("rejects a list that does not have exactly two tokens", () => {
    expect(() => assertColorTokens(["--primary"])).toThrow(/\["--primary"\].*2 tokens/);
    expect(() => assertColorTokens(["--a", "--b", "--c"])).toThrow(/2 tokens/);
  });
});

describe("resolveDetail", () => {
  it("accepts integers from 1 to 6", () => {
    for (const value of [1, 2, 3, 4, 5, 6]) expect(resolveDetail(value)).toBe(value);
  });
  it("rejects non-integers and out-of-range values with the received value", () => {
    expect(() => resolveDetail(0)).toThrow(/0.*1 to 6/);
    expect(() => resolveDetail(7)).toThrow(/7/);
    expect(() => resolveDetail(2.5)).toThrow(/2\.5/);
    expect(() => resolveDetail(Number.NaN)).toThrow(/NaN/);
  });
});

describe("clamps", () => {
  it("limits intensity to 0-2", () => {
    expect(clampIntensity(-1)).toBe(0);
    expect(clampIntensity(1.3)).toBe(1.3);
    expect(clampIntensity(5)).toBe(2);
  });
  it("limits width to 0.1-1", () => {
    expect(clampWidth(0)).toBe(0.1);
    expect(clampWidth(0.5)).toBe(0.5);
    expect(clampWidth(3)).toBe(1);
  });
  it("limits twist to 0-2", () => {
    expect(clampTwist(-0.2)).toBe(0);
    expect(clampTwist(9)).toBe(2);
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
    expect(pointerTarget(1, 1, { ...rect, width: 0 })).toBeNull();
  });
});

describe("stepToward", () => {
  it("moves a fraction and snaps when close", () => {
    expect(stepToward(0, 1, 0.5)).toBe(0.5);
    expect(stepToward(0.9999, 1, 0.15)).toBe(1);
  });
});

describe("fallbackBackground", () => {
  it("builds the tilted gradient from the first token", () => {
    const { background } = fallbackBackground("--primary");
    expect(background).toContain("linear-gradient(115deg");
    expect(background).toContain("color-mix(in oklch, var(--primary) 45%, transparent)");
  });
});
