"use client";

import { type MotionValue, motionValue } from "motion/react";
import * as React from "react";

import { CORNERS, type Corner, freeCornerOrigins } from "./target-cursor-utils";

type CornerValues = Record<Corner, { x: MotionValue<number>; y: MotionValue<number> }>;

export function createValues(size: number, cornerSize: number) {
  const origins = freeCornerOrigins(size, cornerSize);
  const corners = {} as CornerValues;
  for (const corner of CORNERS) {
    corners[corner] = { x: motionValue(origins[corner].x), y: motionValue(origins[corner].y) };
  }
  return {
    x: motionValue(0),
    y: motionValue(0),
    rotate: motionValue(0),
    scale: motionValue(1),
    dotScale: motionValue(1),
    corners,
  };
}

export function isHuman(event: PointerEvent): boolean {
  return event.pointerType === "mouse" || event.pointerType === "pen";
}

// Botões e links trazem `cursor: pointer` próprio; o cursor:none do pai não os alcança.
const HIDE_ATTRIBUTE = "data-target-cursor-hide";
const HIDE_CSS = `[${HIDE_ATTRIBUTE}], [${HIDE_ATTRIBUTE}] * { cursor: none !important; }`;

export function useHideNativeCursor(
  enabled: boolean,
  container: React.RefObject<HTMLElement | null> | undefined
) {
  React.useEffect(() => {
    if (!enabled) return;
    const node = container?.current ?? document.body;
    const previous = node.style.cursor;
    const style = document.createElement("style");
    style.textContent = HIDE_CSS;
    document.head.appendChild(style);
    node.style.cursor = "none";
    node.setAttribute(HIDE_ATTRIBUTE, "");
    return () => {
      node.style.cursor = previous;
      node.removeAttribute(HIDE_ATTRIBUTE);
      style.remove();
    };
  }, [enabled, container]);
}

export type CursorValues = ReturnType<typeof createValues>;
