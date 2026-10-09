export type StrikeDirection = "left" | "center" | "right" | "none";

export type SpringConfig = {
  type: "spring";
  stiffness: number;
  damping: number;
  mass: number;
};

const STIFFNESS = 420;
const MASS = 1;
// Piso do fator de amortecimento: bounce muito alto não pode virar oscilação infinita.
const MIN_DAMPING_RATIO = 0.1;

/** Mola cujo amortecimento vem de `bounce`: 0 é criticamente amortecida, acima disso passa do alvo e volta. */
export function springFromBounce(bounce: number): SpringConfig {
  if (!Number.isFinite(bounce) || bounce < 0) {
    throw new Error(`invalid bounce: received ${bounce}, expected a finite number >= 0`);
  }
  const ratio = Math.max(MIN_DAMPING_RATIO, 1 - bounce);
  const critical = 2 * Math.sqrt(STIFFNESS * MASS);
  return { type: "spring", stiffness: STIFFNESS, damping: critical * ratio, mass: MASS };
}

/** Classe de origem do `scaleX` do risco; `null` quando não há risco. */
export function strikeOrigin(strike: StrikeDirection): string | null {
  switch (strike) {
    case "left":
      return "origin-left";
    case "center":
      return "origin-center";
    case "right":
      return "origin-right";
    case "none":
      return null;
    default:
      throw new Error(
        `invalid strike: received ${JSON.stringify(strike)}, expected "left" | "center" | "right" | "none"`
      );
  }
}
