export type StarDirection = "clockwise" | "counterclockwise";
export type StarHoverMode = "lap" | "brighten" | "reveal" | "none";

export type TrailSegment = {
  length: number;
  opacity: number;
  /** Posição (0..1 do perímetro) onde o traço começa. */
  start: number;
  dashArray: string;
  dashOffset: number;
};

export type BoxSize = { width: number; height: number };

export const MAX_STARS = 6;
export const LAP_MS = 600;

// Gradiente não acompanha o caminho: o desbotar é feito com 3 traços sobrepostos.
const TRAIL_LAYERS: ReadonlyArray<{ scale: number; opacity: number }> = [
  { scale: 1, opacity: 0.25 },
  { scale: 0.6, opacity: 0.5 },
  { scale: 0.25, opacity: 1 },
];

const REST_OPACITY_BRIGHTEN = 0.8;
const BRIGHTEN_GLOW_FACTOR = 1.6;
const GLOW_PX_AT_FULL = 8;

function wrapUnit(value: number): number {
  return ((value % 1) + 1) % 1;
}

/** Traços alinhados pela ponta (`head`); no anti-horário o rastro fica à frente da cabeça. */
export function trailSegments(
  trailLength: number,
  head: number,
  direction: StarDirection
): TrailSegment[] {
  if (!Number.isFinite(trailLength) || trailLength < 0 || trailLength > 1) {
    throw new Error(
      `trailSegments: received trailLength ${trailLength}, expected a number in 0..1`
    );
  }
  return TRAIL_LAYERS.map(({ scale, opacity }) => {
    const length = trailLength * scale;
    const start = direction === "clockwise" ? wrapUnit(head - length) : wrapUnit(head);
    return {
      length,
      opacity,
      start,
      dashArray: `${length} ${1 - length}`,
      dashOffset: -start,
    };
  });
}

type Piece =
  | { kind: "line"; ax: number; ay: number; bx: number; by: number; length: number }
  | { kind: "arc"; cx: number; cy: number; from: number; length: number };

function buildPieces(w: number, h: number, r: number): Piece[] {
  const line = (ax: number, ay: number, bx: number, by: number): Piece => ({
    kind: "line",
    ax,
    ay,
    bx,
    by,
    length: Math.hypot(bx - ax, by - ay),
  });
  const arc = (cx: number, cy: number, from: number): Piece => ({
    kind: "arc",
    cx,
    cy,
    from,
    length: (r * Math.PI) / 2,
  });
  const half = Math.PI / 2;
  return [
    line(r, 0, w - r, 0),
    arc(w - r, r, -half),
    line(w, r, w, h - r),
    arc(w - r, h - r, 0),
    line(w - r, h, r, h),
    arc(r, h - r, half),
    line(0, h - r, 0, r),
    arc(r, r, Math.PI),
  ];
}

function closestOnPiece(piece: Piece, r: number, x: number, y: number) {
  if (piece.kind === "line") {
    const dx = piece.bx - piece.ax;
    const dy = piece.by - piece.ay;
    const sq = dx * dx + dy * dy;
    const t =
      sq === 0 ? 0 : Math.max(0, Math.min(1, ((x - piece.ax) * dx + (y - piece.ay) * dy) / sq));
    const px = piece.ax + dx * t;
    const py = piece.ay + dy * t;
    return { distance: Math.hypot(x - px, y - py), along: t * piece.length };
  }
  const half = Math.PI / 2;
  let t = Math.atan2(y - piece.cy, x - piece.cx) - piece.from;
  t = Math.atan2(Math.sin(t), Math.cos(t));
  t = Math.max(0, Math.min(half, t));
  const a = piece.from + t;
  const px = piece.cx + r * Math.cos(a);
  const py = piece.cy + r * Math.sin(a);
  return { distance: Math.hypot(x - px, y - py), along: t * r };
}

/** Fração (0..1) do perímetro do retângulo arredondado mais próxima do ponto; origem no meio do lado de cima, sentido horário. */
export function perimeterFraction(box: BoxSize, radius: number, x: number, y: number): number {
  if (!(box.width > 0) || !(box.height > 0)) return 0;
  const r = Math.max(0, Math.min(radius, box.width / 2, box.height / 2));
  const pieces = buildPieces(box.width, box.height, r);
  const total = pieces.reduce((sum, p) => sum + p.length, 0);
  let best = { distance: Number.POSITIVE_INFINITY, position: 0 };
  let walked = 0;
  for (const piece of pieces) {
    const hit = closestOnPiece(piece, r, x, y);
    if (hit.distance < best.distance)
      best = { distance: hit.distance, position: walked + hit.along };
    walked += piece.length;
  }
  return best.position / total;
}

/** Fase (0..1) da órbita depois de `elapsedMs`, com uma volta a cada `durationSeconds`. */
export function orbitPhase(elapsedMs: number, durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error(
      `orbitPhase: received duration ${durationSeconds}, expected a number > 0 (seconds)`
    );
  }
  return wrapUnit(elapsedMs / (durationSeconds * 1000));
}

/** Volta extra do hover "lap": 0 a 1 em LAP_MS, suavizada; ao fim, 1 volta inteira não muda a fase. */
export function lapBoost(sinceMs: number): number {
  const t = Math.max(0, Math.min(1, sinceMs / LAP_MS));
  return t * t * (3 - 2 * t);
}

export function clampStars(stars: number): number {
  if (!Number.isFinite(stars)) return 1;
  return Math.max(1, Math.min(MAX_STARS, Math.round(stars)));
}

export function starOpacity(mode: StarHoverMode, active: boolean): number {
  if (mode === "reveal") return active ? 1 : 0;
  if (mode === "brighten") return active ? 1 : REST_OPACITY_BRIGHTEN;
  return 1;
}

export function starGlow(mode: StarHoverMode, glow: number, active: boolean): number {
  return mode === "brighten" && active ? glow * BRIGHTEN_GLOW_FACTOR : glow;
}

export function glowFilter(glow: number, color: string): string {
  const px = Math.round(Math.max(0, glow) * GLOW_PX_AT_FULL * 100) / 100;
  return `drop-shadow(0 0 ${px}px ${color})`;
}
