export const MAX_OVERFLOW = 50;

export type TrackRect = Pick<DOMRect, "left" | "right" | "width">;

export function assertRange(min: number, max: number): void {
  if (!(min < max)) {
    throw new Error(`ElasticSlider: received min=${min} and max=${max}, expected min < max`);
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Evita ruído de ponto flutuante (0.1 + 0.2) no valor exibido e emitido.
function tidy(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

export function snapToStep(value: number, min: number, max: number, step: number): number {
  const clamped = clamp(value, min, max);
  if (step <= 0) return tidy(clamped);
  return tidy(clamp(min + Math.round((clamped - min) / step) * step, min, max));
}

export function valueFromPointer(
  x: number,
  rect: TrackRect,
  min: number,
  max: number,
  step: number
): number {
  assertRange(min, max);
  const ratio = rect.width > 0 ? clamp((x - rect.left) / rect.width, 0, 1) : 0;
  return snapToStep(min + ratio * (max - min), min, max, step);
}

export function overflowFromPointer(x: number, rect: TrackRect): number {
  if (x < rect.left) return x - rect.left;
  if (x > rect.right) return x - rect.right;
  return 0;
}

export function decay(overflow: number, maxOverflow: number = MAX_OVERFLOW): number {
  return maxOverflow * (2 / (1 + Math.exp(-overflow / maxOverflow)) - 1);
}

export function percentOf(value: number, min: number, max: number): number {
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

export function keyboardStep(step: number, min: number, max: number): number {
  return step > 0 ? step : (max - min) / 100;
}

export function nextValueFromKey(
  key: string,
  current: number,
  min: number,
  max: number,
  step: number
): number | null {
  const unit = keyboardStep(step, min, max);
  const deltas: Record<string, number> = {
    ArrowLeft: -unit,
    ArrowDown: -unit,
    ArrowRight: unit,
    ArrowUp: unit,
    PageDown: -unit * 10,
    PageUp: unit * 10,
  };
  if (key === "Home") return min;
  if (key === "End") return max;
  if (!(key in deltas)) return null;
  return snapToStep(current + deltas[key], min, max, step);
}
