import { describe, expect, it } from "vitest";
import { THREAD_BUNDLE_FRAGMENT_SHADER } from "./thread-bundle-shader";
import {
  assertColorToken,
  clampAmplitude,
  clampLineCount,
  clampSplit,
  clampSpread,
  clampThickness,
  lerp,
  pointerToUnit,
  resolveAccentToken,
  toRadians,
} from "./thread-bundle-utils";

describe("assertColorToken", () => {
  it("accepts a css variable name", () => {
    expect(() => assertColorToken("--primary", "color")).not.toThrow();
  });
  it("rejects a token without the dashes, naming prop and value", () => {
    expect(() => assertColorToken("primary", "color")).toThrow(/color.*"primary".*--token-name/);
  });
});

describe("resolveAccentToken", () => {
  it("falls back to the main color when the accent is missing", () => {
    expect(resolveAccentToken("--primary", undefined)).toBe("--primary");
  });
  it("keeps the accent when present", () => {
    expect(resolveAccentToken("--primary", "--success")).toBe("--success");
  });
  it("rejects an invalid accent with the received value", () => {
    expect(() => resolveAccentToken("--primary", "success")).toThrow(/accentColor.*"success"/);
  });
});

describe("clamps", () => {
  it.each([
    [1, 8],
    [90.4, 90],
    [500, 160],
  ])("clampLineCount %s -> %s", (input, expected) => {
    expect(clampLineCount(input)).toBe(expected);
  });
  it.each([
    [0, 0.3],
    [0.6, 0.6],
    [9, 3],
  ])("clampThickness %s -> %s", (input, expected) => {
    expect(clampThickness(input)).toBe(expected);
  });
  it.each([
    [-1, 0],
    [1.7, 1.7],
    [9, 3],
  ])("clampAmplitude %s -> %s", (input, expected) => {
    expect(clampAmplitude(input)).toBe(expected);
  });
  it.each([
    [-1, 0],
    [0.4, 0.4],
    [2, 1],
  ])("clampSpread %s -> %s", (input, expected) => {
    expect(clampSpread(input)).toBe(expected);
  });
  it.each([
    [-1, 0],
    [0.04, 0.04],
    [2, 1],
  ])("clampSplit %s -> %s", (input, expected) => {
    expect(clampSplit(input)).toBe(expected);
  });
});

describe("toRadians / lerp", () => {
  it("converts degrees", () => {
    expect(toRadians(180)).toBeCloseTo(Math.PI);
  });
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

describe("THREAD_BUNDLE_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 declaring the expected uniforms and output", () => {
    expect(THREAD_BUNDLE_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColor",
      "uAccent",
      "uSpeed",
      "uLineCount",
      "uThickness",
      "uAmplitude",
      "uSpread",
      "uSplit",
      "uAngle",
      "uPointer",
      "uPointerStrength",
    ]) {
      expect(THREAD_BUNDLE_FRAGMENT_SHADER).toContain(`uniform`);
      expect(THREAD_BUNDLE_FRAGMENT_SHADER).toContain(name);
    }
    expect(THREAD_BUNDLE_FRAGMENT_SHADER).toContain("out vec4 fragColor");
  });
  it("loops up to 160 threads with a break", () => {
    expect(THREAD_BUNDLE_FRAGMENT_SHADER).toMatch(/i\s*<\s*160/);
    expect(THREAD_BUNDLE_FRAGMENT_SHADER).toContain("break");
  });
  it("outputs premultiplied color", () => {
    expect(THREAD_BUNDLE_FRAGMENT_SHADER).toMatch(/fragColor\s*=\s*vec4\(color \* a, a\)/);
  });
});
