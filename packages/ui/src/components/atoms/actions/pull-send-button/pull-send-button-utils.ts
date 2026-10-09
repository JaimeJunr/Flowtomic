export type PullAxis = "any" | "horizontal" | "vertical";

export type PullVector = { x: number; y: number; distance: number };

export type BurstParticle = {
  /** Graus; 0 = direita, -90 = para cima (eixo y da tela cresce para baixo). */
  angle: number;
  distance: number;
  size: number;
  /** Segundos. */
  delay: number;
};

const OFF_AXIS_FACTOR = 0.15;
const MIN_BAND_WIDTH = 1;
const MAX_BAND_WIDTH = 4;

function assertPositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`invalid ${name}: received ${name} ${value}, expected a number > 0`);
  }
}

/** Puxão com resistência crescente: quase linear perto, assintótico em maxPull. */
export function resistPull(dx: number, dy: number, maxPull: number, axis: PullAxis): PullVector {
  assertPositive("maxPull", maxPull);
  const rawX = axis === "vertical" ? dx * OFF_AXIS_FACTOR : dx;
  const rawY = axis === "horizontal" ? dy * OFF_AXIS_FACTOR : dy;
  const raw = Math.hypot(rawX, rawY);
  if (raw === 0) return { x: 0, y: 0, distance: 0 };
  const distance = maxPull * (1 - Math.exp(-raw / maxPull));
  const scale = distance / raw;
  return { x: rawX * scale, y: rawY * scale, distance };
}

/** Elástico afina conforme estica. */
export function bandWidth(distance: number, maxPull: number): number {
  assertPositive("maxPull", maxPull);
  const ratio = Math.min(Math.max(distance / maxPull, 0), 1);
  return Math.max(MIN_BAND_WIDTH, MAX_BAND_WIDTH * (1 - ratio));
}

export function isLoaded(distance: number, armAt: number): boolean {
  return distance >= armAt;
}

/** Gera a rajada de partículas num cone; `rng` injetável devolve valores em [0, 1). */
export function burst(
  count: number,
  angle: number,
  spread: number,
  flight: number,
  rng: () => number
): BurstParticle[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`invalid count: received count ${count}, expected an integer >= 0`);
  }
  return Array.from({ length: count }, () => ({
    angle: angle + (rng() - 0.5) * spread,
    distance: flight * (0.5 + rng() * 0.5),
    size: 3 + rng() * 3,
    delay: rng() * 0.08,
  }));
}
