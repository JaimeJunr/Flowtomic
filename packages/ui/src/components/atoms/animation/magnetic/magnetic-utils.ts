export type MagnetRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type MagnetOffset = { x: number; y: number };

export function isInZone(rect: MagnetRect, x: number, y: number, padding: number): boolean {
  return (
    x >= rect.left - padding &&
    x <= rect.right + padding &&
    y >= rect.top - padding &&
    y <= rect.bottom + padding
  );
}

function clamp(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

export function magnetOffset(
  rect: MagnetRect,
  x: number,
  y: number,
  strength: number,
  maxOffset: number
): MagnetOffset {
  if (!(strength > 0)) {
    throw new RangeError(
      `invalid strength: received ${strength}, expected a number greater than 0`
    );
  }
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return {
    x: clamp((x - centerX) / strength, maxOffset),
    y: clamp((y - centerY) / strength, maxOffset),
  };
}
