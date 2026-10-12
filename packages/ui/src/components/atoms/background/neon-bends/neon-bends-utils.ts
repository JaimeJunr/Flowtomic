export const DEFAULT_NEON_COLORS: string[] = ["--primary", "--info"];
export const MAX_NEON_COLORS = 4;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Aceita de 1 a 4 nomes de variável CSS: é o tamanho do vec3[4] do shader. */
export function assertColorTokens(colors: readonly string[]): void {
  if (!Array.isArray(colors) || colors.length < 1 || colors.length > MAX_NEON_COLORS) {
    throw new Error(`Received colors ${JSON.stringify(colors)}; expected 1 to 4 tokens`);
  }
  for (const token of colors) {
    if (typeof token !== "string" || !token.startsWith("--")) {
      throw new Error(
        `Received colors token ${JSON.stringify(token)}; expected format "--token-name"`
      );
    }
  }
}

export function clampScale(value: number): number {
  return clamp(value, 0.3, 4);
}

export function clampFrequency(value: number): number {
  return clamp(value, 0.2, 4);
}

export function clampWarp(value: number): number {
  return clamp(value, 0, 3);
}

export function clampBandWidth(value: number): number {
  return clamp(value, 1, 20);
}

export function clampIntensity(value: number): number {
  return clamp(value, 0, 4);
}

/** Ângulo total em radianos: rotação fixa (graus) mais giro automático (graus/s). */
export function rotationRadians(rotation: number, spin: number, time: number): number {
  return ((rotation + spin * time) * Math.PI) / 180;
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
