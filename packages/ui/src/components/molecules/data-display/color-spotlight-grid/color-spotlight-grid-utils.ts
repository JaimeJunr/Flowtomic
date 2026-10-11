export type Rect = { left: number; top: number; right: number; bottom: number };

/** Tempo, em segundos, que o holofote leva para abrir ao entrar na grade. */
export const ENTER_SECONDS = 0.25;

export const MAX_DAMPING = 0.95;
export const MIN_COLUMNS = 1;
export const MAX_COLUMNS = 6;

function assertRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(
      `ColorSpotlightGrid: ${name} received ${JSON.stringify(value)}, expected a number between ${min} and ${max}`
    );
  }
}

export type GridSettings = {
  columns: number;
  softness: number;
  damping: number;
  grayscale: number;
  dim: number;
};

export function validateSettings({
  columns,
  softness,
  damping,
  grayscale,
  dim,
}: GridSettings): void {
  if (!Number.isInteger(columns)) {
    throw new Error(
      `ColorSpotlightGrid: columns received ${JSON.stringify(columns)}, expected an integer between ${MIN_COLUMNS} and ${MAX_COLUMNS}`
    );
  }
  assertRange("columns", columns, MIN_COLUMNS, MAX_COLUMNS);
  assertRange("softness", softness, 0, 1);
  assertRange("grayscale", grayscale, 0, 1);
  assertRange("dim", dim, 0, 1);
  assertRange("damping", damping, 0, MAX_DAMPING);
}

/** Máscara radial do holofote: opaca até `(1 - softness)` do raio, some na borda. */
export function spotMask(softness: number): string {
  const inner = Math.round((1 - softness) * 10000) / 100;
  return `radial-gradient(circle var(--r) at var(--x) var(--y), black ${inner}%, transparent 100%)`;
}

/** Aproxima `pos` de `target`; com damping 0 chega em um passo. */
export function stepToward(pos: number, target: number, damping: number): number {
  return pos + (target - pos) * (1 - damping);
}

export function gridTemplateColumns(columns: number, gap: number, minCardWidth: number): string {
  const share = `calc((100% - ${gap * (columns - 1)}px) / ${columns})`;
  return `repeat(auto-fill, minmax(max(${minCardWidth}px, ${share}), 1fr))`;
}

/** 1 com o ponto dentro do retângulo, caindo a 0 a `radius` px de distância. */
export function proximity(rect: Rect, x: number, y: number, radius: number): number {
  if (radius <= 0) return 0;
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.max(0, 1 - Math.hypot(dx, dy) / radius);
}

/** Avança o raio do holofote em linha reta: abre em ENTER_SECONDS, fecha em fadeOut. */
export function radiusStep(
  current: number,
  radius: number,
  entering: boolean,
  dtMs: number,
  fadeOut: number
): number {
  const seconds = entering ? ENTER_SECONDS : fadeOut;
  if (seconds <= 0) return entering ? radius : 0;
  const delta = (radius * dtMs) / (seconds * 1000);
  return entering ? Math.min(radius, current + delta) : Math.max(0, current - delta);
}
