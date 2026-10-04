"use client";

import { MotionConfigContext, useReducedMotion } from "motion/react";
import * as React from "react";

export function useShouldReduceMotion(): boolean {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = React.useContext(MotionConfigContext).reducedMotion;
  // useReducedMotion do motion ignora <MotionConfig reducedMotion="always">.
  return Boolean(prefersReducedMotion || reducedMotion === "always");
}
