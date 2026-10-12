function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type FiberDirection = "outward" | "inward";

export function clampCables(value: number): number {
  return Math.round(clamp(value, 4, 48));
}

export function clampThickness(value: number): number {
  return clamp(value, 0.1, 1);
}

export function clampPulseLength(value: number): number {
  return clamp(value, 0.05, 1);
}

export function clampWaviness(value: number): number {
  return clamp(value, 0, 1);
}

export function assertColorToken(token: string): void {
  if (!token.startsWith("--")) {
    throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
  }
}

export function assertDirection(direction: string): asserts direction is FiberDirection {
  if (direction !== "outward" && direction !== "inward") {
    throw new Error(
      `Received direction ${JSON.stringify(direction)}; expected "outward" or "inward"`
    );
  }
}

/** Sinal aplicado ao tempo na posição do pulso: +1 leva o pulso do centro para a borda. */
export function directionSign(direction: FiberDirection): 1 | -1 {
  return direction === "outward" ? 1 : -1;
}

/** Índice do cabo para um ângulo em radianos; espelha o `floor(a * cables / 2pi)` do shader. */
export function cableIndex(angle: number, cables: number): number {
  const turn = 2 * Math.PI;
  const wrapped = (((angle % turn) + turn) % turn) / turn;
  return Math.min(cables - 1, Math.floor(wrapped * cables));
}

/** Aproxima `current` de `target` por `factor` a cada quadro; encosta quando está muito perto. */
export function stepToward(current: number, target: number, factor: number): number {
  const next = current + (target - current) * factor;
  return Math.abs(target - next) < 0.0005 ? target : next;
}

type RectLike = { left: number; top: number; width: number; height: number };

/** Posição do ponteiro normalizada em 0-1, com y para cima (como o gl_FragCoord). */
export function pointerTarget(
  clientX: number,
  clientY: number,
  rect: RectLike
): { x: number; y: number } | null {
  if (rect.width === 0 || rect.height === 0) return null;
  return {
    x: clamp((clientX - rect.left) / rect.width, 0, 1),
    y: clamp(1 - (clientY - rect.top) / rect.height, 0, 1),
  };
}

/** Raios de CSS puro para quando não há WebGL; a máscara radial apaga o centro. */
export function fallbackBackground(token: string): {
  background: string;
  maskImage: string;
  WebkitMaskImage: string;
} {
  const mask =
    "radial-gradient(circle at center, transparent 6%, black 40%, black 80%, transparent 100%)";
  return {
    background: `repeating-conic-gradient(from 0deg, color-mix(in oklch, var(${token}) 30%, transparent) 0deg 1.5deg, transparent 1.5deg 18deg)`,
    maskImage: mask,
    WebkitMaskImage: mask,
  };
}
