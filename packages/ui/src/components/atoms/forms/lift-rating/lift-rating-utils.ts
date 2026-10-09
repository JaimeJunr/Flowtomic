/** Quantas estrelas ficam acesas: a prévia vence o valor salvo. */
export function litCount(value: number, preview: number | null): number {
  return preview ?? value;
}

/** Clicar na nota atual limpa (se permitido); clicar em outra troca. */
export function nextRating(current: number, clicked: number, allowClear: boolean): number {
  return allowClear && clicked === current ? 0 : clicked;
}

/** Posição X (px) do centro da estrela `index` (1-based) dentro do grupo. */
export function tipOffset(index: number, iconPx: number, gapPx: number): number {
  if (!Number.isInteger(index) || index < 1) {
    throw new Error(`invalid index: received ${index}, expected integer >= 1`);
  }
  return (index - 1) * (iconPx + gapPx) + iconPx / 2;
}
