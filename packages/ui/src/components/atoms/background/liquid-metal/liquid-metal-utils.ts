export function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Densidade das ondas fica entre 1 e 8. */
export function clampFrequency(value: number): number {
  return Math.min(8, Math.max(1, value));
}

export function assertColorToken(token: string): void {
  if (!token.startsWith("--")) {
    throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
  }
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
    x: clampUnit((clientX - rect.left) / rect.width),
    y: clampUnit(1 - (clientY - rect.top) / rect.height),
  };
}

export function fallbackBackground(token: string): string {
  return `linear-gradient(160deg, color-mix(in oklch, var(${token}) 25%, transparent), transparent 60%)`;
}
