import { describe, expect, it } from "vitest";
import { ELEVATION_MAP_FRAGMENT_SHADER } from "./elevation-map-shader";
import {
  assertColorTokens,
  clampBands,
  clampGlow,
  clampMorph,
  clampScale,
  clampThickness,
  heightToColorStop,
  lerp,
  pointerToUnit,
} from "./elevation-map-utils";

describe("heightToColorStop", () => {
  it("is the low color at 0", () => {
    expect(heightToColorStop(0)).toEqual([1, 0, 0]);
  });
  it("is the mid color at 0.6", () => {
    const [low, mid, high] = heightToColorStop(0.6);
    expect(low).toBeCloseTo(0);
    expect(mid).toBeCloseTo(1);
    expect(high).toBeCloseTo(0);
  });
  it("is the high color at 1", () => {
    const [low, mid, high] = heightToColorStop(1);
    expect(low).toBeCloseTo(0);
    expect(mid).toBeCloseTo(0);
    expect(high).toBeCloseTo(1);
  });
  it("always sums to 1 and clamps out-of-range input", () => {
    for (const h of [-1, 0.1, 0.3, 0.45, 0.8, 0.95, 2]) {
      const sum = heightToColorStop(h).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1);
    }
    expect(heightToColorStop(-5)).toEqual(heightToColorStop(0));
  });
});

describe("clamps", () => {
  it("limits morph to 0-5", () => {
    expect(clampMorph(-1)).toBe(0);
    expect(clampMorph(9)).toBe(5);
    expect(clampMorph(3)).toBe(3);
  });
  it("limits bands to 0.5-8", () => {
    expect(clampBands(0)).toBe(0.5);
    expect(clampBands(20)).toBe(8);
  });
  it("limits thickness to 0.002-0.05", () => {
    expect(clampThickness(0)).toBe(0.002);
    expect(clampThickness(1)).toBe(0.05);
  });
  it("limits scale to 0.3-4", () => {
    expect(clampScale(0)).toBe(0.3);
    expect(clampScale(10)).toBe(4);
  });
  it("limits glow to 0-2", () => {
    expect(clampGlow(-3)).toBe(0);
    expect(clampGlow(7)).toBe(2);
  });
});

describe("assertColorTokens", () => {
  it("accepts exactly three tokens", () => {
    expect(() => assertColorTokens(["--a", "--b", "--c"])).not.toThrow();
  });
  it("rejects a wrong count with the received value", () => {
    expect(() => assertColorTokens(["--a", "--b"])).toThrow(/\["--a","--b"\].*exactly 3/);
    expect(() => assertColorTokens(["--a", "--b", "--c", "--d"])).toThrow(/exactly 3/);
  });
  it("rejects a token without the -- prefix", () => {
    expect(() => assertColorTokens(["--a", "--b", "primary"])).toThrow(/"primary"/);
  });
});

describe("lerp and pointerToUnit", () => {
  it("interpolates", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
  it("maps the pointer with y up and clamps", () => {
    const rect = { left: 0, top: 0, width: 200, height: 100 };
    expect(pointerToUnit(100, 25, rect)).toEqual([0.5, 0.75]);
    expect(pointerToUnit(-50, 500, rect)).toEqual([0, 0]);
    expect(pointerToUnit(1, 1, { ...rect, width: 0 })).toEqual([0.5, 0.5]);
  });
});

describe("ELEVATION_MAP_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 with premultiplied output", () => {
    expect(ELEVATION_MAP_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    expect(ELEVATION_MAP_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(ELEVATION_MAP_FRAGMENT_SHADER).toContain("fwidth");
  });
  it("declares every uniform the component sets", () => {
    for (const name of [
      "uTime",
      "uResolution",
      "uColor1",
      "uColor2",
      "uColor3",
      "uSpeed",
      "uMorph",
      "uBands",
      "uThickness",
      "uScale",
      "uGlow",
      "uFill",
      "uPointer",
      "uPointerStrength",
    ]) {
      expect(ELEVATION_MAP_FRAGMENT_SHADER).toMatch(new RegExp(`uniform \\w+ ${name};`));
    }
  });
});
