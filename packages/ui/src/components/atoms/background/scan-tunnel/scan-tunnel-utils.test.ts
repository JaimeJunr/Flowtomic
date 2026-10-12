import { describe, expect, it } from "vitest";
import {
  assertColorToken,
  clampGridScale,
  clampLineWidth,
  clampScanDelay,
  clampScanDuration,
  clampScanOpacity,
  fallbackBackground,
  pointerTarget,
  scanPhase,
  stepToward,
} from "./scan-tunnel-utils";

describe("clamps", () => {
  it("limits gridScale to 0.05-0.5", () => {
    expect(clampGridScale(0)).toBe(0.05);
    expect(clampGridScale(2)).toBe(0.5);
    expect(clampGridScale(0.12)).toBe(0.12);
  });
  it("limits lineWidth to 0.5-3", () => {
    expect(clampLineWidth(0)).toBe(0.5);
    expect(clampLineWidth(9)).toBe(3);
    expect(clampLineWidth(1)).toBe(1);
  });
  it("limits scanOpacity to 0-1", () => {
    expect(clampScanOpacity(-1)).toBe(0);
    expect(clampScanOpacity(3)).toBe(1);
  });
  it("limits scanDuration to 0.5-10", () => {
    expect(clampScanDuration(0)).toBe(0.5);
    expect(clampScanDuration(99)).toBe(10);
  });
  it("limits scanDelay to 0-10", () => {
    expect(clampScanDelay(-3)).toBe(0);
    expect(clampScanDelay(99)).toBe(10);
  });
});

describe("assertColorToken", () => {
  it("accepts css variable names", () => {
    expect(() => assertColorToken("--primary")).not.toThrow();
  });
  it("throws with the received value", () => {
    expect(() => assertColorToken("primary")).toThrow(/"primary".*--token-name/);
  });
});

describe("scanPhase", () => {
  // duração 2, pausa 1: ida [0,2], pausa [2,3], volta [3,5], pausa [5,6].
  it("starts at 0 and reaches 1 at the end of the forward pass", () => {
    expect(scanPhase(0, 2, 1)).toBe(0);
    expect(scanPhase(2, 2, 1)).toBe(1);
  });
  it("is monotonic and eased in the middle of the forward pass", () => {
    expect(scanPhase(1, 2, 1)).toBeCloseTo(0.5, 6);
    expect(scanPhase(0.5, 2, 1) as number).toBeLessThan(0.25);
  });
  it("holds 1 during the pause between passes", () => {
    expect(scanPhase(2.5, 2, 1)).toBe(1);
  });
  it("returns to 0 on the way back", () => {
    expect(scanPhase(3, 2, 1)).toBe(1);
    expect(scanPhase(4, 2, 1)).toBeCloseTo(0.5, 6);
    expect(scanPhase(5, 2, 1)).toBe(0);
  });
  it("returns null in the final pause", () => {
    expect(scanPhase(5.5, 2, 1)).toBeNull();
  });
  it("repeats every full cycle", () => {
    expect(scanPhase(6 + 1, 2, 1)).toBeCloseTo(0.5, 6);
    expect(scanPhase(6 + 5.5, 2, 1)).toBeNull();
  });
  it("works without delay", () => {
    expect(scanPhase(1, 1, 0)).toBe(1);
    expect(scanPhase(1.5, 1, 0)).toBeCloseTo(0.5, 6);
  });
});

describe("stepToward", () => {
  it("approaches the target and snaps when close", () => {
    expect(stepToward(0, 1, 0.5)).toBe(0.5);
    expect(stepToward(0.9996, 1, 0.15)).toBe(1);
  });
});

describe("pointerTarget", () => {
  const rect = { left: 0, top: 0, width: 200, height: 100 };
  it("normalizes to 0-1 with y up", () => {
    expect(pointerTarget(100, 25, rect)).toEqual({ x: 0.5, y: 0.75 });
  });
  it("clamps outside the box", () => {
    expect(pointerTarget(-50, 500, rect)).toEqual({ x: 0, y: 0 });
  });
  it("returns null for an empty box", () => {
    expect(pointerTarget(1, 1, { left: 0, top: 0, width: 0, height: 0 })).toBeNull();
  });
});

describe("fallbackBackground", () => {
  it("uses the radial gradient with the scan token", () => {
    const { background } = fallbackBackground("--primary");
    expect(background).toContain("radial-gradient(ellipse at center");
    expect(background).toContain("var(--primary)");
  });
});
