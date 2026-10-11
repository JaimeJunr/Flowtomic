import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_SILK_COLOR = "--primary";

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Converte a cor em RGB 0-1 (3 números); cor ausente usa o fallback. */
export function toColorUniform(color: RgbColor | null, fallback: RgbColor): Float32Array {
  const source = color ?? fallback;
  return new Float32Array([source.r, source.g, source.b]);
}

export function assertColorToken(token: string): void {
  if (!token.startsWith("--")) {
    throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
  }
}

export function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}
