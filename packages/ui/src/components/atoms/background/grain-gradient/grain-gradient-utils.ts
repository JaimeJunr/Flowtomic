import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_GRAIN_COLORS: [string, string, string] = ["--primary", "--info", "--warning"];

/** Converte três cores em RGB 0-1 (9 números); cor ausente usa o fallback. */
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

export function assertColorTokens(colors: readonly string[]): void {
  if (colors.length !== 3) {
    throw new Error(`Received ${colors.length} color tokens; expected exactly 3`);
  }
  for (const token of colors) {
    if (!token.startsWith("--")) {
      throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
    }
  }
}

export function clampRange(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampUnit(value: number): number {
  return clampRange(value, 0, 1);
}
