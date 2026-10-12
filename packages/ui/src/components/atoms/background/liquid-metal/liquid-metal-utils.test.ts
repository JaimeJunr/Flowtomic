import { describe, expect, it } from "vitest";
import { LIQUID_METAL_FRAGMENT_SHADER } from "./liquid-metal-shader";
import {
  assertColorToken,
  clampFrequency,
  clampUnit,
  fallbackBackground,
  pointerTarget,
  stepToward,
} from "./liquid-metal-utils";

describe("clampUnit", () => {
  it.each([
    [-1, 0],
    [0.3, 0.3],
    [4, 1],
  ])("clamps %s to %s", (input, expected) => {
    expect(clampUnit(input)).toBe(expected);
  });
});

describe("clampFrequency", () => {
  it.each([
    [0, 1],
    [3, 3],
    [20, 8],
  ])("clamps %s to %s", (input, expected) => {
    expect(clampFrequency(input)).toBe(expected);
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

describe("stepToward", () => {
  it("moves a fraction of the distance", () => {
    expect(stepToward(0, 1, 0.25)).toBeCloseTo(0.25);
  });
  it("snaps when very close", () => {
    expect(stepToward(0.9999, 1, 0.1)).toBe(1);
  });
});

describe("pointerTarget", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  it("normalizes to 0-1 with y pointing up", () => {
    expect(pointerTarget(150, 75, rect)).toEqual({ x: 0.25, y: 0.75 });
  });
  it("clamps outside the area", () => {
    expect(pointerTarget(0, 1000, rect)).toEqual({ x: 0, y: 0 });
  });
  it("returns null for an empty rect", () => {
    expect(pointerTarget(1, 1, { left: 0, top: 0, width: 0, height: 0 })).toBeNull();
  });
});

describe("fallbackBackground", () => {
  it("uses the token in a 160deg gradient", () => {
    expect(fallbackBackground("--primary")).toBe(
      "linear-gradient(160deg, color-mix(in oklch, var(--primary) 25%, transparent), transparent 60%)"
    );
  });
});

describe("LIQUID_METAL_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 declaring the expected uniforms and output", () => {
    expect(LIQUID_METAL_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColor",
      "uSpeed",
      "uAmplitude",
      "uFrequency",
      "uPointer",
    ]) {
      expect(LIQUID_METAL_FRAGMENT_SHADER).toContain(name);
    }
    expect(LIQUID_METAL_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(LIQUID_METAL_FRAGMENT_SHADER).toMatch(/fragColor\s*=/);
  });
});
