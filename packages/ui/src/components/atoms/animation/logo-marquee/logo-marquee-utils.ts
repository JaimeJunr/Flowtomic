function assertNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name}: received ${value}, expected a finite number >= 0`);
  }
}

/** Quantas cópias da lista cobrem 2x a área visível (mínimo 2, para a emenda). */
export function copiesNeeded(copySize: number, viewport: number): number {
  assertNonNegative("copiesNeeded copySize", copySize);
  assertNonNegative("copiesNeeded viewport", viewport);
  if (copySize === 0) return 2;
  return Math.max(2, Math.ceil((2 * viewport) / copySize));
}

/** Reduz o deslocamento ao intervalo [0, copySize); sem emenda porque as cópias são idênticas. */
export function wrapOffset(offset: number, copySize: number): number {
  if (!Number.isFinite(offset)) {
    throw new Error(`wrapOffset offset: received ${offset}, expected a finite number`);
  }
  assertNonNegative("wrapOffset copySize", copySize);
  if (copySize === 0) return 0;
  return ((offset % copySize) + copySize) % copySize;
}

/** Amortecimento exponencial: a velocidade atual persegue o alvo com constante `tau` (s). */
export function approach(current: number, target: number, dt: number, tau: number): number {
  assertNonNegative("approach dt", dt);
  assertNonNegative("approach tau", tau);
  if (tau === 0) return target;
  return target + (current - target) * Math.exp(-dt / tau);
}
