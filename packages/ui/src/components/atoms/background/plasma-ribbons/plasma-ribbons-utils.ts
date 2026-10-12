import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_PLASMA_RIBBONS_COLORS: [string, string] = ["--primary", "--info"];
export const DEFAULT_BEND: [number, number] = [1, 0.5];

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

export const clampBend = (value: number) => clamp(value, 0, 2);
export const clampThickness = (value: number) => clamp(value, 0.05, 1);
export const clampGlow = (value: number) => clamp(value, 0, 2);
export const clampCore = (value: number) => clamp(value, 0, 1);
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

/** Duas faixas de cor cruzando a tela em CSS puro para quando não há WebGL. */
export function fallbackBackground(first: string, second: string): { background: string } {
  return {
    background: `linear-gradient(170deg, transparent 35%, color-mix(in oklch, var(${first}) 40%, transparent) 45%, color-mix(in oklch, var(${second}) 40%, transparent) 55%, transparent 65%)`,
  };
}
