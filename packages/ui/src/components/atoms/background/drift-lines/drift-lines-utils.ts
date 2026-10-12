export type DriftWave = "top" | "middle" | "bottom";
export type DriftColors = [string, string];

export const DEFAULT_DRIFT_COLORS: DriftColors = ["--primary", "--info"];
export const DEFAULT_DRIFT_WAVES: DriftWave[] = ["top", "middle", "bottom"];

const WAVE_ORDER: DriftWave[] = ["top", "middle", "bottom"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function assertToken(token: string): void {
  if (typeof token !== "string" || !token.startsWith("--")) {
    throw new Error(
      `Received colors token ${JSON.stringify(token)}; expected format "--token-name"`
    );
  }
}

/** O gradiente tem duas pontas: exige exatamente dois nomes de variável CSS. */
export function assertColorTokens(colors: readonly string[]): void {
  if (!Array.isArray(colors) || colors.length !== 2) {
    throw new Error(`Received colors ${JSON.stringify(colors)}; expected exactly 2 tokens`);
  }
  assertToken(colors[0]);
  assertToken(colors[1]);
}

/** Liga/desliga cada feixe no shader: [alto, meio, baixo] em 0/1. */
export function wavesMask(waves: readonly DriftWave[]): [number, number, number] {
  for (const wave of waves) {
    if (!WAVE_ORDER.includes(wave)) {
      throw new Error(
        `Received wave ${JSON.stringify(wave)}; expected "top", "middle" or "bottom"`
      );
    }
  }
  return [
    waves.includes("top") ? 1 : 0,
    waves.includes("middle") ? 1 : 0,
    waves.includes("bottom") ? 1 : 0,
  ];
}

/** Inteiro de 1 a 12: é o limite do laço do shader. */
export function clampLineCount(value: number): number {
  return clamp(Math.round(value), 1, 12);
}

export function clampLineGap(value: number): number {
  return clamp(value, 0.2, 4);
}

export function clampBend(value: number): number {
  return clamp(value, -2, 2);
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
