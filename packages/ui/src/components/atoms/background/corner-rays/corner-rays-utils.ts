import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_CORNER_RAYS_COLORS: [string, string] = ["--warning", "--info"];

export type CornerRaysOrigin = "top-right" | "top-left" | "bottom-right" | "bottom-left";

// Quanto o foco fica fora do quadro, na diagonal, para a luz entrar pelo canto.
const OUTSIDE = 0.1;

const CORNERS: Record<CornerRaysOrigin, { x: 0 | 1; y: 0 | 1; css: string }> = {
  "top-right": { x: 1, y: 1, css: "top right" },
  "top-left": { x: 0, y: 1, css: "top left" },
  "bottom-right": { x: 1, y: 0, css: "bottom right" },
  "bottom-left": { x: 0, y: 0, css: "bottom left" },
};

function corner(origin: string) {
  const found = CORNERS[origin as CornerRaysOrigin];
  if (!found || !Object.hasOwn(CORNERS, origin)) {
    throw new Error(
      `Received origin ${JSON.stringify(origin)}; expected one of "top-right", "top-left", "bottom-right", "bottom-left"`
    );
  }
  return found;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Foco da luz em coordenadas 0-1 (y para cima), empurrado para fora do quadro. */
export function originPoint(origin: string): { x: number; y: number } {
  const c = corner(origin);
  return {
    x: c.x === 1 ? 1 + OUTSIDE : -OUTSIDE,
    y: c.y === 1 ? 1 + OUTSIDE : -OUTSIDE,
  };
}

/** Canto sem o empurrão, usado para apontar o eixo do leque para o centro. */
export function cornerPoint(origin: string): { x: number; y: number } {
  const c = corner(origin);
  return { x: c.x, y: c.y };
}

export function assertColorTokens(colors: readonly string[]): void {
  if (colors.length !== 2) {
    throw new Error(`Received ${JSON.stringify(colors)}; expected 2 tokens`);
  }
  for (const token of colors) {
    if (!token.startsWith("--")) {
      throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
    }
  }
}

export const clampIntensity = (value: number) => clamp(value, 0, 4);
export const clampSpread = (value: number) => clamp(value, 0.2, 4);
export const clampTilt = (value: number) => clamp(value, -90, 90);
export const clampBlend = (value: number) => clamp(value, 0, 1);
export const clampFalloff = (value: number) => clamp(value, 0.3, 4);

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

/** Leque em CSS puro, aberto a partir do canto, para quando não há WebGL. */
export function fallbackBackground(token: string, origin: string): { background: string } {
  const c = corner(origin);
  return {
    background: `radial-gradient(ellipse at ${c.css}, color-mix(in oklch, var(${token}) 35%, transparent), transparent 60%)`,
  };
}
