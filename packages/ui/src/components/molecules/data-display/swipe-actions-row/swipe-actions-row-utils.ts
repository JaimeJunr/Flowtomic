/** Fração da largura da linha a partir da qual o arrasto vira "ação principal". */
export const DEFAULT_COMMIT_AT = 0.6;

/** Velocidade (px/ms, no sentido de abrir) a partir da qual o gesto conta como peteleco. */
export const FLING_VELOCITY = 0.5;

export type ReleaseTarget = "closed" | "open" | "commit";

/**
 * Deslocamento exibido (módulo, sempre >= 0) para um arrasto bruto: 1:1 até `commitAt * rowWidth`
 * (com fullSwipe) ou até a largura da gaveta (sem); além desse limite o excesso é multiplicado
 * por `resistance` e comprimido de forma assintótica, sem nunca alcançar a largura da linha.
 */
export function rubberOffset(
  raw: number,
  rowWidth: number,
  commitAt: number,
  fullSwipe: boolean,
  drawerWidth: number,
  resistance: number
): number {
  if (!(rowWidth > 0)) {
    throw new Error(`invalid rowWidth: received rowWidth ${rowWidth}, expected a number > 0`);
  }
  if (!(resistance >= 0 && resistance <= 1)) {
    throw new Error(
      `invalid resistance: received resistance ${resistance}, expected a number in [0, 1]`
    );
  }
  if (raw <= 0) return 0;
  const limit = Math.min(fullSwipe ? commitAt * rowWidth : drawerWidth, rowWidth);
  if (raw <= limit) return raw;
  const room = rowWidth - limit;
  if (room <= 0) return limit;
  return limit + room * (1 - Math.exp(-((raw - limit) * resistance) / room));
}

/** Decide para onde a linha vai ao soltar. `velocity` é positiva no sentido de abrir. */
export function releaseTarget(
  offset: number,
  velocity: number,
  drawerWidth: number,
  rowWidth: number,
  commitAt: number,
  fullSwipe: boolean
): ReleaseTarget {
  if (fullSwipe && offset >= commitAt * rowWidth) return "commit";
  if (velocity >= FLING_VELOCITY && offset > 0) return "open";
  if (velocity <= -FLING_VELOCITY) return "closed";
  return offset > drawerWidth / 2 ? "open" : "closed";
}
