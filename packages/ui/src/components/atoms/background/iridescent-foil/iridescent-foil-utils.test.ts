import { describe, expect, it } from "vitest";
import { IRIDESCENT_FOIL_FRAGMENT_SHADER } from "./iridescent-foil-shader";
import {
  assertTintToken,
  clampDetail,
  clampUnit,
  isDarkBackground,
  lerp,
  relativeLuminance,
} from "./iridescent-foil-utils";

describe("clampDetail", () => {
  it.each([
    [0, 2],
    [1.4, 2],
    [2, 2],
    [4.4, 4],
    [4.6, 5],
    [8, 8],
    [20, 8],
    [Number.NaN, 5],
  ])("clamps %s to the integer %s", (input, expected) => {
    expect(clampDetail(input)).toBe(expected);
  });
});

describe("clampUnit", () => {
  it.each([
    [-1, 0],
    [0.6, 0.6],
    [3, 1],
  ])("clamps %s to %s", (input, expected) => {
    expect(clampUnit(input)).toBe(expected);
  });
});

describe("assertTintToken", () => {
  it("accepts css variable names and undefined", () => {
    expect(() => assertTintToken("--primary")).not.toThrow();
    expect(() => assertTintToken(undefined)).not.toThrow();
  });
  it("reports the received value", () => {
    expect(() => assertTintToken("primary")).toThrow(/"primary".*--token-name/);
  });
});

describe("lerp", () => {
  it("moves a fraction toward the target", () => {
    expect(lerp(0, 10, 0.25)).toBe(2.5);
    expect(lerp(4, 4, 0.5)).toBe(4);
  });
});

describe("relativeLuminance / isDarkBackground", () => {
  it("measures black and white", () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0, a: 1 })).toBe(0);
    expect(relativeLuminance({ r: 1, g: 1, b: 1, a: 1 })).toBeCloseTo(1);
  });
  it("flags dark backgrounds only below 0.5", () => {
    expect(isDarkBackground({ r: 0.1, g: 0.1, b: 0.1, a: 1 })).toBe(true);
    expect(isDarkBackground({ r: 0.9, g: 0.9, b: 0.9, a: 1 })).toBe(false);
    expect(isDarkBackground(null)).toBe(false);
  });
});

describe("IRIDESCENT_FOIL_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 declaring the expected uniforms and output", () => {
    expect(IRIDESCENT_FOIL_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uTint",
      "uSpeed",
      "uScale",
      "uDetail",
      "uSaturation",
      "uPointer",
      "uPointerStrength",
      "uDark",
    ]) {
      expect(IRIDESCENT_FOIL_FRAGMENT_SHADER).toContain(name);
    }
    expect(IRIDESCENT_FOIL_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(IRIDESCENT_FOIL_FRAGMENT_SHADER).toMatch(/fragColor\s*=/);
    expect(IRIDESCENT_FOIL_FRAGMENT_SHADER).toContain("float(i) >= uDetail");
  });
});
