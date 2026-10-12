export type ElevationColors = [string, string, string];

export const DEFAULT_ELEVATION_COLORS: ElevationColors = ["--primary", "--info", "--foreground"];

// Altura em que a cor do meio é pura; abaixo mistura baixo-meio, acima meio-alto.
export const MID_HEIGHT = 0.6;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function assertToken(token: unknown): void {
  if (typeof token !== "string" || !token.startsWith("--")) {
    throw new Error(
      `Received colors token ${JSON.stringify(token)}; expected format "--token-name"`
    );
  }
}

/** O mapa tem três faixas (baixo, meio, alto): exige exatamente três nomes de variável CSS. */
export function assertColorTokens(colors: readonly string[]): void {
  if (!Array.isArray(colors) || colors.length !== 3) {
    throw new Error(`Received colors ${JSON.stringify(colors)}; expected exactly 3 tokens`);
  }
  for (const token of colors) assertToken(token);
}

/** Pesos [baixo, meio, alto] da cor numa altura 0-1; é o mesmo desenho do shader. */
export function heightToColorStop(height: number): [number, number, number] {
  const h = clamp(height, 0, 1);
  const up = smoothstep(0, MID_HEIGHT, h);
  const top = smoothstep(MID_HEIGHT, 1, h);
  return [1 - up, up * (1 - top), top];
}

export function clampMorph(value: number): number {
  return clamp(value, 0, 5);
}

export function clampBands(value: number): number {
  return clamp(value, 0.5, 8);
}

export function clampThickness(value: number): number {
  return clamp(value, 0.002, 0.05);
}

export function clampScale(value: number): number {
  return clamp(value, 0.3, 4);
}

export function clampGlow(value: number): number {
  return clamp(value, 0, 2);
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
