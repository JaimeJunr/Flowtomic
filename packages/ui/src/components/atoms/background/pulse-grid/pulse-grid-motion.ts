import { activeRipples, dueAutoRipples, pushRipple, type Ripple } from "./pulse-grid-utils";

export const CENTER = 0.5;

export type Motion = {
  ripples: Ripple[];
  nextAuto: number;
  time: number;
  lastTrail: number;
  x: number;
  y: number;
  strength: number;
  targetStrength: number;
  targetX: number;
  targetY: number;
};

export function initialMotion(): Motion {
  return {
    ripples: [],
    nextAuto: 0,
    time: 0,
    lastTrail: Number.NEGATIVE_INFINITY,
    x: CENTER,
    y: CENTER,
    strength: 0,
    targetStrength: 0,
    targetX: CENTER,
    targetY: CENTER,
  };
}

// Ondas automáticas saem do centro com força 1; as vencidas entram na fila.
export function advanceRipples(
  m: Motion,
  time: number,
  interval: number,
  reduced: boolean
): Ripple[] {
  m.time = time;
  if (reduced) return [];
  const due = dueAutoRipples(m.nextAuto, time, interval);
  m.nextAuto = due.next;
  for (const start of due.starts) {
    m.ripples = pushRipple(m.ripples, { x: CENTER, y: CENTER, start, strength: 1 });
  }
  m.ripples = activeRipples(m.ripples, time);
  return m.ripples;
}
