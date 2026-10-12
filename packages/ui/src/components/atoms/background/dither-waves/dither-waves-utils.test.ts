import { describe, expect, it } from "vitest";
import { DITHER_WAVES_FRAGMENT_SHADER } from "./dither-waves-shader";
import {
  activeTrail,
  assertColorToken,
  bayerThreshold,
  clampContrast,
  clampLevels,
  clampPixelSize,
  clampScale,
  fallbackBackground,
  MAX_TRAIL,
  patternIndex,
  pointerTarget,
  pushTrail,
  trailUniforms,
} from "./dither-waves-utils";

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

describe("DITHER_WAVES_FRAGMENT_SHADER", () => {
  it("is GLSL ES 3.00 with the expected uniforms and output", () => {
    expect(DITHER_WAVES_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColor",
      "uSpeed",
      "uScale",
      "uLevels",
      "uPixelSize",
      "uContrast",
      "uPattern",
      "uReveal",
      "uTrail[12]",
      "uTrailCount",
    ]) {
      expect(DITHER_WAVES_FRAGMENT_SHADER).toContain(name);
    }
    expect(DITHER_WAVES_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(DITHER_WAVES_FRAGMENT_SHADER).toContain("fragColor = vec4(uColor * q, q)");
  });
});

describe("bayerThreshold", () => {
  it("matches the known 4x4 matrix", () => {
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        expect(bayerThreshold(x, y, 4)).toBeCloseTo(BAYER4[y][x] / 16, 10);
      }
    }
  });
  it("wraps the coordinates", () => {
    expect(bayerThreshold(5, 6, 4)).toBe(bayerThreshold(1, 2, 4));
    expect(bayerThreshold(-1, 0, 4)).toBe(bayerThreshold(3, 0, 4));
  });
  it("uses every 8x8 rank exactly once", () => {
    const seen = new Set<number>();
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) seen.add(Math.round(bayerThreshold(x, y, 8) * 64));
    }
    expect(seen.size).toBe(64);
    expect(Math.min(...seen)).toBe(0);
    expect(Math.max(...seen)).toBe(63);
  });
  it("throws for an unsupported size with the received value", () => {
    expect(() => bayerThreshold(0, 0, 6)).toThrow(/Received matrix size 6.*expected 4 or 8/);
  });
});

describe("clamps", () => {
  it.each([
    [0, 2],
    [3.4, 3],
    [20, 8],
  ])("clampLevels %s -> %s", (input, expected) => {
    expect(clampLevels(input)).toBe(expected);
  });
  it.each([
    [0, 1],
    [2.6, 3],
    [40, 8],
  ])("clampPixelSize %s -> %s", (input, expected) => {
    expect(clampPixelSize(input)).toBe(expected);
  });
  it.each([
    [0, 0.5],
    [1.2, 1.2],
    [9, 2],
  ])("clampContrast %s -> %s", (input, expected) => {
    expect(clampContrast(input)).toBe(expected);
  });
  it.each([
    [0, 0.1],
    [2, 2],
    [99, 10],
  ])("clampScale %s -> %s", (input, expected) => {
    expect(clampScale(input)).toBe(expected);
  });
});

describe("assertColorToken", () => {
  it("accepts a css variable name", () => {
    expect(() => assertColorToken("--primary")).not.toThrow();
  });
  it("rejects a token without dashes, with the received value", () => {
    expect(() => assertColorToken("primary")).toThrow(/"primary".*--token-name/);
  });
});

describe("patternIndex", () => {
  it("maps patterns to shader indexes", () => {
    expect(patternIndex("bayer4")).toBe(0);
    expect(patternIndex("bayer8")).toBe(1);
    expect(patternIndex("lines")).toBe(2);
  });
  it("throws for an unknown pattern", () => {
    expect(() => patternIndex("dots" as never)).toThrow(/"dots".*bayer4, bayer8, lines/);
  });
});

describe("trail", () => {
  const point = (start: number) => ({ x: 0.5, y: 0.25, start });
  it("keeps at most 12 points, dropping the oldest", () => {
    let list: ReturnType<typeof pushTrail> = [];
    for (let i = 0; i < 20; i++) list = pushTrail(list, point(i));
    expect(MAX_TRAIL).toBe(12);
    expect(list).toHaveLength(12);
    expect(list[0].start).toBe(8);
    expect(list[11].start).toBe(19);
  });
  it("drops points that already faded", () => {
    expect(activeTrail([point(0), point(9)], 10).map((p) => p.start)).toEqual([9]);
  });
  it("packs x, y and instant for the shader", () => {
    const packed = trailUniforms([point(3)]);
    expect(packed.count).toBe(1);
    expect(packed.data).toHaveLength(36);
    expect(Array.from(packed.data.slice(0, 3))).toEqual([0.5, 0.25, 3]);
  });
});

describe("pointerTarget", () => {
  const rect = { left: 10, top: 10, width: 200, height: 100 };
  it("normalizes with y up", () => {
    expect(pointerTarget(110, 35, rect)).toEqual({ x: 0.5, y: 0.75 });
  });
  it("returns null for an empty rect", () => {
    expect(pointerTarget(0, 0, { ...rect, width: 0 })).toBeNull();
  });
});

describe("fallbackBackground", () => {
  it("draws a dot pattern from the token", () => {
    const style = fallbackBackground("--primary");
    expect(style.backgroundImage).toContain("radial-gradient");
    expect(style.backgroundImage).toContain("var(--primary)");
    expect(style.backgroundSize).toBe("4px 4px");
  });
});
