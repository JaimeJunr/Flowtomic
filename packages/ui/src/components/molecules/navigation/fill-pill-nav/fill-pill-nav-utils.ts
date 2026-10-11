export const MOBILE_BREAKPOINT = 768;

export const FILL_EASE = [0.22, 1, 0.36, 1] as const;
export const FILL_DURATION = 0.35;

export type FillCircle = { diameter: number; bottom: number; left: number; originY: number };

/**
 * Círculo centrado na pílula com o diâmetro da diagonal: só assim cobre também os cantos de
 * baixo (um círculo tangente à base deixava duas meias-luas claras). Cresce a partir do
 * ponto da base da pílula (`originY`, medido do topo do círculo). 2 px de folga contra fresta.
 */
export function fillCircle(width: number, height: number): FillCircle {
  if (!(height > 0)) {
    throw new Error(`fillCircle: height must be > 0, received ${height}`);
  }
  if (!(width >= 0)) {
    throw new Error(`fillCircle: width must be >= 0, received ${width}`);
  }
  const diameter = Math.hypot(width, height) + 2;
  return {
    diameter,
    bottom: (height - diameter) / 2,
    left: (width - diameter) / 2,
    originY: (height + diameter) / (2 * diameter),
  };
}

export function isCompactWidth(width: number | null): boolean {
  return width !== null && width > 0 && width < MOBILE_BREAKPOINT;
}

export function isHoverPointer(pointerType: string): boolean {
  return pointerType === "mouse" || pointerType === "pen";
}
