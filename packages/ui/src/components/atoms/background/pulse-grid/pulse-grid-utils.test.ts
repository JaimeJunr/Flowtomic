import { describe, expect, it } from "vitest";
import {
  activeRipples,
  assertColorToken,
  clampCellSize,
  clampLineWidth,
  clampRippleStrength,
  clampUnit,
  deviceScale,
  dueAutoRipples,
  fallbackBackground,
  pointerTarget,
  pushRipple,
  type Ripple,
  rippleUniforms,
  stepToward,
  variantIndex,
} from "./pulse-grid-utils";

const wave = (start: number, strength = 1): Ripple => ({ x: 0.5, y: 0.5, start, strength });

describe("pushRipple", () => {
  it("appends without mutating the input", () => {
    const list = [wave(0)];
    const next = pushRipple(list, wave(1));
    expect(next).toHaveLength(2);
    expect(list).toHaveLength(1);
  });
  it("drops the oldest ripple past the limit", () => {
    let list: Ripple[] = [];
    for (let i = 0; i < 10; i++) list = pushRipple(list, wave(i));
    expect(list).toHaveLength(8);
    expect(list[0].start).toBe(2);
    expect(list[7].start).toBe(9);
  });
  it("honors a custom max", () => {
    const list = pushRipple([wave(0), wave(1)], wave(2), 2);
    expect(list.map((r) => r.start)).toEqual([1, 2]);
  });
});

describe("clamps", () => {
  it("limits cellSize to 8-200", () => {
    expect(clampCellSize(2)).toBe(8);
    expect(clampCellSize(48)).toBe(48);
    expect(clampCellSize(900)).toBe(200);
  });
  it("limits lineWidth to 0.5-4", () => {
    expect(clampLineWidth(0)).toBe(0.5);
    expect(clampLineWidth(1)).toBe(1);
    expect(clampLineWidth(10)).toBe(4);
  });
  it("limits glow to 0-1", () => {
    expect(clampUnit(-1)).toBe(0);
    expect(clampUnit(0.6)).toBe(0.6);
    expect(clampUnit(3)).toBe(1);
  });
  it("limits rippleStrength to 0-2", () => {
    expect(clampRippleStrength(-1)).toBe(0);
    expect(clampRippleStrength(1)).toBe(1);
    expect(clampRippleStrength(5)).toBe(2);
  });
});

describe("assertColorToken", () => {
  it("accepts css variable names", () => {
    expect(() => assertColorToken("--primary")).not.toThrow();
  });
  it("throws with received and expected values", () => {
    expect(() => assertColorToken("primary")).toThrow(/"primary".*"--token-name"/);
  });
});

describe("variantIndex", () => {
  it("maps variants to shader indexes", () => {
    expect(variantIndex("lines")).toBe(0);
    expect(variantIndex("dots")).toBe(1);
    expect(variantIndex("cross")).toBe(2);
  });
  it("throws for an unknown variant", () => {
    expect(() => variantIndex("hex" as never)).toThrow(/"hex".*lines, dots, cross/);
  });
});

describe("activeRipples", () => {
  it("drops ripples that already faded", () => {
    const list = activeRipples([wave(0), wave(9)], 10);
    expect(list.map((r) => r.start)).toEqual([9]);
  });
});

describe("dueAutoRipples", () => {
  it("emits the first ripple at time 0", () => {
    expect(dueAutoRipples(0, 0, 2.6)).toEqual({ starts: [0], next: 2.6 });
  });
  it("emits nothing before the next instant", () => {
    expect(dueAutoRipples(2.6, 1, 2.6)).toEqual({ starts: [], next: 2.6 });
  });
  it("catches up ripples missed between frames", () => {
    const { starts, next } = dueAutoRipples(0, 5.5, 2);
    expect(starts).toEqual([0, 2, 4]);
    expect(next).toBe(6);
  });
  it("never schedules with interval 0", () => {
    expect(dueAutoRipples(0, 100, 0)).toEqual({ starts: [], next: 0 });
  });
  it("skips the backlog after a long pause", () => {
    const { starts } = dueAutoRipples(0, 1000, 2);
    expect(starts).toEqual([1000]);
  });
});

describe("rippleUniforms", () => {
  it("scales to device pixels and packs strengths", () => {
    const out = rippleUniforms([{ x: 0.5, y: 0.25, start: 3, strength: 2 }], 1000, 400);
    expect(out.count).toBe(1);
    expect(Array.from(out.positions.slice(0, 3))).toEqual([500, 100, 3]);
    expect(out.strengths[0]).toBe(2);
    expect(out.positions).toHaveLength(24);
    expect(out.strengths).toHaveLength(8);
  });
  it("keeps only the newest eight", () => {
    const list = Array.from({ length: 10 }, (_, i) => wave(i));
    const out = rippleUniforms(list, 10, 10);
    expect(out.count).toBe(8);
    expect(out.positions[2]).toBe(2);
  });
  it("returns zero count for an empty list", () => {
    expect(rippleUniforms([], 10, 10).count).toBe(0);
  });
});

describe("deviceScale", () => {
  it("divides canvas pixels by css pixels", () => {
    expect(deviceScale(2000, 1000, 1)).toBe(2);
  });
  it("falls back to the pixel ratio when unmeasured", () => {
    expect(deviceScale(300, 0, 1.5)).toBe(1.5);
  });
});

describe("stepToward", () => {
  it("moves a fraction toward the target", () => {
    expect(stepToward(0, 1, 0.5)).toBe(0.5);
  });
  it("snaps when close", () => {
    expect(stepToward(0.9996, 1, 0.1)).toBe(1);
  });
});

describe("pointerTarget", () => {
  const rect = { left: 10, top: 20, width: 200, height: 100 };
  it("normalizes with y upward", () => {
    expect(pointerTarget(110, 40, rect)).toEqual({ x: 0.5, y: 0.8 });
  });
  it("clamps outside the rect", () => {
    expect(pointerTarget(-50, 500, rect)).toEqual({ x: 0, y: 0 });
  });
  it("returns null for an empty rect", () => {
    expect(pointerTarget(0, 0, { left: 0, top: 0, width: 0, height: 0 })).toBeNull();
  });
});

describe("fallbackBackground", () => {
  it("builds two 1px gradients with the token and cell size", () => {
    const css = fallbackBackground("--primary", 32);
    expect(css.backgroundImage).toContain("var(--primary)");
    expect(css.backgroundImage).toContain("15%");
    expect(css.backgroundImage.match(/linear-gradient/g)).toHaveLength(2);
    expect(css.backgroundSize).toBe("32px 32px");
  });
  it("clamps the cell size", () => {
    expect(fallbackBackground("--primary", 1).backgroundSize).toBe("8px 8px");
  });
});
