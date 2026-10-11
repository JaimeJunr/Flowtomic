import { describe, expect, it } from "vitest";
import { SATIN_PLASMA_FRAGMENT_SHADER } from "./satin-plasma-shader";
import {
  assertColorToken,
  clampUnit,
  lerp,
  pointerToUnit,
  toColorUniform,
} from "./satin-plasma-utils";

const fallback = { r: 0.1, g: 0.2, b: 0.3, a: 1 };

describe("toColorUniform", () => {
  it("converts a color to 3 numbers", () => {
    expect(Array.from(toColorUniform({ r: 1, g: 0, b: 0.5, a: 1 }, fallback))).toEqual([1, 0, 0.5]);
  });
  it("uses the fallback for null", () => {
    const result = toColorUniform(null, fallback);
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

describe("lerp", () => {
  it("interpolates", () => {
    expect(lerp(0, 10, 0.25)).toBe(2.5);
  });
});

describe("pointerToUnit", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  it("normalizes to 0-1 with y pointing up", () => {
    expect(pointerToUnit(200, 75, rect)).toEqual([0.5, 0.75]);
  });
  it("clamps outside the rect", () => {
    expect(pointerToUnit(0, 500, rect)).toEqual([0, 0]);
  });
  it("returns the center for an empty rect", () => {
    expect(pointerToUnit(1, 1, { left: 0, top: 0, width: 0, height: 0 })).toEqual([0.5, 0.5]);
  });
});

describe("SATIN_PLASMA_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 declaring the expected uniforms and output", () => {
    expect(SATIN_PLASMA_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColor",
      "uSpeed",
      "uTwist",
      "uSoftness",
      "uShine",
      "uFade",
      "uPointer",
      "uPointerOn",
      "uReveal",
    ]) {
      expect(SATIN_PLASMA_FRAGMENT_SHADER).toContain(name);
    }
    expect(SATIN_PLASMA_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(SATIN_PLASMA_FRAGMENT_SHADER).toMatch(/fragColor\s*=/);
  });
});
