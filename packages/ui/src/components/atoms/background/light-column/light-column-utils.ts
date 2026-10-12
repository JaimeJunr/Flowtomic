import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_LIGHT_COLUMN_COLORS: [string, string] = ["--primary", "--warning"];

export const MIN_DETAIL = 1;
export const MAX_DETAIL = 6;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function assertColorTokens(colors: readonly string[]): void {
  if (colors.length !== 2) {
    throw new Error(`Received ${JSON.stringify(colors)}; expected 2 tokens`);
  }
  for (const token of colors) {
    if (!token.startsWith("--")) {
      throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
    }
  }
}

/** Número de oitavas da turbulência: precisa ser inteiro de 1 a 6. */
export function resolveDetail(detail: number): number {
  if (!Number.isInteger(detail) || detail < MIN_DETAIL || detail > MAX_DETAIL) {
    throw new Error(`Received detail ${detail}; expected an integer from 1 to 6`);
  }
  return detail;
}

export const clampIntensity = (value: number) => clamp(value, 0, 2);
export const clampWidth = (value: number) => clamp(value, 0.1, 1);
export const clampTwist = (value: number) => clamp(value, 0, 2);
export const clampGrain = (value: number) => clamp(value, 0, 1);

/** Converte duas cores em RGB 0-1 (6 números); cor ausente usa o fallback. */
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

/** Faixa de luz inclinada em CSS puro para quando não há WebGL. */
export function fallbackBackground(token: string): { background: string } {
  return {
    background: `linear-gradient(115deg, transparent 40%, color-mix(in oklch, var(${token}) 45%, transparent) 50%, transparent 60%)`,
  };
}
