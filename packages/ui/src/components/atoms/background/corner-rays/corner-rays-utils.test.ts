import { describe, expect, it } from "vitest";
import {
  assertColorTokens,
  clampBlend,
  clampFalloff,
  clampIntensity,
  clampSpread,
  clampTilt,
  cornerPoint,
  fallbackBackground,
  originPoint,
  toColorUniform,
} from "./corner-rays-utils";

describe("originPoint", () => {
  it("pushes each corner outside the frame", () => {
    expect(originPoint("top-right")).toEqual({ x: 1.1, y: 1.1 });
    expect(originPoint("top-left")).toEqual({ x: -0.1, y: 1.1 });
    expect(originPoint("bottom-right")).toEqual({ x: 1.1, y: -0.1 });
    expect(originPoint("bottom-left")).toEqual({ x: -0.1, y: -0.1 });
  });
  it("throws for an invalid origin with the received value", () => {
    expect(() => originPoint("center")).toThrow(/"center".*top-right/);
    expect(() => originPoint("toString")).toThrow(/"toString"/);
  });
});

describe("cornerPoint", () => {
  it("returns the exact corner", () => {
    expect(cornerPoint("top-right")).toEqual({ x: 1, y: 1 });
    expect(cornerPoint("bottom-left")).toEqual({ x: 0, y: 0 });
  });
});

describe("clamps", () => {
  it("limits intensity, spread, tilt, blend and falloff", () => {
    expect(clampIntensity(9)).toBe(4);
    expect(clampIntensity(-1)).toBe(0);
    expect(clampSpread(0)).toBe(0.2);
    expect(clampSpread(9)).toBe(4);
    expect(clampTilt(120)).toBe(90);
    expect(clampTilt(-120)).toBe(-90);
    expect(clampBlend(2)).toBe(1);
    expect(clampBlend(-2)).toBe(0);
    expect(clampFalloff(0)).toBe(0.3);
    expect(clampFalloff(9)).toBe(4);
    expect(clampFalloff(1.6)).toBe(1.6);
  });
});

describe("assertColorTokens", () => {
  it("accepts exactly two css variable names", () => {
    expect(() => assertColorTokens(["--a", "--b"])).not.toThrow();
  });
  it("rejects the wrong count and malformed tokens", () => {
    expect(() => assertColorTokens(["--a"])).toThrow(/2 tokens/);
    expect(() => assertColorTokens(["a", "--b"])).toThrow(/"a"/);
  });
});

describe("toColorUniform", () => {
  it("flattens colors and uses the fallback for missing ones", () => {
    const fallback = { r: 1, g: 1, b: 1, a: 1 };
    const result = toColorUniform([{ r: 0.1, g: 0.2, b: 0.3, a: 1 }, null], fallback);
    expect(Array.from(result)).toEqual([
      Math.fround(0.1),
      Math.fround(0.2),
      Math.fround(0.3),
      1,
      1,
      1,
    ]);
  });
});

describe("fallbackBackground", () => {
  it("opens the gradient at the right corner", () => {
    expect(fallbackBackground("--warning", "top-right").background).toContain(
      "ellipse at top right"
    );
    expect(fallbackBackground("--warning", "bottom-left").background).toContain(
      "ellipse at bottom left"
    );
    expect(fallbackBackground("--warning", "top-left").background).toContain("var(--warning) 35%");
  });
});
