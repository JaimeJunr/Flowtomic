export const LAYER_STEP = 0.07;
export const ITEM_STEP = 0.08;
export const CLOSE_DURATION = 0.3;
export const SLIDE_EASE = [0.22, 1, 0.36, 1] as const;

const LAYER_TONES = ["bg-primary", "bg-primary/60", "bg-muted"] as const;

export type OpenSchedule = {
  layer: number[];
  panel: number;
  items: number[];
  links: number;
};

// Arredonda para evitar 0.21000000000000002 nos atrasos de motion.
const round = (value: number) => Math.round(value * 1000) / 1000;

export function layerTone(index: number): string {
  const tone = LAYER_TONES[index];
  if (!tone) {
    throw new Error(
      `layerTone: índice ${index} fora da faixa, esperado de 0 a ${LAYER_TONES.length - 1}`
    );
  }
  return tone;
}

/** Atrasos de entrada, em segundos. Na saída tudo vai junto, sem atraso. */
export function openSchedule(layers: number, itemCount: number): OpenSchedule {
  if (![1, 2, 3].includes(layers)) {
    throw new Error(`openSchedule: layers recebido ${layers}, esperado 1, 2 ou 3`);
  }
  if (!Number.isInteger(itemCount) || itemCount < 1) {
    throw new Error(`openSchedule: itemCount recebido ${itemCount}, esperado pelo menos 1`);
  }
  const layer = Array.from({ length: layers }, (_, i) => round(i * LAYER_STEP));
  const panel = round(layers * LAYER_STEP);
  const items = Array.from({ length: itemCount }, (_, k) => round(panel + 0.15 + k * ITEM_STEP));
  const links = round(items[itemCount - 1] + 0.1);
  return { layer, panel, items, links };
}
