export type PointerState = { px: number; py: number; rx: number; ry: number };

export type RectLike = { left: number; top: number; width: number; height: number };

export const REST_STATE: PointerState = { px: 50, py: 50, rx: 0, ry: 0 };

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/** Posição do ponteiro em % do cartão e a inclinação (graus) que ela produz. */
export function pointerState(rect: RectLike, x: number, y: number, maxTilt: number): PointerState {
  if (!(rect.width > 0) || !(rect.height > 0)) {
    throw new Error(
      `invalid rect: received ${rect.width}x${rect.height}, expected width and height greater than 0`
    );
  }
  const px = clampPercent(((x - rect.left) / rect.width) * 100);
  const py = clampPercent(((y - rect.top) / rect.height) * 100);
  return {
    px,
    py,
    ry: ((px - 50) / 50) * maxTilt,
    rx: (-(py - 50) / 50) * maxTilt,
  };
}

/** Interpolação linear entre dois estados, `t` de 0 (from) a 1 (to). */
export function lerpState(from: PointerState, to: PointerState, t: number): PointerState {
  const mix = (a: number, b: number) => a + (b - a) * t;
  return {
    px: mix(from.px, to.px),
    py: mix(from.py, to.py),
    rx: mix(from.rx, to.rx),
    ry: mix(from.ry, to.ry),
  };
}
