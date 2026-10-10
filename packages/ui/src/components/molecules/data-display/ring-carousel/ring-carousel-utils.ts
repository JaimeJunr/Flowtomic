export type RingSample = { t: number; rotation: number };

const VELOCITY_WINDOW_MS = 100;

export function stepAngle(count: number): number {
  return 360 / count;
}

export function ringRadius(count: number, cardWidth: number, gap: number): number {
  if (count < 3) {
    throw new Error(`ringRadius: received count ${count}, expected an integer >= 3`);
  }
  return (cardWidth + gap) / (2 * Math.tan(Math.PI / count));
}

export function nearestSnap(rotation: number, step: number): number {
  return Math.round(rotation / step) * step;
}

function wrapDegrees(angle: number): number {
  return ((((angle + 180) % 360) + 360) % 360) - 180;
}

// O cartão `index` fica na frente quando index*step + rotation = 0 (mod 360).
export function shortestRotationTo(rotation: number, index: number, step: number): number {
  return rotation + wrapDegrees(-index * step - rotation);
}

export function frontIndex(rotation: number, count: number): number {
  const index = Math.round(-rotation / stepAngle(count));
  return ((index % count) + count) % count;
}

export function depthShade(
  rotation: number,
  index: number,
  count: number,
  depthFade: number
): number {
  const angle = ((index * stepAngle(count) + rotation) * Math.PI) / 180;
  return (depthFade * (1 - Math.cos(angle))) / 2;
}

export function dragToDegrees(dx: number, radius: number): number {
  return (dx * 360) / (2 * Math.PI * radius);
}

export function releaseVelocity(samples: RingSample[], now: number): number {
  const recent = samples.filter((sample) => now - sample.t <= VELOCITY_WINDOW_MS);
  if (recent.length < 2) return 0;
  const first = recent[0];
  const last = recent[recent.length - 1];
  const seconds = (last.t - first.t) / 1000;
  return seconds > 0 ? (last.rotation - first.rotation) / seconds : 0;
}

export function decayVelocity(velocity: number, dt: number): number {
  return velocity * 0.95 ** (dt * 60);
}

// Aproxima `current` de `target` em `duration` s, sem passar do alvo.
export function approach(current: number, target: number, dt: number, duration: number): number {
  const delta = dt / duration;
  if (Math.abs(target - current) <= delta) return target;
  return current + Math.sign(target - current) * delta;
}

export function cardTransform(index: number, count: number, radius: number): string {
  const angle = index * stepAngle(count);
  return `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`;
}
