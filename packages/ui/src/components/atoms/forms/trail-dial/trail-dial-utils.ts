const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const RAD = Math.PI / 180;
// Segundos de inércia: quanto do deslocamento "continua" depois de soltar em velocidade 1x.
const INERTIA_SECONDS = 0.25;
// Fração da faixa por segundo a partir da qual o balanço já é o do flick.
const FLICK_RANGE_PER_SECOND = 1.5;
// Graus por segundo que enchem a energia da cauda.
const ENERGY_FULL_DEG_PER_SECOND = 720;
const COMET_SEGMENTS = 8;
const COMET_TAIL_MIN_WIDTH = 0.3;
const COMET_TAIL_MIN_OPACITY = 0.15;
// Um arco de 360 exatos degenera no SVG (início = fim); fica um fio abaixo disso.
const MAX_ARC_SPAN = 359.99;
const MIN_ARC_SPAN = 0.01;

function assertRange(fn: string, min: number, max: number): void {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new Error(
      `${fn}: received min ${min}, max ${max}, expected finite numbers with max > min`
    );
  }
}

/** Ângulo (0 = topo, horário) do valor; o arco vai de -sweep/2 a +sweep/2. */
export function valueToAngle(value: number, min: number, max: number, sweep: number): number {
  assertRange("valueToAngle", min, max);
  const ratio = clamp((value - min) / (max - min), 0, 1);
  return -sweep / 2 + ratio * sweep;
}

/** Valor do ângulo, preso ao arco e encaixado no step a partir de `min`. */
export function angleToValue(
  angle: number,
  min: number,
  max: number,
  sweep: number,
  step: number
): number {
  assertRange("angleToValue", min, max);
  const ratio = clamp((angle + sweep / 2) / sweep, 0, 1);
  return snapToStep(min + ratio * (max - min), min, max, step);
}

export function snapToStep(value: number, min: number, max: number, step: number): number {
  if (!Number.isFinite(step) || step <= 0) {
    throw new Error(`snapToStep: received step ${step}, expected a number > 0`);
  }
  const snapped = min + Math.round((value - min) / step) * step;
  // toFixed evita 0.30000000000000004 quando step é decimal.
  return clamp(Number(snapped.toFixed(10)), min, max);
}

/** Ângulo do ponto em relação ao centro: 0 = topo, positivo no sentido horário, (-180, 180]. */
export function pointToAngle(x: number, y: number, cx: number, cy: number): number {
  return Math.atan2(x - cx, -(y - cy)) / RAD;
}

/**
 * Limita o ângulo do ponteiro ao arco. Com abertura, o lado do ponteiro decide o extremo.
 * Em 360 não há abertura: para não saltar de um extremo ao outro pela emenda, o salto
 * (mais de 180° de uma amostra para a outra) fica no extremo de onde o ponteiro vinha.
 */
export function clampDragAngle(angle: number, previous: number, sweep: number): number {
  const half = sweep / 2;
  if (sweep >= 360) {
    if (Math.abs(angle - previous) > 180) return previous >= 0 ? half : -half;
    return angle;
  }
  return clamp(angle, -half, half);
}

function polar(cx: number, cy: number, r: number, angle: number): { x: number; y: number } {
  return { x: cx + r * Math.sin(angle * RAD), y: cy - r * Math.cos(angle * RAD) };
}

const fmt = (n: number): string => String(Number(n.toFixed(3)));

/** `d` do SVG para o arco de a0 a a1 (graus, 0 = topo, horário). */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const span = a1 - a0;
  const start = polar(cx, cy, r, a0);
  if (Math.abs(span) < MIN_ARC_SPAN) {
    return `M ${fmt(start.x)} ${fmt(start.y)} L ${fmt(start.x)} ${fmt(start.y)}`;
  }
  const end = polar(cx, cy, r, a0 + clamp(span, -MAX_ARC_SPAN, MAX_ARC_SPAN));
  const large = Math.abs(span) > 180 ? 1 : 0;
  const sweepFlag = span > 0 ? 1 : 0;
  return `M ${fmt(start.x)} ${fmt(start.y)} A ${fmt(r)} ${fmt(r)} 0 ${large} ${sweepFlag} ${fmt(end.x)} ${fmt(end.y)}`;
}

/** Valor onde a conta assenta: inércia proporcional à velocidade (valor/s), presa à faixa. */
export function releaseTarget(
  value: number,
  velocity: number,
  momentum: number,
  min: number,
  max: number,
  step: number
): number {
  if (momentum === 0 || velocity === 0) return snapToStep(value, min, max, step);
  return snapToStep(value + velocity * momentum * INERTIA_SECONDS, min, max, step);
}

/** Bounce da mola: `tap` parado, `flick` em velocidade alta, linear no meio. */
export function bounceForVelocity(
  velocity: number,
  min: number,
  max: number,
  tapBounce: number,
  flickBounce: number
): number {
  assertRange("bounceForVelocity", min, max);
  const t = clamp(Math.abs(velocity) / ((max - min) * FLICK_RANGE_PER_SECOND), 0, 1);
  return tapBounce + (flickBounce - tapBounce) * t;
}

/** Energia 0..1 da cauda a partir da velocidade angular (graus/s). */
export function energyFromAngularVelocity(degreesPerSecond: number): number {
  return clamp(Math.abs(degreesPerSecond) / ENERGY_FULL_DEG_PER_SECOND, 0, 1);
}

export type CometSegment = { from: number; to: number; opacity: number; width: number };

type CometInput = {
  angle: number;
  /** +1 quando a conta anda no sentido horário (cauda fica atrás, em ângulos menores). */
  direction: 1 | -1;
  energy: number;
  reach: number;
  thickness: number;
  width: number;
  sweep: number;
};

/** Segmentos da cauda, da cabeça (grosso, opaco) para trás (fino, translúcido), presos ao arco. */
export function cometSegments(input: CometInput): CometSegment[] {
  const { angle, direction, energy, reach, thickness, width, sweep } = input;
  const length = reach * clamp(energy, 0, 1);
  if (length <= 0) return [];
  const half = sweep / 2;
  const headWidth = thickness + width * energy;
  const segments: CometSegment[] = [];
  for (let i = 0; i < COMET_SEGMENTS; i++) {
    const near = clamp(angle - (direction * length * i) / COMET_SEGMENTS, -half, half);
    const far = clamp(angle - (direction * length * (i + 1)) / COMET_SEGMENTS, -half, half);
    if (Math.abs(near - far) < MIN_ARC_SPAN) continue;
    const t = i / COMET_SEGMENTS;
    segments.push({
      from: Math.min(near, far),
      to: Math.max(near, far),
      opacity: 1 - t * (1 - COMET_TAIL_MIN_OPACITY),
      width: headWidth * (1 - t * (1 - COMET_TAIL_MIN_WIDTH)),
    });
  }
  return segments;
}
