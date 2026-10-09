"use client";

import * as React from "react";

export type FuseToastCloseReason =
  | "timeout"
  | "swipe"
  | "action"
  | "close"
  | "escape"
  | "programmatic";

/** Velocidade (px/s) acima da qual um peteleco sempre dispensa. */
export const FLICK_VELOCITY = 500;

/** Distância (px) em que a opacidade chega a zero durante o arraste. */
export const SWIPE_FADE_DISTANCE = 240;

/** Dispensa se o arraste passou da distância ou se foi um peteleco rápido. */
export function shouldDismiss(dx: number, vx: number, distance: number): boolean {
  if (!Number.isFinite(dx) || !Number.isFinite(vx) || !(distance >= 0)) {
    throw new Error(
      `shouldDismiss: received dx ${dx}, vx ${vx}, distance ${distance}, expected finite dx/vx and distance >= 0`
    );
  }
  return Math.abs(dx) > distance || Math.abs(vx) > FLICK_VELOCITY;
}

/** Quanto do pavio ainda resta: 1 cheio, 0 queimado, linear e limitado a 0..1. */
export function fuseRemaining(elapsedMs: number, durationMs: number): number {
  if (!(durationMs > 0)) {
    throw new Error(
      `fuseRemaining: received durationMs ${durationMs}, expected a number greater than 0`
    );
  }
  return Math.min(1, Math.max(0, 1 - elapsedMs / durationMs));
}

/** Opacidade durante o arraste: cai linearmente com |dx|, nunca abaixo de 0. */
export function swipeOpacity(dx: number): number {
  return Math.min(1, Math.max(0, 1 - Math.abs(dx) / SWIPE_FADE_DISTANCE));
}

type FuseTimerOptions = {
  active: boolean;
  durationMs: number;
  paused: boolean;
  onEnd: () => void;
};

/**
 * Pavio: o tempo decorrido (rAF, só avança quando não pausado) é a fonte da verdade,
 * então pausar e retomar guarda o tempo restante. Mudar `durationMs` ou `active` rearma.
 */
export function useFuseTimer({ active, durationMs, paused, onEnd }: FuseTimerOptions): number {
  const [remaining, setRemaining] = React.useState(1);
  const pausedRef = React.useRef(paused);
  pausedRef.current = paused;
  const onEndRef = React.useRef(onEnd);
  onEndRef.current = onEnd;

  React.useEffect(() => {
    setRemaining(1);
    if (!active || !(durationMs > 0)) return;
    let elapsed = 0;
    let last: number | null = null;
    let frame = 0;
    const tick = (now: number) => {
      if (last !== null && !pausedRef.current) elapsed += now - last;
      last = now;
      const left = fuseRemaining(elapsed, durationMs);
      setRemaining(left);
      if (left <= 0) return onEndRef.current();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, durationMs]);

  return remaining;
}
