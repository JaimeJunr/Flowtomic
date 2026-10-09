export type RevealPattern = "random" | "dither" | "ripple" | "wipe";
export type Origin = { x: number; y: number };
export type Edge = "left" | "right" | "top" | "bottom";
export type Rng = () => number;

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;
const BAYER_MAX = 15;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Posição normalizada (0..1) de um índice numa faixa de `count` células. */
const spread = (index: number, count: number) => (count > 1 ? index / (count - 1) : 0);

/** Mistura a distância com ruído: randomness 0 é determinístico, 1 é só ruído. */
const jitter = (base: number, randomness: number, rng: Rng) => {
  const mix = clamp01(randomness);
  return clamp01(base * (1 - mix) + rng() * mix);
};

function shuffled(count: number, rng: Rng): number[] {
  const ranks = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
  }
  return ranks.map((rank) => spread(rank, count));
}

export function nearestEdge(origin: Origin): Edge {
  const distances: Array<[Edge, number]> = [
    ["left", origin.x],
    ["right", 1 - origin.x],
    ["top", origin.y],
    ["bottom", 1 - origin.y],
  ];
  return distances.reduce((best, item) => (item[1] < best[1] ? item : best))[0];
}

function rippleOrder(cols: number, rows: number, origin: Origin, randomness: number, rng: Rng) {
  const ox = Math.min(cols - 1, Math.floor(clamp01(origin.x) * cols)) + 0.5;
  const oy = Math.min(rows - 1, Math.floor(clamp01(origin.y) * rows)) + 0.5;
  const reach = Math.max(
    ...[0.5, cols - 0.5].flatMap((x) => [0.5, rows - 0.5].map((y) => Math.hypot(x - ox, y - oy))),
    1e-9
  );
  return Array.from({ length: cols * rows }, (_, i) => {
    const distance = Math.hypot((i % cols) + 0.5 - ox, Math.floor(i / cols) + 0.5 - oy);
    return jitter(distance / reach, randomness, rng);
  });
}

function wipeOrder(cols: number, rows: number, origin: Origin, randomness: number, rng: Rng) {
  const edge = nearestEdge(origin);
  return Array.from({ length: cols * rows }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const along = {
      left: spread(col, cols),
      right: 1 - spread(col, cols),
      top: spread(row, rows),
      bottom: 1 - spread(row, rows),
    }[edge];
    return jitter(along, randomness, rng);
  });
}

/** Atraso normalizado (0..1) de cada célula, em ordem de linha. */
export function revealOrder(
  cols: number,
  rows: number,
  pattern: RevealPattern,
  origin: Origin,
  randomness: number,
  rng: Rng
): number[] {
  if (!(cols >= 1) || !(rows >= 1)) {
    throw new RangeError(`invalid grid: received cols=${cols}, rows=${rows}, expected both >= 1`);
  }
  if (pattern === "random") return shuffled(cols * rows, rng);
  if (pattern === "dither") {
    return Array.from(
      { length: cols * rows },
      (_, i) => BAYER_4[Math.floor(i / cols) % 4][(i % cols) % 4] / BAYER_MAX
    );
  }
  if (pattern === "ripple") return rippleOrder(cols, rows, origin, randomness, rng);
  return wipeOrder(cols, rows, origin, randomness, rng);
}

/** Linhas da grade para manter células quadradas; sem medida, assume card quadrado. */
export function gridRows(cols: number, width: number, height: number): number {
  if (!(width > 0) || !(height > 0)) return cols;
  return Math.max(1, Math.round((cols * height) / width));
}

/** Converte "16 / 9", "4:3" ou "2" em largura/altura; inválido vira 1. */
export function parseAspectRatio(value: string): number {
  const [w, h = "1"] = value.split(/[/:]/);
  const ratio = Number.parseFloat(w) / Number.parseFloat(h);
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
}

export function pointerOrigin(
  rect: { left: number; top: number; width: number; height: number },
  clientX: number,
  clientY: number
): Origin {
  if (!(rect.width > 0) || !(rect.height > 0)) return { x: 0.5, y: 0.5 };
  return {
    x: clamp01((clientX - rect.left) / rect.width),
    y: clamp01((clientY - rect.top) / rect.height),
  };
}
