import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_DETAIL = 5;

/** Número de camadas de distorção: inteiro entre 2 e 8. */
export function clampDetail(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_DETAIL;
  return Math.min(8, Math.max(2, Math.round(value)));
}

export function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function assertTintToken(token: string | undefined): void {
  if (token !== undefined && !token.startsWith("--")) {
    throw new Error(`Received tint ${JSON.stringify(token)}; expected format "--token-name"`);
  }
}

export function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

export function relativeLuminance(color: RgbColor): number {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

export function isDarkBackground(color: RgbColor | null): boolean {
  return color !== null && relativeLuminance(color) < 0.5;
}
