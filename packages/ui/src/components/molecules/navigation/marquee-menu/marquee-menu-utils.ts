export type MarqueeEdge = "top" | "bottom";

export const MIN_REPEATS = 4;

/** Borda do item mais próxima do ponteiro; empate fica com o topo. */
export function closestEdge(y: number, height: number): MarqueeEdge {
  return y <= height - y ? "top" : "bottom";
}

/** Repetições do par rótulo+miniatura para a metade da trilha cobrir duas larguras do item. */
export function repeatsFor(itemWidth: number, unitWidth: number): number {
  if (!(unitWidth > 0)) {
    throw new Error(`repeatsFor: unitWidth recebido ${unitWidth}, esperado maior que 0`);
  }
  return Math.max(MIN_REPEATS, Math.ceil((itemWidth * 2) / unitWidth));
}

export function assertSpeed(speed: number): void {
  if (!(speed > 0)) {
    throw new Error(`MarqueeMenu: speed recebido ${speed}, esperado maior que 0`);
  }
}
