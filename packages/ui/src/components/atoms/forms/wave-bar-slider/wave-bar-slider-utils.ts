export interface WaveShape {
  /** Teto da onda, em px. */
  height: number;
  /** Altura de repouso, em px. */
  restHeight: number;
  /** Meia-largura da onda em energia máxima, em barras. */
  reach: number;
  /** 0 = simétrica; >0 = mais larga atrás da alça. */
  skew: number;
}

/** Direção do movimento: 1 = para a direita, -1 = para a esquerda, 0 = sem direção ainda. */
export type WaveDirection = -1 | 0 | 1;

// Fator que converte velocidade normalizada (faixa/segundo) em energia 0..1:
// varrer a faixa inteira em ~1 s com sensitivity 1 enche a onda.
const ENERGY_PER_SPEED = 1;
const SMOOTHING_MS = 100;

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function valueFraction(value: number, min: number, max: number): number {
  if (!(max > min)) {
    throw new Error(
      `valueFraction: received min=${min} max=${max}, expected finite numbers with max > min`
    );
  }
  return clamp01((value - min) / (max - min));
}

/** Quantas barras ficam acesas para o valor. */
export function litCount(value: number, min: number, max: number, bars: number): number {
  return Math.round(valueFraction(value, min, max) * bars);
}

/** Posição da alça na escala das barras (0 = primeira barra, bars - 1 = última). */
export function handlePosition(value: number, min: number, max: number, bars: number): number {
  return valueFraction(value, min, max) * Math.max(0, bars - 1);
}

/** Suavização exponencial da velocidade (~100 ms), independente da taxa de quadros. */
export function smoothSpeed(previous: number, instant: number, dtMs: number): number {
  const alpha = 1 - Math.exp(-Math.max(0, dtMs) / SMOOTHING_MS);
  return previous + (instant - previous) * alpha;
}

export function energyFromSpeed(speed: number, sensitivity: number): number {
  return clamp01(speed * sensitivity * ENERGY_PER_SPEED);
}

/** Altura (px) da barra `index` dada a alça, a direção do movimento e a energia. */
export function barHeight(
  index: number,
  handlePos: number,
  direction: WaveDirection,
  energy: number,
  shape: WaveShape
): number {
  const { height, restHeight, reach, skew } = shape;
  const e = clamp01(energy);
  const offset = index - handlePos;
  const behind = direction !== 0 && Math.sign(offset) === -direction;
  const width = reach * e * (behind ? 1 + skew : 1);
  const distance = Math.abs(offset);
  if (width <= 0 || distance > width) return restHeight;
  const falloff = Math.cos((Math.PI / 2) * (distance / width)) ** 2;
  return restHeight + (height - restHeight) * e * falloff;
}
