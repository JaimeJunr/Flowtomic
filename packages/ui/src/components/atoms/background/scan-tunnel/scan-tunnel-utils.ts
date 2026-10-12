function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampGridScale(value: number): number {
  return clamp(value, 0.05, 0.5);
}

export function clampLineWidth(value: number): number {
  return clamp(value, 0.5, 3);
}

export function clampScanOpacity(value: number): number {
  return clamp(value, 0, 1);
}

export function clampScanDuration(value: number): number {
  return clamp(value, 0.5, 10);
}

export function clampScanDelay(value: number): number {
  return clamp(value, 0, 10);
}

export function assertColorToken(token: string): void {
  if (!token.startsWith("--")) {
    throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
  }
}

function smooth(x: number): number {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Fase da faixa de luz no instante `time`: 0 (perto) a 1 (fundo do tunel), com suavizacao
 * nas pontas. Ciclo: ida, pausa, volta, pausa. Devolve `null` na pausa final, quando nao ha
 * faixa. Espelha o GLSL do shader.
 */
export function scanPhase(time: number, duration: number, delay: number): number | null {
  const cycle = duration * 2 + delay * 2;
  const c = ((time % cycle) + cycle) % cycle;
  if (c <= duration) return smooth(c / duration);
  if (c <= duration + delay) return 1;
  if (c <= duration * 2 + delay) return smooth(1 - (c - duration - delay) / duration);
  return null;
}

/** Aproxima `current` de `target` por `factor` a cada quadro; encosta quando esta muito perto. */
export function stepToward(current: number, target: number, factor: number): number {
  const next = current + (target - current) * factor;
  return Math.abs(target - next) < 0.0005 ? target : next;
}

type RectLike = { left: number; top: number; width: number; height: number };

/** Posicao do ponteiro normalizada em 0-1, com y para cima (como o gl_FragCoord). */
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

/** Vinheta radial de CSS puro para quando nao ha WebGL. */
export function fallbackBackground(token: string): { background: string } {
  return {
    background: `radial-gradient(ellipse at center, transparent 20%, color-mix(in oklch, var(${token}) 18%, transparent) 70%)`,
  };
}
