import { describe, expect, it } from "vitest";
import { GLYPH_TERMINAL_FRAGMENT_SHADER } from "./glyph-terminal-shader";
import {
  assertColorToken,
  clampCurvature,
  clampFlicker,
  clampGlitch,
  clampGlyphSize,
  clampUnit,
  glyphBits,
  glyphTable,
  lerp,
  pointerToUnit,
  toColorUniform,
} from "./glyph-terminal-utils";

const fallback = { r: 0.1, g: 0.2, b: 0.3, a: 1 };

describe("glyphBits", () => {
  it("has 15 bits per digit and all ten patterns are distinct", () => {
    const all = Array.from({ length: 10 }, (_, digit) => glyphBits(digit));
    for (const bits of all) {
      expect(bits).toBeGreaterThan(0);
      expect(bits).toBeLessThan(1 << 15);
    }
    expect(new Set(all).size).toBe(10);
  });
  it("draws the digit 1 as a vertical stem with a base (row 0 is the top)", () => {
    // Linhas: 010 / 110 / 010 / 010 / 111, bit = linha * 3 + coluna.
    const rows = [0b010, 0b011, 0b010, 0b010, 0b111];
    // A coluna 0 é o bit menos significativo da linha, então "110" lido da esquerda vale 0b011.
    const expected = rows.reduce((sum, row, index) => sum | (row << (index * 3)), 0);
    expect(glyphBits(1)).toBe(expected);
  });
  it("rejects a digit outside 0-9 reporting the value", () => {
    expect(() => glyphBits(10)).toThrow(/10.*0.*9/);
    expect(() => glyphBits(1.5)).toThrow(/1\.5/);
  });
});

describe("glyphTable", () => {
  it("lists the ten patterns as a GLSL int array", () => {
    const table = glyphTable();
    expect(table.startsWith("const int GLYPHS[10] = int[10](")).toBe(true);
    expect(table.split(",").length).toBe(10);
    expect(table).toContain(String(glyphBits(0)));
  });
});

describe("clampGlyphSize", () => {
  it.each([
    [2, 6],
    [12, 12],
    [99, 32],
  ])("clamps %s to %s", (input, expected) => {
    expect(clampGlyphSize(input)).toBe(expected);
  });
});

describe("clampGlitch and clampFlicker", () => {
  it.each([
    [-1, 0],
    [1.2, 1.2],
    [5, 2],
  ])("clamp %s to %s", (input, expected) => {
    expect(clampGlitch(input)).toBe(expected);
    expect(clampFlicker(input)).toBe(expected);
  });
});

describe("clampCurvature", () => {
  it.each([
    [-1, 0],
    [0.2, 0.2],
    [3, 0.5],
  ])("clamps %s to %s", (input, expected) => {
    expect(clampCurvature(input)).toBe(expected);
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

describe("toColorUniform", () => {
  it("converts a color to 3 numbers", () => {
    expect(Array.from(toColorUniform({ r: 1, g: 0, b: 0.5, a: 1 }, fallback))).toEqual([1, 0, 0.5]);
  });
  it("uses the fallback for null", () => {
    expect(toColorUniform(null, fallback)[2]).toBeCloseTo(0.3);
  });
});

describe("assertColorToken", () => {
  it("accepts a css variable name", () => {
    expect(() => assertColorToken("--success")).not.toThrow();
  });
  it("reports the received value", () => {
    expect(() => assertColorToken("success")).toThrow(/"success".*--token-name/);
  });
});

describe("lerp and pointerToUnit", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  it("interpolates", () => {
    expect(lerp(0, 10, 0.25)).toBe(2.5);
  });
  it("normalizes to 0-1 with y pointing up", () => {
    expect(pointerToUnit(200, 75, rect)).toEqual([0.5, 0.75]);
  });
  it("returns the center for an empty rect", () => {
    expect(pointerToUnit(1, 1, { left: 0, top: 0, width: 0, height: 0 })).toEqual([0.5, 0.5]);
  });
});

describe("GLYPH_TERMINAL_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 declaring the expected uniforms and output", () => {
    expect(GLYPH_TERMINAL_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uTint",
      "uSpeed",
      "uGlyphSize",
      "uScanlines",
      "uGlitch",
      "uFlicker",
      "uCurvature",
      "uPointer",
      "uPointerOn",
      "uReveal",
      "GLYPHS",
    ]) {
      expect(GLYPH_TERMINAL_FRAGMENT_SHADER).toContain(name);
    }
    expect(GLYPH_TERMINAL_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(GLYPH_TERMINAL_FRAGMENT_SHADER).toMatch(/fragColor\s*=/);
  });
});
