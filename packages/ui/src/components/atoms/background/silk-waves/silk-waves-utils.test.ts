import { describe, expect, it } from "vitest";
import { SILK_WAVES_FRAGMENT_SHADER } from "./silk-waves-shader";
import { assertColorToken, clampUnit, toColorUniform, toRadians } from "./silk-waves-utils";

const fallback = { r: 0.1, g: 0.2, b: 0.3, a: 1 };

describe("toRadians", () => {
  it.each([
    [0, 0],
    [180, Math.PI],
    [-30, -Math.PI / 6],
    [90, Math.PI / 2],
  ])("converts %s degrees", (degrees, expected) => {
    expect(toRadians(degrees)).toBeCloseTo(expected);
  });
});

describe("toColorUniform", () => {
  it("keeps the channels", () => {
    expect(Array.from(toColorUniform({ r: 1, g: 0, b: 0.5, a: 1 }, fallback))).toEqual([1, 0, 0.5]);
  });
  it("uses the fallback for null", () => {
    const result = toColorUniform(null, fallback);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeCloseTo(0.1);
    expect(result[2]).toBeCloseTo(0.3);
  });
});

describe("assertColorToken", () => {
  it("accepts a css variable name", () => {
    expect(() => assertColorToken("--primary")).not.toThrow();
  });
  it("reports the received value", () => {
    expect(() => assertColorToken("primary")).toThrow(/"primary".*--token-name/);
  });
});

describe("clampUnit", () => {
  it.each([
    [-1, 0],
    [0.4, 0.4],
    [3, 1],
  ])("clamps %s to %s", (input, expected) => {
    expect(clampUnit(input)).toBe(expected);
  });
});

describe("SILK_WAVES_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 declaring the expected uniforms and output", () => {
    expect(SILK_WAVES_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColor",
      "uSpeed",
      "uScale",
      "uRotation",
      "uGrain",
    ]) {
      expect(SILK_WAVES_FRAGMENT_SHADER).toContain(name);
    }
    expect(SILK_WAVES_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(SILK_WAVES_FRAGMENT_SHADER).toMatch(/fragColor\s*=/);
  });
});
