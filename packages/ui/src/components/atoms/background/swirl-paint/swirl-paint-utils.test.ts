import { describe, expect, it } from "vitest";
import { SWIRL_PAINT_FRAGMENT_SHADER } from "./swirl-paint-shader";
import {
  assertColorTokens,
  clampContrast,
  clampPixelSize,
  clampSpin,
  lerp,
  pointerToUnit,
  toColorUniform,
} from "./swirl-paint-utils";

const fallback = { r: 0.1, g: 0.2, b: 0.3, a: 1 };

describe("toColorUniform", () => {
  it("packs three colors into 9 numbers", () => {
    const result = toColorUniform(
      [{ r: 1, g: 0, b: 0, a: 1 }, { r: 0, g: 1, b: 0, a: 1 }, null],
      fallback
    );
    expect(result).toHaveLength(9);
    expect(result[0]).toBe(1);
    expect(result[4]).toBe(1);
    expect(result[6]).toBeCloseTo(0.1);
  });
});

describe("assertColorTokens", () => {
  it("accepts exactly three css variable names", () => {
    expect(() => assertColorTokens(["--a", "--b", "--c"])).not.toThrow();
  });
  it("rejects a wrong count with the received value", () => {
    expect(() => assertColorTokens(["--a", "--b"])).toThrow(/Received 2.*expected 3/);
  });
  it("rejects a token without the dashes", () => {
    expect(() => assertColorTokens(["--a", "primary", "--c"])).toThrow(/"primary".*--token-name/);
  });
});

describe("clamps", () => {
  it.each([
    [-9, -3],
    [0.5, 0.5],
    [9, 3],
  ])("clampSpin %s -> %s", (input, expected) => {
    expect(clampSpin(input)).toBe(expected);
  });
  it.each([
    [0, 0.5],
    [2, 2],
    [10, 4],
  ])("clampContrast %s -> %s", (input, expected) => {
    expect(clampContrast(input)).toBe(expected);
  });
  it.each([
    [0, 1],
    [2.6, 3],
    [50, 12],
  ])("clampPixelSize %s -> %s", (input, expected) => {
    expect(clampPixelSize(input)).toBe(expected);
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
  it("returns the center for an empty rect", () => {
    expect(pointerToUnit(1, 1, { left: 0, top: 0, width: 0, height: 0 })).toEqual([0.5, 0.5]);
  });
});

describe("SWIRL_PAINT_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 declaring the expected uniforms and output", () => {
    expect(SWIRL_PAINT_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColors",
      "uSpeed",
      "uSpin",
      "uContrast",
      "uPixelSize",
      "uPointer",
    ]) {
      expect(SWIRL_PAINT_FRAGMENT_SHADER).toContain(name);
    }
    expect(SWIRL_PAINT_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(SWIRL_PAINT_FRAGMENT_SHADER).toMatch(/fragColor\s*=/);
  });
});
