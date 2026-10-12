import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_LIGHTNING_BOLTS_COLOR = "--info";

export const MIN_BOLTS = 1;
export const MAX_BOLTS = 4;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function assertColorToken(token: string): void {
  if (!token.startsWith("--")) {
    throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
  }
}

/** Número de raios: precisa ser inteiro de 1 a 4. */
export function resolveBolts(bolts: number): number {
  if (!Number.isInteger(bolts) || bolts < MIN_BOLTS || bolts > MAX_BOLTS) {
    throw new Error(`Received bolts ${bolts}; expected an integer from 1 to 4`);
  }
  return bolts;
}

export const clampSpread = (value: number) => clamp(value, 0, 1);
export const clampBranches = (value: number) => clamp(value, 0, 1);
export const clampThickness = (value: number) => clamp(value, 0.3, 3);
export const clampGlow = (value: number) => clamp(value, 0, 2);
export const clampFlicker = (value: number) => clamp(value, 0, 1);

/** Converte a cor em RGB 0-1 (3 números); cor ausente usa o fallback. */
export function toColorUniform(color: RgbColor | null, fallback: RgbColor): Float32Array {
  const source = color ?? fallback;
  return new Float32Array([source.r, source.g, source.b]);
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

/** Pixels de dispositivo por pixel CSS; sem largura CSS, vale a razão do dispositivo. */
export function deviceScale(canvasWidth: number, clientWidth: number, ratio: number): number {
  return clientWidth > 0 ? canvasWidth / clientWidth : ratio;
}

/** Fio de luz estreito no centro, em CSS puro, para quando não há WebGL. */
export function fallbackBackground(token: string): {
  backgroundImage: string;
  backgroundSize: string;
  backgroundRepeat: string;
  backgroundPosition: string;
} {
  return {
    backgroundImage: `linear-gradient(to bottom, color-mix(in oklch, var(${token}) 30%, transparent), transparent 60%)`,
    backgroundSize: "2px 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };
}
