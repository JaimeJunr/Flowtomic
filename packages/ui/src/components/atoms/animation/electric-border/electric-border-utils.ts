export type BorderPoint = {
  x: number;
  y: number;
  /** Normal unitária apontando para fora do contorno. */
  nx: number;
  ny: number;
  /** Posição acumulada no perímetro, em px. */
  s: number;
};

function assertPositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(
      `roundedRectPoints: ${name} received ${JSON.stringify(value)}, expected a number > 0`
    );
  }
}

/** Perímetro de um retângulo arredondado, com o raio já limitado à metade do menor lado. */
export function roundedRectPerimeter(w: number, h: number, r: number): number {
  const radius = Math.min(r, w / 2, h / 2);
  return 2 * (w - 2 * radius) + 2 * (h - 2 * radius) + 2 * Math.PI * radius;
}

type Segment = { length: number; at: (d: number) => Omit<BorderPoint, "s"> };

function buildSegments(w: number, h: number, r: number): Segment[] {
  const arc = (cx: number, cy: number, start: number): Segment => ({
    length: (Math.PI / 2) * r,
    at: (d) => {
      const a = start + (r > 0 ? d / r : 0);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      return { x: cx + nx * r, y: cy + ny * r, nx, ny };
    },
  });
  const line = (
    x: number,
    y: number,
    dx: number,
    dy: number,
    len: number,
    nx: number,
    ny: number
  ): Segment => ({
    length: len,
    at: (d) => ({ x: x + dx * d, y: y + dy * d, nx, ny }),
  });
  return [
    line(r, 0, 1, 0, w - 2 * r, 0, -1),
    arc(w - r, r, -Math.PI / 2),
    line(w, r, 0, 1, h - 2 * r, 1, 0),
    arc(w - r, h - r, 0),
    line(w - r, h, -1, 0, w - 2 * r, 0, 1),
    arc(r, h - r, Math.PI / 2),
    line(0, h - r, 0, -1, h - 2 * r, -1, 0),
    arc(r, r, Math.PI),
  ];
}

/**
 * Pontos igualmente espaçados (~step px) ao longo do perímetro, começando no início da borda de
 * cima (depois do canto), no sentido horário.
 */
export function roundedRectPoints(w: number, h: number, r: number, step: number): BorderPoint[] {
  assertPositive("step", step);
  if (!(w > 0) || !(h > 0)) return [];
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  const total = roundedRectPerimeter(w, h, radius);
  const count = Math.max(4, Math.round(total / step));
  const segments = buildSegments(w, h, radius);
  const points: BorderPoint[] = [];
  let index = 0;
  let consumed = 0;
  for (let i = 0; i < count; i++) {
    const s = (i * total) / count;
    while (index < segments.length - 1 && s >= consumed + segments[index].length) {
      consumed += segments[index].length;
      index++;
    }
    points.push({ ...segments[index].at(s - consumed), s });
  }
  return points;
}

/** Hash inteiro determinístico para -1..1. */
function lattice(i: number, seed: number): number {
  let n = (Math.imul(i, 374761393) + Math.imul(seed | 0, 668265263)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return ((n >>> 0) / 4294967295) * 2 - 1;
}

const smooth = (t: number): number => t * t * (3 - 2 * t);

function octave(x: number, seed: number): number {
  const i = Math.floor(x);
  const t = smooth(x - i);
  return lattice(i, seed) * (1 - t) + lattice(i + 1, seed) * t;
}

/** Ruído de valor suave com 2 oitavas; resultado em -1..1. */
export function valueNoise(x: number, seed = 0): number {
  return (octave(x, seed) * 0.65 + octave(x * 2.3 + 17.1, seed + 1) * 0.35) / 1;
}

/**
 * Ruído periódico no perímetro: o início e o fim se encontram, sem emenda visível. Mistura o ruído
 * da posição com o da posição deslocada de um perímetro.
 */
export function periodicNoise(
  s: number,
  length: number,
  freq: number,
  time: number,
  seed = 0
): number {
  const f = (pos: number) => valueNoise(pos * freq + time, seed);
  const k = s / length;
  return f(s) * (1 - k) + f(s - length) * k;
}

export const MAX_AMPLITUDE = 40;
export const NOISE_FREQ = 0.02;

/** Ponto deformado: anda ao longo da normal pelo ruído. */
export function displacePoint(
  p: BorderPoint,
  length: number,
  time: number,
  chaos: number
): { x: number; y: number } {
  const offset = periodicNoise(p.s, length, NOISE_FREQ, time) * chaos * MAX_AMPLITUDE;
  return { x: p.x + p.nx * offset, y: p.y + p.ny * offset };
}
