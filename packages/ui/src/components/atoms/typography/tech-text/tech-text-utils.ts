export type LetterBox = { left: number; width: number };
export type Speck = { x: number; y: number; delayMs: number; durationMs: number };

/** Largura média de uma letra quando não há canvas 2D para medir, em em. */
export const FALLBACK_ADVANCE_EM = 0.6;
const MEASURE_SIZE_PX = 100;

/** Fonte que cabe: o menor entre o máximo e a largura do container / largura da palavra em em. */
export function fitFontSize(totalEm: number, containerPx: number, maxFontSizePx: number): number {
  if (!(containerPx > 0) || !(totalEm > 0)) return maxFontSizePx;
  return Math.min(maxFontSizePx, containerPx / totalEm);
}

/**
 * Opacidade do preenchimento no modo área: 0 no centro, 1 a partir de `reachPx`.
 * `softness` 0 vira degrau na borda; 1 abre a transição desde o centro.
 */
export function areaFillOpacity(distancePx: number, reachPx: number, softness: number): number {
  if (distancePx >= reachPx) return 1;
  const inner = reachPx * (1 - Math.min(1, Math.max(0, softness)));
  if (distancePx <= inner) return 0;
  return (distancePx - inner) / (reachPx - inner);
}

/** Letra sob o x; se nenhuma, a de caixa mais próxima. -1 sem letras. */
export function activeLetterIndex(x: number, boxes: LetterBox[]): number {
  let best = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [index, box] of boxes.entries()) {
    const distance = Math.max(box.left - x, x - (box.left + box.width), 0);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  }
  return best;
}

/** mulberry32 local: o componente é copiado sozinho pelo CLI. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SPECK_OVERFLOW_PX = 10;

/** Quadradinhos em volta da caixa da letra (até 10px para fora), com ciclo de piscar próprio. */
export function speckPositions(
  seed: number,
  count: number,
  box: { width: number; height: number }
): Speck[] {
  const random = seededRandom(seed * 7919 + 13);
  const span = (size: number) => random() * (size + SPECK_OVERFLOW_PX * 2) - SPECK_OVERFLOW_PX;
  return Array.from({ length: Math.max(0, Math.floor(count)) }, () => ({
    x: span(box.width),
    y: span(box.height),
    delayMs: Math.round(random() * 1200),
    durationMs: 700 + Math.round(random() * 900),
  }));
}

export function selectionLabel(letter: string, fontSizePx: number): string {
  return `${letter} · ${Math.round(fontSizePx)}px`;
}

export function dragLabel(dx: number, dy: number): string {
  return `${Math.round(dx)}, ${Math.round(dy)}`;
}

/** Avanço de cada caractere em em, medido num canvas 2D; sem canvas, largura média. */
export function measureAdvancesEm(text: string, font: string): number[] {
  const chars = [...text];
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return chars.map(() => FALLBACK_ADVANCE_EM);
  ctx.font = font.replace(/[\d.]+px/, `${MEASURE_SIZE_PX}px`);
  return chars.map((char) => ctx.measureText(char).width / MEASURE_SIZE_PX);
}

export type Layout = {
  fontSizePx: number;
  widthPx: number;
  heightPx: number;
  boxes: LetterBox[];
};

const LINE_HEIGHT_EM = 1.15;
export const BASELINE_EM = 0.88;

export function buildLayout(
  advancesEm: number[],
  letterSpacingEm: number,
  containerPx: number,
  maxFontSizePx: number
): Layout {
  const totalEm =
    advancesEm.reduce((sum, advance) => sum + advance, 0) +
    letterSpacingEm * Math.max(0, advancesEm.length - 1);
  const fontSizePx = fitFontSize(totalEm, containerPx, maxFontSizePx);
  let cursorEm = 0;
  const boxes = advancesEm.map((advance) => {
    const box = { left: cursorEm * fontSizePx, width: advance * fontSizePx };
    cursorEm += advance + letterSpacingEm;
    return box;
  });
  return {
    fontSizePx,
    widthPx: totalEm * fontSizePx,
    heightPx: LINE_HEIGHT_EM * fontSizePx,
    boxes,
  };
}
