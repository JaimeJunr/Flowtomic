import { describe, expect, it } from "vitest";
import { LIGHT_BEAMS_FRAGMENT_SHADER } from "./light-beams-shader";
import {
  assertColorToken,
  clampUnit,
  fallbackBackground,
  type LightBeamsOrigin,
  maxPointerAngle,
  originPoint,
  pointerAngle,
  stepToward,
} from "./light-beams-utils";

const ORIGINS: LightBeamsOrigin[] = [
  "top-center",
  "top-left",
  "top-right",
  "left",
  "right",
  "bottom-center",
  "bottom-left",
  "bottom-right",
];

describe("originPoint", () => {
  it("places the default origin just above the top center", () => {
    expect(originPoint("top-center")).toEqual({ x: 0.5, y: 1.08, dirX: 0, dirY: -0.58 });
  });
  it.each(ORIGINS)("puts %s outside the area and aims at the center", (name) => {
    const p = originPoint(name);
    const outside = p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1;
    expect(outside).toBe(true);
    expect(p.dirX).toBeCloseTo(0.5 - p.x);
    expect(p.dirY).toBeCloseTo(0.5 - p.y);
  });
  it("uses the documented side positions", () => {
    expect(originPoint("left")).toMatchObject({ x: -0.08, y: 0.6 });
    expect(originPoint("right")).toMatchObject({ x: 1.08, y: 0.6 });
    expect(originPoint("bottom-center")).toMatchObject({ x: 0.5, y: -0.08 });
    expect(originPoint("top-left")).toMatchObject({ x: 0, y: 1.08 });
    expect(originPoint("bottom-right")).toMatchObject({ x: 1, y: -0.08 });
  });
  it("reports the received value for an unknown origin", () => {
    expect(() => originPoint("middle" as LightBeamsOrigin)).toThrow(/"middle".*top-center/);
  });
});

describe("pointerAngle", () => {
  it("is zero at the center and reaches the limit at the edges", () => {
    expect(pointerAngle(0.5)).toBe(0);
    expect(pointerAngle(1)).toBeCloseTo(maxPointerAngle);
    expect(pointerAngle(0)).toBeCloseTo(-maxPointerAngle);
    expect(maxPointerAngle).toBe(0.25);
  });
  it("clamps values outside 0-1", () => {
    expect(pointerAngle(4)).toBeCloseTo(maxPointerAngle);
    expect(pointerAngle(-4)).toBeCloseTo(-maxPointerAngle);
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

describe("fallbackBackground", () => {
  it("starts the radial gradient at the origin with the token", () => {
    const css = fallbackBackground("--primary", "top-center");
    expect(css).toContain("radial-gradient");
    expect(css).toContain("at 50% -8%");
    expect(css).toContain("color-mix(in oklch, var(--primary) 35%, transparent)");
  });
});

describe("LIGHT_BEAMS_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 declaring the expected uniforms and output", () => {
    expect(LIGHT_BEAMS_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColor",
      "uOrigin",
      "uAngle",
      "uSpread",
      "uLength",
      "uIntensity",
      "uSpeed",
    ]) {
      expect(LIGHT_BEAMS_FRAGMENT_SHADER).toContain(name);
    }
    expect(LIGHT_BEAMS_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(LIGHT_BEAMS_FRAGMENT_SHADER).toMatch(/fragColor\s*=/);
  });
});
