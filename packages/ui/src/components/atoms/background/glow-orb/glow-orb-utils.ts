import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_GLOW_ORB_COLORS: [string, string, string] = [
  "--primary",
  "--info",
  "--primary",
];

const TWO_PI = Math.PI * 2;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function assertColorTokens(colors: readonly string[]): void {
  if (colors.length !== 3) {
    throw new Error(`Received ${JSON.stringify(colors)}; expected 3 tokens`);
  }
  for (const token of colors) {
    if (!token.startsWith("--")) {
      throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
    }
  }
}

export const clampSize = (value: number) => clamp(value, 0.2, 1.5);
export const clampGlow = (value: number) => clamp(value, 0, 2);
export const clampWobble = (value: number) => clamp(value, 0, 2);
export const clampHighlight = (value: number) => clamp(value, 0, 2);
export const clampTrail = (value: number) => clamp(value, 0, 2);

/**
 * Diferença angular com sinal, `a - b`, trazida para -PI..PI. É a mesma conta que o shader faz
 * para medir a distância da luz que orbita até cada ponto do anel.
 */
export function angleDelta(a: number, b: number): number {
  const wrapped = (((a - b + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI;
  return wrapped - Math.PI;
}

/** Converte as três cores em RGB 0-1 (9 números); cor ausente usa o fallback. */
export function toColorUniform(colors: (RgbColor | null)[], fallback: RgbColor): Float32Array {
  const result = new Float32Array(colors.length * 3);
  colors.forEach((color, index) => {
    const source = color ?? fallback;
    result[index * 3] = source.r;
    result[index * 3 + 1] = source.g;
    result[index * 3 + 2] = source.b;
  });
  return result;
}

export function stepToward(current: number, target: number, factor: number): number {
  const next = current + (target - current) * factor;
  return Math.abs(target - next) < 0.0005 ? target : next;
}

type RectLike = { left: number; top: number; width: number; height: number };

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

/** Anel de luz em CSS puro para quando não há WebGL. */
export function fallbackBackground(token: string): { background: string } {
  return {
    background: `radial-gradient(circle, transparent 30%, color-mix(in oklch, var(${token}) 50%, transparent) 34%, transparent 42%)`,
  };
}
