export type RadarMode = "sweep" | "pulse";

const TAU = Math.PI * 2;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampWhole(value: number, min: number, max: number): number {
  return clamp(Math.round(value), min, max);
}

export function clampTrail(value: number): number {
  return clamp(value, 0, 1);
}

export function clampScale(value: number): number {
  return clamp(value, 0.2, 1.5);
}

export function clampRings(value: number): number {
  return clampWhole(value, 1, 12);
}

export function clampSpokes(value: number): number {
  return clampWhole(value, 0, 36);
}

export function clampTargets(value: number): number {
  return clampWhole(value, 0, 16);
}

export function clampClutter(value: number): number {
  return clamp(value, 0, 1);
}

export function assertColorToken(token: string): void {
  if (!token.startsWith("--")) {
    throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
  }
}

export function assertMode(mode: string): void {
  if (mode !== "sweep" && mode !== "pulse") {
    throw new Error(`Received mode ${JSON.stringify(mode)}; expected "sweep" or "pulse"`);
  }
}

export function modeCode(mode: RadarMode): number {
  return mode === "pulse" ? 1 : 0;
}

/**
 * Atraso angular de um ponto no angulo `angle` em relacao ao feixe em `beam`, medido no
 * sentido do giro (`direction` 1 ou -1). Fica em [0, 2pi): 0 no feixe, cresce atras dele.
 * Espelha o GLSL do shader.
 */
export function sweepLag(angle: number, beam: number, direction: 1 | -1): number {
  const diff = direction === 1 ? beam - angle : angle - beam;
  return ((diff % TAU) + TAU) % TAU;
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

/** Aneis concentricos de CSS puro, recortados num circulo, para quando nao ha WebGL. */
export function fallbackBackground(token: string): { background: string; clipPath: string } {
  return {
    background: `repeating-radial-gradient(circle, color-mix(in oklch, var(${token}) 25%, transparent) 0 1px, transparent 1px 12%)`,
    clipPath: "circle(closest-side at 50% 50%)",
  };
}
