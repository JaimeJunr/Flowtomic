import { describe, expect, it } from "vitest";
import { AURORA_GLOW_FRAGMENT_SHADER } from "./aurora-glow-shader";
import { assertColorTokens, clampUnit, toColorUniform } from "./aurora-glow-utils";

const fallback = { r: 0.1, g: 0.2, b: 0.3, a: 1 };

describe("toColorUniform", () => {
  it("keeps order and values", () => {
    const result = toColorUniform(
      [
        { r: 1, g: 0, b: 0, a: 1 },
        { r: 0, g: 1, b: 0, a: 1 },
        { r: 0, g: 0, b: 1, a: 1 },
      ],
      fallback
    );
    expect(Array.from(result)).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  });
  it("uses the fallback for null", () => {
    const result = toColorUniform([null, { r: 1, g: 1, b: 1, a: 1 }, null], fallback);
    expect(result).toHaveLength(9);
    expect(result[0]).toBeCloseTo(0.1);
    expect(result[1]).toBeCloseTo(0.2);
    expect(result[2]).toBeCloseTo(0.3);
    expect(result[3]).toBe(1);
    expect(result[8]).toBeCloseTo(0.3);
  });
});

describe("assertColorTokens", () => {
  it("accepts css variable names", () => {
    expect(() => assertColorTokens(["--primary", "--info"])).not.toThrow();
  });
  it("reports the received value", () => {
    expect(() => assertColorTokens(["--primary", "primary"])).toThrow(/"primary".*--token-name/);
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

describe("AURORA_GLOW_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 declaring the expected uniforms and output", () => {
    expect(AURORA_GLOW_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColors[3]",
      "uAmplitude",
      "uBlend",
      "uIntensity",
      "uSpeed",
    ]) {
      expect(AURORA_GLOW_FRAGMENT_SHADER).toContain(name);
    }
    expect(AURORA_GLOW_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(AURORA_GLOW_FRAGMENT_SHADER).toMatch(/fragColor\s*=/);
  });
});
