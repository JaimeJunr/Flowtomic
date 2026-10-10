export type PixelRevealPattern =
  | "random"
  | "dither"
  | "ripple"
  | "wipe"
  | "center"
  | "edges"
  | "left-to-right"
  | "right-to-left"
  | "top-to-bottom"
  | "bottom-to-top"
  | "diagonal"
  | "spiral";
export type RevealPattern = PixelRevealPattern;
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

/** Posição de cada célula (em ordem de linha) no percurso em espiral horária, do canto superior esquerdo para dentro. */
export function spiralIndex(cols: number, rows: number): number[] {
  const result = new Array<number>(cols * rows).fill(0);
  let top = 0;
  let bottom = rows - 1;
  let left = 0;
  let right = cols - 1;
  let step = 0;
  const visit = (col: number, row: number) => {
    result[row * cols + col] = step++;
  };
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) visit(c, top);
    for (let r = top + 1; r <= bottom; r++) visit(right, r);
    if (top < bottom) for (let c = right - 1; c >= left; c--) visit(c, bottom);
    if (left < right) for (let r = bottom - 1; r > top; r--) visit(left, r);
    top++;
    bottom--;
    left++;
    right--;
  }
  return result;
}

/** Distância ao centro da grade, normalizada pela distância do centro do canto (0 no meio, 1 nos cantos). */
function centerDistance(cols: number, rows: number, i: number): number {
  const reach = Math.max(Math.hypot((cols - 1) / 2, (rows - 1) / 2), 1e-9);
  const distance = Math.hypot((i % cols) + 0.5 - cols / 2, Math.floor(i / cols) + 0.5 - rows / 2);
  return distance / reach;
}

/** Base 0..1 das ordens geométricas novas; `null` para as que não são. */
function geometricBase(pattern: PixelRevealPattern, cols: number, rows: number): number[] | null {
  const cells = Array.from({ length: cols * rows }, (_, i) => i);
  const col = (i: number) => spread(i % cols, cols);
  const row = (i: number) => spread(Math.floor(i / cols), rows);
  switch (pattern) {
    case "center":
      return cells.map((i) => centerDistance(cols, rows, i));
    case "edges":
      return cells.map((i) => 1 - centerDistance(cols, rows, i));
    case "left-to-right":
      return cells.map(col);
    case "right-to-left":
      return cells.map((i) => 1 - col(i));
    case "top-to-bottom":
      return cells.map(row);
    case "bottom-to-top":
      return cells.map((i) => 1 - row(i));
    case "diagonal":
      return cells.map((i) =>
        cols + rows > 2 ? ((i % cols) + Math.floor(i / cols)) / (cols + rows - 2) : 0
      );
    case "spiral":
      return spiralIndex(cols, rows).map((position) => spread(position, cols * rows));
    default:
      return null;
  }
}

/** Valida as opções de forma; a mensagem traz o valor recebido e o intervalo esperado. */
export function validatePixelOptions(options: {
  pixelScale: number;
  gap: number;
  pixelRadius: number;
}): void {
  const { pixelScale, gap, pixelRadius } = options;
  if (!(pixelScale >= 0 && pixelScale <= 1)) {
    throw new RangeError(`invalid pixelScale: received ${pixelScale}, expected 0..1`);
  }
  if (!(gap >= 0)) {
    throw new RangeError(`invalid gap: received ${gap}, expected >= 0`);
  }
  if (!(pixelRadius >= 0 && pixelRadius <= 50)) {
    throw new RangeError(`invalid pixelRadius: received ${pixelRadius}, expected 0..50`);
  }
}

/** Atraso normalizado (0..1) de cada célula, em ordem de linha. */
export function revealOrder(
  cols: number,
  rows: number,
  pattern: PixelRevealPattern,
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
  const geometric = geometricBase(pattern, cols, rows);
  if (geometric) return geometric.map((base) => jitter(base, randomness, rng));
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
