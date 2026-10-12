export const DEFAULT_THREAD_COLOR = "--foreground";

/** Token de cor precisa ser nome de variável CSS; a mensagem traz a prop e o valor recebido. */
export function assertColorToken(token: string, prop: string): void {
  if (!token.startsWith("--")) {
    throw new Error(`Received ${prop} ${JSON.stringify(token)}; expected format "--token-name"`);
  }
}

/** Sem accentColor, os fios de fora puxam para a própria cor principal. */
export function resolveAccentToken(color: string, accent: string | undefined): string {
  if (accent === undefined) return color;
  assertColorToken(accent, "accentColor");
  return accent;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Inteiro de 8 a 160: fio fracionário quebraria a simetria do feixe. */
export function clampLineCount(value: number): number {
  return clamp(Math.round(value), 8, 160);
}

export function clampThickness(value: number): number {
  return clamp(value, 0.3, 3);
}

export function clampAmplitude(value: number): number {
  return clamp(value, 0, 3);
}

export function clampSpread(value: number): number {
  return clamp(value, 0, 1);
}

export function clampSplit(value: number): number {
  return clamp(value, 0, 1);
}

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
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
