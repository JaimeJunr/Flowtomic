import { describe, expect, it } from "vitest";
import { DRIFT_LINES_FRAGMENT_SHADER } from "./drift-lines-shader";
import {
  assertColorTokens,
  clampBend,
  clampLineCount,
  clampLineGap,
  lerp,
  pointerToUnit,
  wavesMask,
} from "./drift-lines-utils";

describe("wavesMask", () => {
  it("maps top and bottom to [1, 0, 1]", () => {
    expect(wavesMask(["top", "bottom"])).toEqual([1, 0, 1]);
  });
  it("maps all three waves", () => {
    expect(wavesMask(["top", "middle", "bottom"])).toEqual([1, 1, 1]);
  });
  it("maps an empty list to zeros", () => {
    expect(wavesMask([])).toEqual([0, 0, 0]);
  });
  it("throws for an invalid wave with received and expected values", () => {
    expect(() => wavesMask(["side" as never])).toThrow(/"side".*"top".*"middle".*"bottom"/);
  });
});

describe("clamps", () => {
  it("rounds lineCount into 1-12", () => {
    expect(clampLineCount(0)).toBe(1);
    expect(clampLineCount(99)).toBe(12);
    expect(clampLineCount(5.6)).toBe(6);
  });
  it("limits lineGap to 0.2-4", () => {
    expect(clampLineGap(0)).toBe(0.2);
    expect(clampLineGap(9)).toBe(4);
    expect(clampLineGap(1)).toBe(1);
  });
  it("limits bend to -2..2", () => {
    expect(clampBend(-5)).toBe(-2);
    expect(clampBend(5)).toBe(2);
    expect(clampBend(-0.5)).toBe(-0.5);
  });
});

describe("assertColorTokens", () => {
  it("accepts exactly two css variable names", () => {
    expect(() => assertColorTokens(["--primary", "--info"])).not.toThrow();
  });
  it("throws for a token without the leading dashes, naming the value", () => {
    expect(() => assertColorTokens(["primary", "--info"])).toThrow(/"primary"/);
  });
  it("throws when there are not exactly two tokens", () => {
    expect(() => assertColorTokens(["--primary"] as never)).toThrow(/\["--primary"\].*2/);
    expect(() => assertColorTokens(["--a", "--b", "--c"] as never)).toThrow(/2/);
  });
});

describe("lerp and pointerToUnit", () => {
  it("interpolates", () => {
    expect(lerp(0, 10, 0.25)).toBe(2.5);
  });
  it("normalizes to 0-1 with y pointing up", () => {
    expect(pointerToUnit(200, 75, { left: 100, top: 50, width: 200, height: 100 })).toEqual([
      0.5, 0.75,
    ]);
  });
  it("returns the center for an empty rect", () => {
    expect(pointerToUnit(1, 1, { left: 0, top: 0, width: 0, height: 0 })).toEqual([0.5, 0.5]);
  });
});

describe("DRIFT_LINES_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 declaring the expected uniforms and output", () => {
    expect(DRIFT_LINES_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColor1",
      "uColor2",
      "uWaves",
      "uLineCount",
      "uLineGap",
      "uSpeed",
      "uBend",
      "uPointer",
      "uPointerStrength",
    ]) {
      expect(DRIFT_LINES_FRAGMENT_SHADER).toMatch(new RegExp(`uniform [a-z0-9]+ ${name};`));
    }
    expect(DRIFT_LINES_FRAGMENT_SHADER).toContain("out vec4 fragColor");
  });
  it("loops up to 12 lines with a break", () => {
    expect(DRIFT_LINES_FRAGMENT_SHADER).toMatch(/i\s*<\s*12/);
    expect(DRIFT_LINES_FRAGMENT_SHADER).toContain("break");
  });
  it("outputs premultiplied color", () => {
    expect(DRIFT_LINES_FRAGMENT_SHADER).toMatch(/fragColor\s*=\s*vec4\(col, a\)/);
  });
});
