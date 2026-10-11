import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_SWIRL_COLORS: [string, string, string] = [
  "--primary",
  "--info",
  "--background",
];

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
    throw new Error(`Received ${colors.length} color tokens; expected 3`);
  }
  for (const token of colors) {
    if (!token.startsWith("--")) {
      throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampSpin(value: number): number {
  return clamp(value, -3, 3);
}

export function clampContrast(value: number): number {
  return clamp(value, 0.5, 4);
}

/** Inteiro de 1 a 12: pixel fracionário borraria a grade. */
export function clampPixelSize(value: number): number {
  return clamp(Math.round(value), 1, 12);
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
  const x = clamp((clientX - rect.left) / rect.width, 0, 1);
  const y = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
  return [x, y];
}
