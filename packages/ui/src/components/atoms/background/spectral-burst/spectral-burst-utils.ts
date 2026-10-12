import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_SPECTRAL_COLORS: [string, string] = ["--primary", "--info"];

export type SpectralMotion = "spin" | "sway";

const MOTIONS: readonly SpectralMotion[] = ["spin", "sway"];

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

export function assertColorTokens(colors: readonly string[]): void {
  if (colors.length !== 2) {
    throw new Error(`Received ${JSON.stringify(colors)}; expected exactly two color tokens`);
  }
  for (const token of colors) {
    if (!token.startsWith("--")) {
      throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
    }
  }
}

export function assertMotion(motion: string): void {
  if (!MOTIONS.includes(motion as SpectralMotion)) {
    throw new Error(`Received motion ${JSON.stringify(motion)}; expected "spin" or "sway"`);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Intensidade da luz: de 0 a 4. */
export function clampIntensity(value: number): number {
  return clamp(value, 0, 4);
}

/** Dobra dos raios: de 0 a 2. */
export function clampDistort(value: number): number {
  return clamp(value, 0, 2);
}

/** 0 = raios livres; senão inteiro de 4 a 64. */
export function normalizeRayCount(value: number): number {
  if (value <= 0) return 0;
  return clamp(Math.round(value), 4, 64);
}

/** Deslocamento do foco em fração da tela; cada eixo de -0,5 a 0,5. */
export function clampCenter(center: { x: number; y: number }): [number, number] {
  return [clamp(center.x, -0.5, 0.5), clamp(center.y, -0.5, 0.5)];
}
