/**
 * Keyframes de rotação (graus) do balanço: [0, +a1, -a2, +a3, ..., 0].
 * a_n = amplitude * (1 - (n-1)/passes) ** decay. `passes` = meias-oscilações.
 */
export function ringKeyframes(amplitude: number, passes: number, decay: number): number[] {
  if (!Number.isInteger(passes) || passes < 0) {
    throw new Error(`ringKeyframes: received passes ${passes}, expected an integer >= 0`);
  }
  if (!Number.isFinite(amplitude)) {
    throw new Error(`ringKeyframes: received amplitude ${amplitude}, expected a finite number`);
  }
  if (passes === 0) return [0];
  const swings = Array.from({ length: passes }, (_, index) => {
    const magnitude = amplitude * (1 - index / passes) ** decay;
    return index % 2 === 0 ? magnitude : -magnitude;
  });
  return [0, ...swings, 0];
}
