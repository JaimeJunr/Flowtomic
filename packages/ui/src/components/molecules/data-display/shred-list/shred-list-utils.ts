export type StripMotion = {
  /** Segundos. */
  delay: number;
  /** Graus. */
  rotate: number;
  /** Amplitude do deslocamento X ondulado, em px. */
  drift: number;
};

const MAX_DELAY_S = 0.3;
const MAX_ROTATE_DEG = 8;
const DRIFT_AMPLITUDE_PX = 14;
const WAVE_CYCLES = 2;
const FIRST_PULL_S = 0.3;
const FIRST_PULL_BOOST = 0.5;

function assertPositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`invalid ${name}: received ${value}, expected a number > 0`);
  }
}

/** Quantas tiras cabem na largura do cartão (mínimo 1). */
export function stripCount(width: number, stripWidth: number): number {
  assertPositive("stripWidth", stripWidth);
  return Math.max(1, Math.round(width / stripWidth));
}

/** Recorte da coluna `index` de `count`: mostra só aquela fatia vertical do cartão. */
export function stripClip(index: number, count: number): string {
  const left = (index / count) * 100;
  const right = ((count - 1 - index) / count) * 100;
  return `inset(0 ${right}% 0 ${left}%)`;
}

/** Atraso, giro e ondulação de uma tira; `rng` injetável para teste. */
export function stripMotion(
  index: number,
  count: number,
  curl: number,
  rng: () => number
): StripMotion {
  const phase = (index / count) * WAVE_CYCLES * 2 * Math.PI;
  return {
    delay: rng() * MAX_DELAY_S,
    rotate: (rng() - 0.5) * 2 * MAX_ROTATE_DEG,
    // "+ 0" troca -0 por 0 quando curl é 0.
    drift: Math.sin(phase) * DRIFT_AMPLITUDE_PX * curl + 0,
  };
}

/** Posição de inserção do cartão arrastado: quantos dos outros centros ficam acima de `y`. */
export function reorderIndex(otherCenters: number[], y: number): number {
  return otherCenters.filter((center) => center < y).length;
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (!Number.isInteger(from) || from < 0 || from >= items.length) {
    throw new RangeError(
      `invalid from: received ${from}, expected integer in [0, ${items.length - 1}]`
    );
  }
  const target = Math.min(Math.max(to, 0), items.length - 1);
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(target, 0, moved);
  return next;
}

/** Quanto o cartão desceu após `seconds`: o primeiro puxão dos rolos é mais rápido e depois estabiliza em `speed`. */
export function feedDistance(seconds: number, speed: number): number {
  return speed * (seconds + FIRST_PULL_BOOST * Math.min(seconds, FIRST_PULL_S));
}
