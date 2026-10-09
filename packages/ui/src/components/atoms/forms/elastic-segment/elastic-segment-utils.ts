import type * as React from "react";

export type Rect = { left: number; width: number };
export type Edges = { left: number; right: number };

export type ElasticSegmentItem =
  | string
  | { value: string; label: React.ReactNode; icon?: React.ReactNode };

export type NormalizedItem = { value: string; label: React.ReactNode; icon?: React.ReactNode };

export type EdgeMove = { edge: "left" | "right"; target: number; delay: number };
export type BackEdgeMove = EdgeMove & { overshoot: number };
export type StretchPhases = { front: EdgeMove; back: BackEdgeMove };

/** Atraso máximo (ms) da borda de trás quando stretch = 100. */
const MAX_STRETCH_DELAY_MS = 140;
/** Quanto da velocidade (px/s) um lançamento carrega, em segundos, com glide = 100. */
const MAX_FLING_SECONDS = 0.25;

export function normalizeItems(items: ElasticSegmentItem[]): NormalizedItem[] {
  return items.map((item) =>
    typeof item === "string"
      ? { value: item, label: item, icon: undefined }
      : { value: item.value, label: item.label, icon: item.icon }
  );
}

export function segmentEdges(rects: Rect[], index: number): Edges {
  const rect = rects[index];
  if (!rect) {
    throw new Error(
      `segmentEdges: received index ${index}, expected an integer between 0 and ${rects.length - 1}`
    );
  }
  return { left: rect.left, right: rect.left + rect.width };
}

/** Alvos e atrasos de cada borda: a da frente sai já; a de trás espera e passa `squash` px do destino. */
export function stretchPhases(
  from: Edges,
  to: Edges,
  stretch: number,
  squash: number
): StretchPhases {
  const delay = (Math.min(100, Math.max(0, stretch)) / 100) * MAX_STRETCH_DELAY_MS;
  const movingRight = to.left + to.right >= from.left + from.right;
  if (movingRight) {
    return {
      front: { edge: "right", target: to.right, delay: 0 },
      back: { edge: "left", target: to.left, overshoot: to.left + squash, delay },
    };
  }
  return {
    front: { edge: "left", target: to.left, delay: 0 },
    back: { edge: "right", target: to.right, overshoot: to.right - squash, delay },
  };
}

/** Índice do segmento cujo centro está mais perto de `x`. */
export function nearestIndex(rects: Rect[], x: number): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  rects.forEach((rect, index) => {
    const distance = Math.abs(x - (rect.left + rect.width / 2));
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

/** Destino de um arrasto solto: `x` é o centro do thumb, `velocity` em px/s. */
export function resolveFling(rects: Rect[], x: number, velocity: number, glide: number): number {
  const factor = (Math.min(100, Math.max(0, glide)) / 100) * MAX_FLING_SECONDS;
  return nearestIndex(rects, x + velocity * factor);
}
