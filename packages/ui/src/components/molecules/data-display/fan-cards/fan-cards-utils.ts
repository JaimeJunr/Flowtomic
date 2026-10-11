export type Pose = { x: number; y: number; rotate: number };

export type RestOptions = { spread: number; rotation: number; arc: number };

export const MIN_ITEMS = 1;
export const MAX_ITEMS = 12;

// Padrão fixo de inclinação: parece pilha solta, mas é determinístico (mesmo índice, mesma pose).
const ROTATION_PATTERN = [-1, 0.4, -0.6, 0.8, -0.3, 1, -0.8];

export function assertItemCount(count: number): void {
  if (!Number.isInteger(count) || count < MIN_ITEMS || count > MAX_ITEMS) {
    throw new RangeError(
      `FanCards: "items" must have between ${MIN_ITEMS} and ${MAX_ITEMS} entries, received ${count}`
    );
  }
}

export function assertBounciness(value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`FanCards: "bounciness" must be between 0 and 1, received ${value}`);
  }
}

export function restPose(index: number, count: number, options: RestOptions): Pose {
  const half = (count - 1) / 2;
  const offset = index - half;
  const ratio = offset / Math.max(1, half);
  return {
    x: offset * options.spread,
    y: options.arc * ratio * ratio || 0, // normaliza -0
    rotate: options.rotation * ROTATION_PATTERN[index % ROTATION_PATTERN.length],
  };
}

export function focusPose(
  index: number,
  hovered: number | null,
  rest: Pose,
  pushDistance: number
): Pose {
  if (hovered === null) return rest;
  if (index === hovered) return { x: rest.x, y: 0, rotate: 0 };
  return { ...rest, x: rest.x + (index < hovered ? -pushDistance : pushDistance) };
}

export function stackOrder(index: number, count: number, hovered: number | null): number {
  if (hovered === index) return count + 1;
  return Math.round(count - Math.abs(index - (count - 1) / 2) * 2);
}

// bounciness 0 -> amortecimento 26 (sem passar do alvo); 1 -> 9 (quique forte).
export function entrySpring(bounciness: number): {
  type: "spring";
  stiffness: number;
  damping: number;
} {
  return { type: "spring", stiffness: 260, damping: 26 - 17 * bounciness };
}
