export type LikeScaleKeyframes = { values: number[]; times: number[] };

/** Instante (fração da duração) em que o ícone troca de contorno para preenchido. */
export const SWAP_AT = 0.4;

/** Encolhe até um ponto, troca em 40% e volta passando do tamanho antes de assentar. */
export function likeScaleKeyframes(dotSize: number, overshoot: number): LikeScaleKeyframes {
  const peak = 1 + 0.1 * overshoot;
  return { values: [1, dotSize, peak, 1], times: [0, SWAP_AT, 0.7, 1] };
}

/** Escala da pílula: uma leve batida com o pico no momento da troca. */
export function beatKeyframes(beat: number): LikeScaleKeyframes {
  return { values: [1, 1 - beat / 100, 1], times: [0, SWAP_AT, 1] };
}

const countFormatter = new Intl.NumberFormat("pt-BR");

export function formatCount(count: number): string {
  if (!Number.isFinite(count)) {
    throw new Error(`invalid count: received ${String(count)}, expected a finite number`);
  }
  return countFormatter.format(count);
}

/** Índices (contados da direita) dos caracteres que mudaram; se o tamanho muda, todos. */
export function diffDigits(prev: string, next: string): number[] {
  const all = Array.from({ length: next.length }, (_, index) => index);
  if (prev.length !== next.length) return all;
  return all.filter((index) => prev[prev.length - 1 - index] !== next[next.length - 1 - index]);
}
