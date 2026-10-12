import { describe, expect, it } from "vitest";
import { SPECTRAL_BURST_FRAGMENT_SHADER } from "./spectral-burst-shader";
import {
  assertColorTokens,
  assertMotion,
  clampCenter,
  clampDistort,
  clampIntensity,
  normalizeRayCount,
  toColorUniform,
} from "./spectral-burst-utils";

const fallback = { r: 0.1, g: 0.2, b: 0.3, a: 1 };

describe("toColorUniform", () => {
  it("converts two colors to 6 numbers", () => {
    const result = toColorUniform(
      [
        { r: 1, g: 0, b: 0.5, a: 1 },
        { r: 0, g: 1, b: 0, a: 1 },
      ],
      fallback
    );
    expect(Array.from(result)).toEqual([1, 0, 0.5, 0, 1, 0]);
  });
  it("uses the fallback for null", () => {
    const result = toColorUniform([null, null], fallback);
    expect(result).toHaveLength(6);
    expect(result[3]).toBeCloseTo(0.1);
    expect(result[5]).toBeCloseTo(0.3);
  });
});

describe("assertColorTokens", () => {
  it("accepts exactly two css variable names", () => {
    expect(() => assertColorTokens(["--primary", "--info"])).not.toThrow();
  });
  it("reports an invalid token with the received value", () => {
    expect(() => assertColorTokens(["primary", "--info"])).toThrow(/"primary".*--token-name/);
  });
  it("reports a wrong count with the received value", () => {
    expect(() => assertColorTokens(["--primary"] as unknown as [string, string])).toThrow(
      /\["--primary"\].*two/
    );
    expect(() => assertColorTokens(["--a", "--b", "--c"] as unknown as [string, string])).toThrow(
      /two/
    );
  });
});

describe("assertMotion", () => {
  it("accepts spin and sway", () => {
    expect(() => assertMotion("spin")).not.toThrow();
    expect(() => assertMotion("sway")).not.toThrow();
  });
  it("throws with the received value and the expected ones", () => {
    expect(() => assertMotion("orbit")).toThrow(/"orbit".*"spin".*"sway"/);
  });
});

describe("clamps", () => {
  it.each([
    [-1, 0],
    [1.5, 1.5],
    [9, 4],
  ])("clampIntensity %s -> %s", (input, expected) => {
    expect(clampIntensity(input)).toBe(expected);
  });
  it.each([
    [-1, 0],
    [0.5, 0.5],
    [5, 2],
  ])("clampDistort %s -> %s", (input, expected) => {
    expect(clampDistort(input)).toBe(expected);
  });
  it.each([
    [0, 0],
    [-3, 0],
    [2, 4],
    [4, 4],
    [12.4, 12],
    [64, 64],
    [200, 64],
  ])("normalizeRayCount %s -> %s", (input, expected) => {
    expect(normalizeRayCount(input)).toBe(expected);
  });
  it("clamps each center axis to -0.5..0.5", () => {
    expect(clampCenter({ x: 2, y: -2 })).toEqual([0.5, -0.5]);
    expect(clampCenter({ x: 0.2, y: -0.1 })).toEqual([0.2, -0.1]);
  });
});

describe("shader", () => {
  it("is GLSL ES 3.00 with premultiplied output and declared uniforms", () => {
    expect(SPECTRAL_BURST_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    expect(SPECTRAL_BURST_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    for (const name of [
      "uTime",
      "uResolution",
      "uColors",
      "uSpeed",
      "uIntensity",
      "uSway",
      "uDistort",
      "uRayCount",
      "uCenter",
    ]) {
      expect(SPECTRAL_BURST_FRAGMENT_SHADER).toContain(`uniform`);
      expect(SPECTRAL_BURST_FRAGMENT_SHADER).toMatch(new RegExp(`uniform [a-z0-9\\[\\]]+ ${name}`));
    }
  });
});
