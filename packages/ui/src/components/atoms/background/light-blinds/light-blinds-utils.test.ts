import { describe, expect, it } from "vitest";
import { LIGHT_BLINDS_FRAGMENT_SHADER } from "./light-blinds-shader";
import {
  assertColorTokens,
  clampBlindCount,
  clampNoise,
  clampSoftness,
  clampSpotlightRadius,
  effectiveBlindCount,
  expandTokens,
  fallbackBackground,
  stepToward,
  toColorUniform,
} from "./light-blinds-utils";

const fallback = { r: 0.1, g: 0.2, b: 0.3, a: 1 };

describe("effectiveBlindCount", () => {
  it.each([
    [1000, 16, 60, 16],
    [300, 16, 60, 5],
    [100, 16, 60, 1],
    [10, 16, 60, 1],
    [0, 16, 60, 1],
    [1000, 4, 60, 4],
    [600, 64, 10, 60],
  ])("width %s, count %s, min %s gives %s", (width, count, min, expected) => {
    expect(effectiveBlindCount(width, count, min)).toBe(expected);
  });
});

describe("assertColorTokens", () => {
  it("accepts from 1 to 8 tokens", () => {
    expect(() => assertColorTokens(["--primary"])).not.toThrow();
    expect(() => assertColorTokens(Array.from({ length: 8 }, () => "--info"))).not.toThrow();
  });
  it("throws for an empty list with the received count", () => {
    expect(() => assertColorTokens([])).toThrow(/0 color tokens.*1 to 8/);
  });
  it("throws for more than 8 tokens with the received count", () => {
    expect(() => assertColorTokens(Array.from({ length: 9 }, () => "--info"))).toThrow(
      /9 color tokens.*1 to 8/
    );
  });
  it("reports an invalid token value", () => {
    expect(() => assertColorTokens(["--primary", "primary"])).toThrow(/"primary".*--token-name/);
  });
});

describe("expandTokens", () => {
  it("repeats a single token", () => {
    expect(expandTokens(["--primary"])).toEqual(["--primary", "--primary"]);
  });
  it("keeps two or more tokens", () => {
    expect(expandTokens(["--primary", "--info", "--warning"])).toEqual([
      "--primary",
      "--info",
      "--warning",
    ]);
  });
});

describe("toColorUniform", () => {
  it("fills 8 colors keeping order and padding with the last", () => {
    const result = toColorUniform(
      [
        { r: 1, g: 0, b: 0, a: 1 },
        { r: 0, g: 1, b: 0, a: 1 },
      ],
      fallback
    );
    expect(result).toHaveLength(24);
    expect(Array.from(result.slice(0, 6))).toEqual([1, 0, 0, 0, 1, 0]);
    expect(Array.from(result.slice(21, 24))).toEqual([0, 1, 0]);
  });
  it("uses the fallback for null", () => {
    const result = toColorUniform([null, null], fallback);
    expect(result[0]).toBeCloseTo(0.1);
    expect(result[4]).toBeCloseTo(0.2);
  });
});

describe("clamps", () => {
  it.each([
    [1, 2],
    [100, 64],
    [7.6, 8],
  ])("blindCount %s becomes %s", (input, expected) => {
    expect(clampBlindCount(input)).toBe(expected);
  });
  it.each([
    [0, 0.1],
    [3, 1.5],
    [0.5, 0.5],
  ])("spotlightRadius %s becomes %s", (input, expected) => {
    expect(clampSpotlightRadius(input)).toBe(expected);
  });
  it.each([
    [0, 0.2],
    [9, 4],
    [1, 1],
  ])("spotlightSoftness %s becomes %s", (input, expected) => {
    expect(clampSoftness(input)).toBe(expected);
  });
  it.each([
    [-1, 0],
    [2, 1],
    [0.3, 0.3],
  ])("noise %s becomes %s", (input, expected) => {
    expect(clampNoise(input)).toBe(expected);
  });
});

describe("stepToward", () => {
  it("moves a fraction toward the target", () => {
    expect(stepToward(0, 1, 0.5)).toBe(0.5);
  });
  it("snaps when very close", () => {
    expect(stepToward(0.9999, 1, 0.1)).toBe(1);
  });
});

describe("fallbackBackground", () => {
  it("uses the token in stripes", () => {
    const css = fallbackBackground("--primary");
    expect(css).toContain("repeating-linear-gradient(90deg");
    expect(css).toContain("var(--primary)");
    expect(css).toContain("30px");
  });
});

describe("LIGHT_BLINDS_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 declaring the expected uniforms and output", () => {
    const shader = LIGHT_BLINDS_FRAGMENT_SHADER;
    expect(shader.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColors[8]",
      "uColorCount",
      "uAngle",
      "uBlinds",
      "uRadius",
      "uSoftness",
      "uShine",
      "uNoise",
      "uSpeed",
      "uPointer",
    ]) {
      expect(shader).toContain(name);
    }
    expect(shader).toContain("out vec4 fragColor");
    expect(shader).toMatch(/fragColor\s*=\s*vec4\(/);
  });
});
