export type StretchSwitchSize = "sm" | "default" | "lg";

type SizeSpec = { trackWidth: number; trackHeight: number; thumb: number; padding: number };

export const SIZE_SPECS: Record<StretchSwitchSize, SizeSpec> = {
  sm: { trackWidth: 40, trackHeight: 22, thumb: 18, padding: 2 },
  default: { trackWidth: 52, trackHeight: 28, thumb: 24, padding: 2 },
  lg: { trackWidth: 64, trackHeight: 34, thumb: 30, padding: 2 },
};

const STIFFNESS_MIN = 120;
const STIFFNESS_MAX = 900;
const DAMPING_RATIO = 0.8;
// px/s -> fração de esticada; calibrado para o pico de velocidade de uma mola de ~24 px de curso.
const STRETCH_PER_VELOCITY = 0.0006;
const DRAG_THRESHOLD_PX = 3;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Curso do thumb dentro do trilho: largura útil menos o thumb. */
export function thumbTravel(size: StretchSwitchSize): number {
  const { trackWidth, thumb, padding } = SIZE_SPECS[size];
  return trackWidth - thumb - padding * 2;
}

/** Rigidez da mola, linear de 120 (speed 0) a 900 (speed 100); fora da faixa é limitado. */
export function stiffnessFromSpeed(speed: number): number {
  if (!Number.isFinite(speed)) {
    throw new Error(`stiffnessFromSpeed: received speed ${speed}, expected a finite number`);
  }
  const ratio = clamp(speed, 0, 100) / 100;
  return STIFFNESS_MIN + ratio * (STIFFNESS_MAX - STIFFNESS_MIN);
}

/** Amortecimento proporcional à rigidez, para a mola assentar sem oscilar demais em qualquer speed. */
export function dampingFromStiffness(stiffness: number): number {
  return 2 * Math.sqrt(stiffness) * DAMPING_RATIO;
}

/** Estica em X com a velocidade e afina em Y, mantendo a área (scaleX * scaleY = 1). */
export function stretchScale(
  velocity: number,
  stretch: number
): { scaleX: number; scaleY: number } {
  const max = 1 + clamp(stretch, 0, 100) / 100;
  const scaleX = Math.min(max, 1 + STRETCH_PER_VELOCITY * Math.abs(velocity));
  return { scaleX, scaleY: 1 / scaleX };
}

/** Soltar depois do meio do curso liga; no meio exato, não. */
export function resolveDragRelease(x: number, travel: number): boolean {
  return x > travel / 2;
}

/** Posição do thumb durante o arrasto, presa ao trilho. */
export function dragPosition(startX: number, deltaX: number, travel: number): number {
  return clamp(startX + deltaX, 0, travel);
}

/** Um arrasto que mal saiu do lugar conta como clique comum. */
export function isRealDrag(deltaX: number): boolean {
  return Math.abs(deltaX) > DRAG_THRESHOLD_PX;
}
