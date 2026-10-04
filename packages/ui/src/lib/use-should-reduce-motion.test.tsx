import { renderHook } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { useShouldReduceMotion } from "./use-should-reduce-motion";

describe("useShouldReduceMotion", () => {
  it("returns false by default", () => {
    expect(renderHook(useShouldReduceMotion).result.current).toBe(false);
  });
  it.each([
    ["always", true],
    ["never", false],
  ] as const)("respects MotionConfig %s", (reducedMotion, expected) => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>
    );
    expect(renderHook(useShouldReduceMotion, { wrapper }).result.current).toBe(expected);
  });
});
