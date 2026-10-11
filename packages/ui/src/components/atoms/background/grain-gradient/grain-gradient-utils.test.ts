import { describe, expect, it } from "vitest";
import { GRAIN_GRADIENT_FRAGMENT_SHADER } from "./grain-gradient-shader";
import {
  assertColorTokens,
  clampRange,
  clampUnit,
  DEFAULT_GRAIN_COLORS,
  toColorUniform,
} from "./grain-gradient-utils";

const fallback = { r: 0.1, g: 0.2, b: 0.3, a: 1 };

describe("toColorUniform", () => {
  it("keeps order and uses the fallback for null", () => {
    const result = toColorUniform([{ r: 1, g: 0, b: 0, a: 1 }, null, null], fallback);
    expect(result).toHaveLength(9);
    expect(result[0]).toBe(1);
    expect(result[3]).toBeCloseTo(0.1);
    expect(result[8]).toBeCloseTo(0.3);
  });
});

describe("assertColorTokens", () => {
  it("accepts exactly three css variable names", () => {
    expect(() => assertColorTokens(DEFAULT_GRAIN_COLORS)).not.toThrow();
  });
  it("throws for a different amount, reporting the received count", () => {
    expect(() => assertColorTokens(["--primary", "--info"])).toThrow(/2.*3/);
    expect(() => assertColorTokens(["--a", "--b", "--c", "--d"])).toThrow(/4.*3/);
  });
  it("reports the received value of an invalid token", () => {
    expect(() => assertColorTokens(["--primary", "info", "--warning"])).toThrow(
      /"info".*--token-name/
    );
  });
});

describe("clampUnit and clampRange", () => {
  it.each([
    [-1, 0],
    [0.4, 0.4],
    [3, 1],
  ])("clampUnit(%s) = %s", (input, expected) => {
    expect(clampUnit(input)).toBe(expected);
  });
  it("limits contrast to 0.5-2 and warp to 0-2", () => {
    expect(clampRange(0, 0.5, 2)).toBe(0.5);
    expect(clampRange(5, 0.5, 2)).toBe(2);
    expect(clampRange(1.2, 0.5, 2)).toBe(1.2);
    expect(clampRange(-1, 0, 2)).toBe(0);
    expect(clampRange(3, 0, 2)).toBe(2);
  });
});

describe("GRAIN_GRADIENT_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 declaring the expected uniforms and an opaque output", () => {
    expect(GRAIN_GRADIENT_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColors[3]",
      "uSpeed",
      "uWarp",
      "uSoftness",
      "uContrast",
      "uGrain",
      "uZoom",
    ]) {
      expect(GRAIN_GRADIENT_FRAGMENT_SHADER).toContain(name);
    }
    expect(GRAIN_GRADIENT_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(GRAIN_GRADIENT_FRAGMENT_SHADER).toMatch(/fragColor\s*=\s*vec4\([^;]*1\.0\)/);
  });
});
