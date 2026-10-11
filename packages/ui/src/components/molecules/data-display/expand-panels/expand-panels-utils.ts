export const MIN_PANELS = 2;
export const MAX_PANELS = 10;
export const MIN_RATIO = 0.2;
export const MAX_RATIO = 0.9;
const PARALLAX_DISTANCE = 40;

export type ExpandPanelsConfig = { count: number; index: number; expandRatio: number };

export function assertExpandPanelsConfig({ count, index, expandRatio }: ExpandPanelsConfig): void {
  if (!Number.isInteger(count) || count < MIN_PANELS || count > MAX_PANELS) {
    throw new RangeError(
      `invalid items length: received ${count}, expected an integer from ${MIN_PANELS} to ${MAX_PANELS}`
    );
  }
  if (!(expandRatio >= MIN_RATIO && expandRatio <= MAX_RATIO)) {
    throw new RangeError(
      `invalid expandRatio: received ${expandRatio}, expected a number from ${MIN_RATIO} to ${MAX_RATIO}`
    );
  }
  if (!Number.isInteger(index) || index < 0 || index >= count) {
    throw new RangeError(
      `invalid index: received ${index}, expected an integer from 0 to ${count - 1}`
    );
  }
}

/** Frações da fileira: o ativo leva `expandRatio`, os outros dividem o resto. */
export function panelBasis(count: number, active: number, expandRatio: number): number[] {
  const rest = (1 - expandRatio) / (count - 1);
  return Array.from({ length: count }, (_, i) => (i === active ? expandRatio : rest));
}

/** Sinal do giro: painéis antes do ativo giram para um lado, depois dele para o outro. */
export function tiltFor(index: number, active: number, tilt: number): number {
  if (index === active) return 0;
  return index < active ? tilt : -tilt;
}

/** Deslocamento do conteúdo em px, para o lado oposto ao ativo. */
export function parallaxShift(index: number, active: number, parallax: number): number {
  if (index === active) return 0;
  const distance = parallax * PARALLAX_DISTANCE;
  return (index < active ? -distance : distance) + 0;
}

/** Tamanho do painel aberto em px, descontados os vãos entre painéis. */
export function openPanelSize(
  length: number,
  gap: number,
  count: number,
  expandRatio: number
): number {
  if (!(length > 0)) return 0;
  return Math.max(0, (length - gap * (count - 1)) * expandRatio);
}
