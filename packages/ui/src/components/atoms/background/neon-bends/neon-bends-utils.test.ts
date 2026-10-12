import { describe, expect, it } from "vitest";
import { NEON_BENDS_FRAGMENT_SHADER } from "./neon-bends-shader";
import {
  assertColorTokens,
  clampBandWidth,
  clampFrequency,
  clampIntensity,
  clampScale,
  clampWarp,
  lerp,
  pointerToUnit,
  rotationRadians,
} from "./neon-bends-utils";

describe("assertColorTokens", () => {
  it("accepts 1 to 4 tokens", () => {
    expect(() => assertColorTokens(["--primary"])).not.toThrow();
    expect(() => assertColorTokens(["--a", "--b", "--c", "--d"])).not.toThrow();
  });
  it("throws for an empty list with the received value", () => {
    expect(() => assertColorTokens([])).toThrow(/\[\].*1 to 4/);
  });
  it("throws for 5 tokens", () => {
    expect(() => assertColorTokens(["--a", "--b", "--c", "--d", "--e"])).toThrow(/1 to 4/);
  });
  it("throws for a token without the -- prefix", () => {
    expect(() => assertColorTokens(["--a", "primary"])).toThrow(/"primary".*--token-name/);
  });
});

describe("clamps", () => {
  it("scale 0.3-4", () => {
    expect(clampScale(0)).toBe(0.3);
    expect(clampScale(9)).toBe(4);
    expect(clampScale(2)).toBe(2);
  });
  it("frequency 0.2-4", () => {
    expect(clampFrequency(0)).toBe(0.2);
    expect(clampFrequency(9)).toBe(4);
  });
  it("warp 0-3", () => {
    expect(clampWarp(-1)).toBe(0);
    expect(clampWarp(5)).toBe(3);
  });
  it("bandWidth 1-20", () => {
    expect(clampBandWidth(0)).toBe(1);
    expect(clampBandWidth(99)).toBe(20);
  });
  it("intensity 0-4", () => {
    expect(clampIntensity(-1)).toBe(0);
    expect(clampIntensity(9)).toBe(4);
  });
});

describe("rotationRadians", () => {
  it("converts the static rotation to radians", () => {
    expect(rotationRadians(90, 0, 10)).toBeCloseTo(Math.PI / 2);
  });
  it("adds spin per second", () => {
    expect(rotationRadians(0, 180, 2)).toBeCloseTo(2 * Math.PI);
  });
});

describe("lerp and pointerToUnit", () => {
  it("lerps", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
  it("flips y and clamps", () => {
    const rect = { left: 0, top: 0, width: 100, height: 100 };
    expect(pointerToUnit(25, 25, rect)).toEqual([0.25, 0.75]);
    expect(pointerToUnit(-5, 500, rect)).toEqual([0, 0]);
    expect(pointerToUnit(1, 1, { ...rect, width: 0 })).toEqual([0.5, 0.5]);
  });
});

describe("shader", () => {
  it("declares version, uniforms and output", () => {
    const src = NEON_BENDS_FRAGMENT_SHADER;
    expect(src.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColors[4]",
      "uCount",
      "uRotation",
      "uSpin",
      "uSpeed",
      "uScale",
      "uFrequency",
      "uWarp",
      "uBandWidth",
      "uIntensity",
      "uPointer",
      "uPointerStrength",
    ]) {
      expect(src).toContain(name);
    }
    expect(src).toContain("out vec4 fragColor");
    expect(src).toContain("fragColor =");
  });
});
