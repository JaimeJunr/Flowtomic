export type GridSize = { cols: number; rows: number };

/** Gerador pseudoaleatório determinístico em [0, 1). */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Intensidade de um pixel de grão (0..255), a partir de r em 0..1. */
export function grainValue(r: number, contrast: number): number {
  const k = 0.4 + 0.6 * clamp(contrast, 0, 1);
  return Math.round(clamp(128 + (r - 0.5) * 255 * k, 0, 255));
}

export function gridSize(width: number, height: number, size: number): GridSize {
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error(`gridSize: received size ${JSON.stringify(size)}, expected a number > 0`);
  }
  return { cols: Math.ceil(width / size), rows: Math.ceil(height / size) };
}

export function dustCount(dust: number, area: number): number {
  return Math.max(0, Math.round((dust * area) / 4000));
}

/** Chance de nascer um risco num intervalo de dtMs. */
export function scratchChance(scratches: number, dtMs: number): number {
  return clamp(scratches * 0.3 * (dtMs / 1000), 0, 1);
}

export function scanlineAlpha(scanlines: number): number {
  return clamp(scanlines, 0, 1) * 0.25;
}
