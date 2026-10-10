export type SwipeStackLayout = "fan" | "cascade" | "deck" | "pile";

export type RestPose = { x: number; y: number; rotate: number; scale: number; shade: number };

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function cycle(order: number[]): number[] {
  if (order.length < 2) return order;
  const [first, ...rest] = order;
  return [...rest, first];
}

export function uncycle(order: number[]): number[] {
  if (order.length < 2) return order;
  return [order[order.length - 1], ...order.slice(0, -1)];
}

export function assertSameLength(cards: number, labels: number): void {
  if (cards !== labels) {
    throw new Error(
      `SwipeStack: received ${cards} cards and ${labels} labels, expected the same length`
    );
  }
}

// `+ 0` troca -0 por 0, para a posicao do topo ser exatamente neutra.
const clean = (value: number) => value + 0;

function pilePose(position: number, spread: number): Pick<RestPose, "x" | "y" | "rotate"> {
  if (position === 0) return { x: 0, y: 0, rotate: 0 };
  const random = mulberry32(position);
  const unit = () => random() * 2 - 1;
  const amount = spread * 2;
  return {
    rotate: clean(unit() * 12 * amount),
    x: clean(unit() * 18 * amount),
    y: clean(unit() * 18 * amount),
  };
}

function layoutPose(
  position: number,
  layout: SwipeStackLayout,
  spread: number
): Pick<RestPose, "x" | "y" | "rotate"> {
  const amount = spread * 2;
  if (layout === "fan") return { x: 0, y: 0, rotate: position * 6 * amount };
  if (layout === "cascade")
    return { x: position * 14 * amount, y: position * 14 * amount, rotate: 0 };
  if (layout === "deck") return { x: 0, y: 0 - position * 10 * amount, rotate: 0 };
  return pilePose(position, spread);
}

export function restPose(
  position: number,
  layout: SwipeStackLayout,
  spread: number,
  depth: number
): RestPose {
  const base = layoutPose(position, layout, spread);
  return {
    x: clean(base.x),
    y: clean(base.y),
    rotate: clean(base.rotate),
    scale: 1 - position * 0.06 * depth * 2,
    shade: position * 0.15 * depth * 2,
  };
}

const SEND_VELOCITY = 600;

export function shouldSend(offset: number, velocity: number, threshold: number): boolean {
  return Math.abs(offset) > threshold || Math.abs(velocity) > SEND_VELOCITY;
}

const clamp = (value: number, limit: number) => Math.min(limit, Math.max(-limit, value));

export function tiltAngles(dx: number, dy: number, width: number, height: number, tilt: number) {
  if (tilt === 0 || width === 0 || height === 0) return { rotateX: 0, rotateY: 0 };
  return {
    rotateY: clamp((dx / width) * tilt, tilt) + 0,
    rotateX: clamp((-dy / height) * tilt, tilt) + 0,
  };
}

export type PointerSample = { x: number; y: number; t: number };

export function pointerVelocity(from: PointerSample, to: PointerSample) {
  const seconds = (to.t - from.t) / 1000;
  if (seconds <= 0) return { vx: 0, vy: 0 };
  return { vx: (to.x - from.x) / seconds, vy: (to.y - from.y) / seconds };
}

export function flightTarget(dx: number, dy: number, distance: number) {
  const length = Math.hypot(dx, dy);
  if (length === 0) return { x: distance, y: 0 };
  return { x: (dx / length) * distance, y: (dy / length) * distance };
}
