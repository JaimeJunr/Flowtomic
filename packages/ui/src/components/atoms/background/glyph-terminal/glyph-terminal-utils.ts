import type { RgbColor } from "@/lib/read-theme-color";

export const DEFAULT_GLYPH_TINT = "--success";

// Dígitos em matriz 3x5, linhas de cima para baixo, colunas da esquerda para a direita.
const DIGIT_ROWS: readonly (readonly string[])[] = [
  ["111", "101", "101", "101", "111"],
  ["010", "110", "010", "010", "111"],
  ["111", "001", "111", "100", "111"],
  ["111", "001", "111", "001", "111"],
  ["101", "101", "111", "001", "001"],
  ["111", "100", "111", "001", "111"],
  ["111", "100", "111", "101", "111"],
  ["111", "001", "010", "010", "010"],
  ["111", "101", "111", "101", "111"],
  ["111", "101", "111", "001", "111"],
];

export const GLYPH_COUNT = DIGIT_ROWS.length;

/** 15 bits do dígito: o bit `linha * 3 + coluna` acende a sub-célula (linha 0 é o topo). */
export function glyphBits(digit: number): number {
  const rows = Number.isInteger(digit) ? DIGIT_ROWS[digit] : undefined;
  if (!rows) {
    throw new Error(`Received digit ${digit}; expected an integer from 0 to 9`);
  }
  let bits = 0;
  rows.forEach((row, rowIndex) => {
    for (let col = 0; col < 3; col++) {
      if (row[col] === "1") bits |= 1 << (rowIndex * 3 + col);
    }
  });
  return bits;
}

/** Constante GLSL com os dez padrões, gerada daqui para o shader não duplicar os desenhos. */
export function glyphTable(): string {
  const values = Array.from({ length: GLYPH_COUNT }, (_, digit) => glyphBits(digit));
  return `const int GLYPHS[${GLYPH_COUNT}] = int[${GLYPH_COUNT}](${values.join(",")});`;
}

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

export function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Lado do glifo em px, de 6 a 32. */
export function clampGlyphSize(value: number): number {
  return Math.min(32, Math.max(6, value));
}

export function clampGlitch(value: number): number {
  return Math.min(2, Math.max(0, value));
}

export function clampFlicker(value: number): number {
  return Math.min(2, Math.max(0, value));
}

export function clampCurvature(value: number): number {
  return Math.min(0.5, Math.max(0, value));
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
