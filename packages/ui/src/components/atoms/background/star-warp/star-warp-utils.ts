import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_STAR_WARP_COLORS: string[] = ["--foreground", "--info", "--primary"];
export const MAX_STAR_COLORS = 4;
export const MIN_LAYERS = 2;
export const MAX_LAYERS = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function assertColorTokens(colors: readonly string[]): void {
  if (colors.length < 1 || colors.length > MAX_STAR_COLORS) {
    throw new Error(`Received ${colors.length} color tokens; expected 1 to ${MAX_STAR_COLORS}`);
  }
  for (const token of colors) {
    if (!token.startsWith("--")) {
      throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
    }
  }
}

/** Número de camadas de profundidade: precisa ser inteiro de 2 a 8. */
export function resolveLayers(layers: number): number {
  if (!Number.isInteger(layers) || layers < MIN_LAYERS || layers > MAX_LAYERS) {
    throw new Error(`Received layers ${layers}; expected an integer from 2 to 8`);
  }
  return layers;
}

export const clampDensity = (value: number) => clamp(value, 0.3, 3);
export const clampStarSize = (value: number) => clamp(value, 0.3, 3);
export const clampFlare = (value: number) => clamp(value, 0, 2);
export const clampTwinkle = (value: number) => clamp(value, 0, 1);
export const clampTravel = (value: number) => clamp(value, -2, 2);

/** RGB 0-1 de exatamente 4 cores; as que sobram repetem a última. */
export function toColorUniform(colors: (RgbColor | null)[], fallback: RgbColor): Float32Array {
  const result = new Float32Array(MAX_STAR_COLORS * 3);
  for (let index = 0; index < MAX_STAR_COLORS; index++) {
    const source = colors[Math.min(index, colors.length - 1)] ?? fallback;
    result[index * 3] = source.r;
    result[index * 3 + 1] = source.g;
    result[index * 3 + 2] = source.b;
  }
  return result;
}

/** Aproxima `current` de `target` por `factor` a cada quadro; encosta quando está muito perto. */
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

/** Dois pontos de 1 px em grades de tamanhos diferentes, para quando não há WebGL. */
export function fallbackBackground(token: string): {
  background: string;
  backgroundSize: string;
} {
  const dot = `radial-gradient(circle at 20% 30%, var(${token}) 0 1px, transparent 1.5px)`;
  const dot2 = `radial-gradient(circle at 65% 70%, var(${token}) 0 1px, transparent 1.5px)`;
  return { background: `${dot}, ${dot2}`, backgroundSize: "50px 50px, 73px 73px" };
}
