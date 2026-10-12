import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_BLIND_COLORS: string[] = ["--primary", "--warning"];
export const MAX_BLIND_COLORS = 8;

/** Número de lâminas que cabem: nunca menos de 1 e nunca mais estreitas que o mínimo. */
export function effectiveBlindCount(
  width: number,
  blindCount: number,
  blindMinWidth: number
): number {
  const fit = Math.floor(width / Math.max(1, blindMinWidth));
  return Math.max(1, Math.min(blindCount, fit));
}

export function assertColorTokens(colors: readonly string[]): void {
  if (colors.length < 1 || colors.length > MAX_BLIND_COLORS) {
    throw new Error(`Received ${colors.length} color tokens; expected 1 to ${MAX_BLIND_COLORS}`);
  }
  for (const token of colors) {
    if (!token.startsWith("--")) {
      throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
    }
  }
}

/** Um token só vira dois iguais, para a interpolação circular ter vizinhos. */
export function expandTokens(tokens: readonly string[]): string[] {
  return tokens.length === 1 ? [tokens[0], tokens[0]] : [...tokens];
}

/** RGB 0-1 de exatamente 8 cores; as que sobram repetem a última. */
export function toColorUniform(colors: (RgbColor | null)[], fallback: RgbColor): Float32Array {
  const result = new Float32Array(MAX_BLIND_COLORS * 3);
  for (let index = 0; index < MAX_BLIND_COLORS; index++) {
    const source = colors[Math.min(index, colors.length - 1)] ?? fallback;
    result[index * 3] = source.r;
    result[index * 3 + 1] = source.g;
    result[index * 3 + 2] = source.b;
  }
  return result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampBlindCount(value: number): number {
  return Math.round(clamp(value, 2, 64));
}

export function clampSpotlightRadius(value: number): number {
  return clamp(value, 0.1, 1.5);
}

export function clampSoftness(value: number): number {
  return clamp(value, 0.2, 4);
}

export function clampNoise(value: number): number {
  return clamp(value, 0, 1);
}

/** Aproxima `current` de `target` por `factor` a cada quadro; encosta quando está muito perto. */
export function stepToward(current: number, target: number, factor: number): number {
  const next = current + (target - current) * factor;
  return Math.abs(target - next) < 0.0005 ? target : next;
}

/** Listras verticais sob uma máscara radial ao centro, para quando não há WebGL. */
export function fallbackBackground(token: string): string {
  const tint = `color-mix(in oklch, var(${token}) 50%, transparent)`;
  return `repeating-linear-gradient(90deg, ${tint} 0 30px, transparent 30px 60px)`;
}
