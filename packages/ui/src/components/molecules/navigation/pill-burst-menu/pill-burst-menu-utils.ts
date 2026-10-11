export const MAX_PILL_ITEMS = 8;

const DEFAULT_ROTATIONS = [-8, 8, 6, -6, 4, -4, 8, -8] as const;

/** Rotação do item: o valor explícito vence, senão alterna pela tabela padrão. */
export function pillRotation(index: number, rotation?: number): number {
  if (rotation !== undefined) return rotation;
  return DEFAULT_ROTATIONS[index % DEFAULT_ROTATIONS.length];
}

/** Atraso de entrada; o jitter é determinístico para o menu não "tremer" entre renders. */
export function pillDelay(index: number, stagger: number): number {
  const jitter = ((index * 37) % 5) * 0.01;
  return index * stagger + jitter;
}

export function assertItemCount(count: number): void {
  if (count < 1 || count > MAX_PILL_ITEMS) {
    throw new Error(
      `PillBurstMenu: received ${count} items, expected between 1 and ${MAX_PILL_ITEMS}`
    );
  }
}
