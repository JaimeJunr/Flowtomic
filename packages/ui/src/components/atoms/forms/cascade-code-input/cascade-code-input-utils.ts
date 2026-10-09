/** Atraso de pouso (ms) por casa, só para as que mudaram de vazia para cheia. */
export function landingDelays(
  prev: string,
  next: string,
  cascadeMs: number
): Record<number, number> {
  const delays: Record<number, number> = {};
  let order = 0;
  for (let index = 0; index < next.length; index++) {
    if (index < prev.length) continue;
    delays[index] = order * cascadeMs;
    order += 1;
  }
  return delays;
}

/** Atraso de esvaziamento por casa: a última sai primeiro (atraso 0). */
export function drainDelays(length: number, cascadeMs: number): number[] {
  return Array.from({ length }, (_, index) => (length - 1 - index) * cascadeMs);
}

export function assertCodeLength(length: number): void {
  if (!Number.isInteger(length) || length < 1) {
    throw new Error(`CascadeCodeInput: received length ${length}, expected an integer >= 1`);
  }
}
