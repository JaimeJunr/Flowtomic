import { describe, expect, it } from "vitest";
import {
  assertColorToken,
  assertDirection,
  cableIndex,
  clampCables,
  clampPulseLength,
  clampThickness,
  clampWaviness,
  directionSign,
  fallbackBackground,
  pointerTarget,
  stepToward,
} from "./fiber-tunnel-utils";

describe("clamps", () => {
  it("limits cables to an integer between 4 and 48", () => {
    expect(clampCables(0)).toBe(4);
    expect(clampCables(100)).toBe(48);
    expect(clampCables(20.6)).toBe(21);
    expect(clampCables(20)).toBe(20);
  });
  it("limits thickness to 0.1-1", () => {
    expect(clampThickness(0)).toBe(0.1);
    expect(clampThickness(5)).toBe(1);
    expect(clampThickness(0.35)).toBe(0.35);
  });
  it("limits pulseLength to 0.05-1", () => {
    expect(clampPulseLength(0)).toBe(0.05);
    expect(clampPulseLength(3)).toBe(1);
    expect(clampPulseLength(0.28)).toBe(0.28);
  });
  it("limits waviness to 0-1", () => {
    expect(clampWaviness(-1)).toBe(0);
    expect(clampWaviness(2)).toBe(1);
    expect(clampWaviness(0.3)).toBe(0.3);
  });
});

describe("cableIndex", () => {
  it("is 0 at angle 0", () => {
    expect(cableIndex(0, 20)).toBe(0);
  });
  it("is cables - 1 just before a full turn", () => {
    expect(cableIndex(2 * Math.PI - 1e-6, 20)).toBe(19);
  });
  it("wraps negative angles into the same turn", () => {
    expect(cableIndex(-1e-6, 20)).toBe(19);
    expect(cableIndex(2 * Math.PI, 20)).toBe(0);
  });
  it("splits the circle evenly", () => {
    expect(cableIndex(Math.PI, 8)).toBe(4);
  });
});

describe("directionSign", () => {
  it("moves pulses outward with +1 and inward with -1", () => {
    expect(directionSign("outward")).toBe(1);
    expect(directionSign("inward")).toBe(-1);
  });
});

describe("assertions", () => {
  it("accepts css variable names and rejects others with the received value", () => {
    expect(() => assertColorToken("--primary")).not.toThrow();
    expect(() => assertColorToken("primary")).toThrow(/"primary".*"--token-name"/);
  });
  it("rejects an unknown direction with the received and expected values", () => {
    expect(() => assertDirection("outward")).not.toThrow();
    expect(() => assertDirection("inward")).not.toThrow();
    expect(() => assertDirection("sideways")).toThrow(/"sideways".*"outward".*"inward"/);
  });
});

describe("stepToward", () => {
  it("approaches the target and snaps when close", () => {
    expect(stepToward(0, 1, 0.5)).toBe(0.5);
    expect(stepToward(0.9999, 1, 0.5)).toBe(1);
  });
});

describe("pointerTarget", () => {
  const rect = { left: 10, top: 20, width: 200, height: 100 };
  it("normalizes with y pointing up and clamps", () => {
    expect(pointerTarget(110, 70, rect)).toEqual({ x: 0.5, y: 0.5 });
    expect(pointerTarget(-50, 500, rect)).toEqual({ x: 0, y: 0 });
  });
  it("returns null for an empty box", () => {
    expect(pointerTarget(1, 1, { left: 0, top: 0, width: 0, height: 10 })).toBeNull();
  });
});

describe("fallbackBackground", () => {
  it("builds a conic gradient from the token with a radial mask", () => {
    const style = fallbackBackground("--primary");
    expect(style.background).toContain("repeating-conic-gradient");
    expect(style.background).toContain("var(--primary)");
    expect(style.maskImage).toContain("radial-gradient");
    expect(style.WebkitMaskImage).toBe(style.maskImage);
  });
});
