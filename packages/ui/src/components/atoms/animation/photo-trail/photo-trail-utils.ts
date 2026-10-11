import * as React from "react";

export type PhotoTrailVariant = "pop" | "drift" | "tilt";
export type Point = { x: number; y: number };

export type PhotoTrailPhoto = { src: string; alt?: string };
export type PhotoTrailItem = PhotoTrailPhoto | React.ReactNode;

export type MotionTarget = {
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
};

export function shouldSpawn(last: Point, current: Point, spacing: number): boolean {
  return Math.hypot(current.x - last.x, current.y - last.y) >= spacing;
}

/** Vetor do último trecho, normalizado e escalado pelo espaçamento. */
export function moveVector(last: Point, current: Point, spacing: number) {
  const length = Math.hypot(current.x - last.x, current.y - last.y);
  if (length === 0) return { dx: 0, dy: 0 };
  return {
    dx: ((current.x - last.x) / length) * spacing,
    dy: ((current.y - last.y) / length) * spacing,
  };
}

const MAX_TILT = 15;

function clamp(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

export function variantMotion(variant: PhotoTrailVariant, dx: number, dy: number) {
  if (variant === "drift") {
    return {
      initial: { x: -dx * 0.5, y: -dy * 0.5, opacity: 0 },
      animate: { x: 0, y: 0, opacity: 1 },
      exit: { x: dx * 0.8, y: dy * 0.8, opacity: 0 },
    } satisfies Record<string, MotionTarget>;
  }
  if (variant === "tilt") {
    const angle = clamp((Math.atan2(dy, dx) * 180) / Math.PI, MAX_TILT);
    return {
      initial: { scale: 0.6, rotate: angle, opacity: 0 },
      animate: { scale: 1, rotate: angle, opacity: 1 },
      exit: { y: 40, rotate: angle * 2, opacity: 0 },
    } satisfies Record<string, MotionTarget>;
  }
  return {
    initial: { scale: 0.4, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.2, opacity: 0 },
  } satisfies Record<string, MotionTarget>;
}

export function nextIndex(current: number, length: number): number {
  if (length < 1) {
    throw new Error(`PhotoTrail: items deve ter pelo menos 1 item, recebeu ${length}`);
  }
  return (current + 1) % length;
}

/** Separa os mais recentes (kept) dos que passam do limite (dropped). */
export function trimCards<T>(cards: T[], max: number) {
  const overflow = Math.max(0, cards.length - max);
  return { kept: cards.slice(overflow), dropped: cards.slice(0, overflow) };
}

export function isPhotoItem(item: unknown): item is PhotoTrailPhoto {
  if (typeof item !== "object" || item === null || React.isValidElement(item)) return false;
  return typeof (item as { src?: unknown }).src === "string";
}
