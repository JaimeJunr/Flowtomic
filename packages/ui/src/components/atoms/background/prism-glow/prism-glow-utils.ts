import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_PRISM_TINT = "--primary";

/** Converte uma cor em RGB 0-1 (3 números); cor ausente usa o fallback. */
export function toColorUniform(color: RgbColor | null, fallback: RgbColor): Float32Array {
  const source = color ?? fallback;
  return new Float32Array([source.r, source.g, source.b]);
}

export function assertColorToken(token: string): void {
  if (!token.startsWith("--")) {
    throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampUnit(value: number): number {
  return clamp(value, 0, 1);
}

/** Intensidade do brilho: de 0 a 2. */
export function clampGlow(value: number): number {
  return clamp(value, 0, 2);
}

/** Frequência das faixas de espectro: de 0,5 a 4. */
export function clampBands(value: number): number {
  return clamp(value, 0.5, 4);
}

/** Altura relativa do prisma: de 0,3 a 1. */
export function clampHeight(value: number): number {
  return clamp(value, 0.3, 1);
}

export function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

type PointerRect = { left: number; top: number; width: number; height: number };

/** Posição do ponteiro em 0-1 dentro do retângulo, com y para cima (origem do GL). */
export function pointerToUnit(
  clientX: number,
  clientY: number,
  rect: PointerRect
): [number, number] {
  if (rect.width <= 0 || rect.height <= 0) return [0.5, 0.5];
  const x = clampUnit((clientX - rect.left) / rect.width);
  const y = clampUnit(1 - (clientY - rect.top) / rect.height);
  return [x, y];
}
