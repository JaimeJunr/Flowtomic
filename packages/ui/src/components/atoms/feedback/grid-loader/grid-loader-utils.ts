export type GridLoaderPattern =
  | "orbit"
  | "spiral"
  | "snake"
  | "ripple"
  | "arrow"
  | "dots"
  | "sweep"
  | "spin"
  | "rain"
  | "pulse";

export type GridSize = 3 | 4;

export type CustomPattern = { delays: (number | null)[]; loop?: number };

export type PatternDefinition = { delays: (number | null)[]; loop: number };

/** Ordem em que o anel externo é percorrido no sentido horário (índices linha*grade+coluna). */
function ringOrder(grid: number): number[] {
  const last = grid - 1;
  const order: number[] = [];
  for (let c = 0; c < grid; c++) order.push(c);
  for (let r = 1; r < grid; r++) order.push(r * grid + last);
  for (let c = last - 1; c >= 0; c--) order.push(last * grid + c);
  for (let r = last - 1; r > 0; r--) order.push(r * grid);
  return order;
}

function fromOrder(grid: number, order: number[], loop: number): PatternDefinition {
  const delays: (number | null)[] = Array(grid * grid).fill(null);
  order.forEach((cell, step) => {
    delays[cell] = step;
  });
  return { delays, loop };
}

function byCell(grid: number, delay: (row: number, col: number) => number | null, loop: number) {
  const delays: (number | null)[] = [];
  for (let r = 0; r < grid; r++) for (let c = 0; c < grid; c++) delays.push(delay(r, c));
  return { delays, loop } satisfies PatternDefinition;
}

function snakeOrder(grid: number): number[] {
  const order: number[] = [];
  for (let r = 0; r < grid; r++) {
    const cols = Array.from({ length: grid }, (_, c) => c);
    if (r % 2 === 1) cols.reverse();
    for (const c of cols) order.push(r * grid + c);
  }
  return order;
}

/** Espiral para dentro: anel externo e depois o miolo. */
function spiralOrder3(): number[] {
  return [...ringOrder(3), 4];
}

// Chuva usa atrasos por coluna fixos (sem Math.random) para o render ser estável.
const RAIN_COLUMN_OFFSETS = [2, 0, 3, 1];

const PATTERNS_3: Partial<Record<GridLoaderPattern, PatternDefinition>> = {
  orbit: fromOrder(3, ringOrder(3), 8),
  spiral: fromOrder(3, spiralOrder3(), 9),
  snake: fromOrder(3, snakeOrder(3), 9),
  ripple: byCell(3, (r, c) => Math.abs(r - 1) + Math.abs(c - 1), 3),
  arrow: byCell(3, (r, c) => (c === 1 ? 2 - r : r === 1 ? 1 : null), 4),
  dots: byCell(3, (r, c) => r + c, 5),
};

const PATTERNS_4: Partial<Record<GridLoaderPattern, PatternDefinition>> = {
  sweep: byCell(4, (_, c) => c, 5),
  spin: fromOrder(4, [...ringOrder(4), 5, 6, 10, 9], 16),
  rain: byCell(4, (r, c) => RAIN_COLUMN_OFFSETS[c] + r, 8),
  pulse: byCell(4, (r, c) => (r > 0 && r < 3 && c > 0 && c < 3 ? 0 : 1), 3),
  orbit: fromOrder(4, ringOrder(4), 12),
  snake: fromOrder(4, snakeOrder(4), 16),
};

export const PATTERNS: Record<GridSize, Partial<Record<GridLoaderPattern, PatternDefinition>>> = {
  3: PATTERNS_3,
  4: PATTERNS_4,
};

export const CHECK_MASK: Record<GridSize, number[]> = {
  3: [0, 0, 1, 1, 0, 1, 0, 1, 0],
  4: [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
};

export const CROSS_MASK: Record<GridSize, number[]> = {
  3: [1, 0, 1, 0, 1, 0, 1, 0, 1],
  4: [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1],
};

/** Células que ficam meio acesas quando o movimento é reduzido. */
export const REDUCED_CENTER: Record<GridSize, number[]> = { 3: [4], 4: [5, 6, 9, 10] };

export function resolvePattern(
  pattern: GridLoaderPattern | CustomPattern,
  grid: GridSize
): PatternDefinition {
  const expected = grid * grid;
  if (typeof pattern === "string") {
    const found = PATTERNS[grid][pattern];
    if (!found) {
      throw new Error(
        `GridLoader: pattern ${JSON.stringify(pattern)} is not available for grid ${grid}x${grid}, expected one of ${Object.keys(PATTERNS[grid]).join(", ")}`
      );
    }
    return found;
  }
  if (pattern.delays.length !== expected) {
    throw new Error(
      `GridLoader: custom pattern received ${pattern.delays.length} delays, expected ${expected} for grid ${grid}x${grid}`
    );
  }
  const maxDelay = Math.max(0, ...pattern.delays.map((d) => d ?? 0));
  return { delays: pattern.delays, loop: pattern.loop ?? maxDelay + 3 };
}

const secondsFormat = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatSeconds(seconds: number): string {
  return secondsFormat.format(seconds);
}

export function formatElapsed(seconds: number): string {
  return `${formatSeconds(seconds)} s`;
}
