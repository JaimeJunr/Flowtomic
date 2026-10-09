export const GLARE_REST_POSITION = "-100% -100%";
export const GLARE_ACTIVE_POSITION = "100% 100%";
// Reflexo estático do movimento reduzido: faixa parada no meio da superfície.
export const GLARE_STATIC_POSITION = "50% 50%";

export function assertOpacity(opacity: number): void {
  if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
    throw new RangeError(
      `invalid glareOpacity: received ${opacity}, expected a number from 0 to 1`
    );
  }
}

export function glareColorMix(color: string, opacity: number): string {
  assertOpacity(opacity);
  return `color-mix(in oklab, ${color} ${Math.round(opacity * 100)}%, transparent)`;
}

export function glareGradient(angle: number, color: string, opacity: number): string {
  const mixed = glareColorMix(color, opacity);
  return `linear-gradient(${angle}deg, transparent 60%, ${mixed} 70%, transparent 80%)`;
}

export function sweepTransition(duration: number): string {
  return `background-position ${duration}ms ease`;
}
