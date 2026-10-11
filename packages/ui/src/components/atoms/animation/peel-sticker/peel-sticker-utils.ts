export type StickerPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

const MAX_FRACTION = 0.9;
const EDGE_MARGIN = 16;

export function clampFraction(fraction: number): number {
  return Math.min(MAX_FRACTION, Math.max(0, fraction));
}

export function peelGeometry(height: number, fraction: number) {
  if (!Number.isFinite(height) || height <= 0) {
    throw new Error(`peelGeometry: height must be > 0, received ${height}`);
  }
  if (!Number.isFinite(fraction)) {
    throw new Error(`peelGeometry: fraction must be a finite number, received ${fraction}`);
  }
  const clamped = clampFraction(fraction);
  const flapHeight = height * clamped;
  return { clipBottomPct: clamped * 100, flapHeight, foldY: height - flapHeight };
}

export function normalizeDirection(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

/** Altura do adesivo medida ao longo do eixo da dobra (maior nas diagonais). */
export function peelExtent(width: number, direction: number): number {
  const rad = (normalizeDirection(direction) * Math.PI) / 180;
  return width * (Math.abs(Math.cos(rad)) + Math.abs(Math.sin(rad)));
}

export function foldShadowOpacity(intensity: number, fraction: number): number {
  return Math.min(1, Math.max(0, intensity * fraction * 2));
}

export function dropShadowFor(intensity: number, fraction: number): string {
  const strength = Math.round(Math.min(1, Math.max(0, intensity)) * (25 + fraction * 40));
  const offset = (2 + fraction * 8).toFixed(1);
  const blur = (3 + fraction * 8).toFixed(1);
  return `drop-shadow(0 ${offset}px ${blur}px color-mix(in oklch, var(--foreground) ${strength}%, transparent))`;
}

/** Deslocamento permitido para o item continuar dentro da área; 0 se não couber. */
export function clampMove(
  delta: number,
  itemStart: number,
  itemEnd: number,
  areaStart: number,
  areaEnd: number
): number {
  const lo = areaStart - itemStart;
  const hi = areaEnd - itemEnd;
  if (lo > hi) return 0;
  return Math.min(hi, Math.max(lo, delta));
}

export function placementStyle(position: StickerPosition, width: number): React.CSSProperties {
  switch (position) {
    case "top-left":
      return { top: EDGE_MARGIN, left: EDGE_MARGIN };
    case "top-right":
      return { top: EDGE_MARGIN, right: EDGE_MARGIN };
    case "bottom-left":
      return { bottom: EDGE_MARGIN, left: EDGE_MARGIN };
    case "bottom-right":
      return { bottom: EDGE_MARGIN, right: EDGE_MARGIN };
    default:
      return { top: "50%", left: "50%", marginTop: -width / 2, marginLeft: -width / 2 };
  }
}
