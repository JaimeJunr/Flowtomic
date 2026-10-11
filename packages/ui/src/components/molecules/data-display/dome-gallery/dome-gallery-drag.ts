"use client";

import * as React from "react";
import { useFrameLoop } from "@/lib/use-frame-loop";
import {
  clamp,
  DOME_DRAG_THRESHOLD,
  DOME_STOP_VELOCITY,
  type DomeRotation,
  decayVelocity,
  dragRotation,
  sphereTransform,
} from "./dome-gallery-utils";

type DragOptions = {
  sphereRef: React.RefObject<HTMLDivElement | null>;
  radius: number;
  unit: number;
  sensitivity: number;
  maxVertical: number;
  dampening: number;
  reduced: boolean;
  disabled: boolean;
};

type Gesture = {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastT: number;
  moved: number;
  captured: boolean;
};

const FRAME_MS = 16;
// Parado antes de soltar não é lançamento: descarta a velocidade velha.
const STALE_MS = 80;
const MIN_DT = 8;

export function useDomeDrag(options: DragOptions) {
  const { sphereRef, radius, unit, sensitivity, maxVertical, dampening, reduced, disabled } =
    options;
  const rot = React.useRef<DomeRotation>({ x: 0, y: 0 });
  const vel = React.useRef<DomeRotation>({ x: 0, y: 0 });
  const gesture = React.useRef<Gesture | null>(null);
  const suppressClick = React.useRef(false);
  const lastFrame = React.useRef<number | null>(null);
  const [coasting, setCoasting] = React.useState(false);

  // Escreve direto na esfera: girar a 60 fps sem re-render do React.
  const apply = React.useCallback(() => {
    if (sphereRef.current) {
      sphereRef.current.style.transform = sphereTransform(radius, rot.current.x, rot.current.y);
    }
  }, [sphereRef, radius]);
  React.useLayoutEffect(apply, [apply]);

  useFrameLoop((now) => {
    const dt = lastFrame.current === null ? FRAME_MS : now - lastFrame.current;
    lastFrame.current = now;
    const step = dt / FRAME_MS;
    rot.current = {
      y: rot.current.y + vel.current.y * step,
      x: clamp(rot.current.x + vel.current.x * step, -maxVertical, maxVertical),
    };
    const atLimit = Math.abs(rot.current.x) >= maxVertical;
    vel.current = {
      y: decayVelocity(vel.current.y, dt, dampening),
      x: atLimit ? 0 : decayVelocity(vel.current.x, dt, dampening),
    };
    apply();
    if (Math.hypot(vel.current.x, vel.current.y) < DOME_STOP_VELOCITY) setCoasting(false);
  }, coasting);

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (disabled || event.button > 0) return;
    lastFrame.current = null;
    vel.current = { x: 0, y: 0 };
    setCoasting(false);
    suppressClick.current = false;
    gesture.current = {
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastT: performance.now(),
      moved: 0,
      captured: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const g = gesture.current;
    if (!g) return;
    const now = performance.now();
    const dt = Math.max(MIN_DT, now - g.lastT);
    const dx = event.clientX - g.lastX;
    const dy = event.clientY - g.lastY;
    const next = dragRotation(rot.current, dx, dy, sensitivity, maxVertical);
    vel.current = {
      y: ((next.y - rot.current.y) * FRAME_MS) / dt,
      x: ((next.x - rot.current.x) * FRAME_MS) / dt,
    };
    rot.current = next;
    g.lastX = event.clientX;
    g.lastY = event.clientY;
    g.lastT = now;
    g.moved = Math.hypot(event.clientX - g.startX, event.clientY - g.startY);
    if (g.moved > DOME_DRAG_THRESHOLD) {
      suppressClick.current = true;
      // Capturar só depois do limiar: capturar no pointerdown redireciona o clique do ladrilho.
      if (!g.captured) {
        g.captured = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }
    }
    apply();
  };

  const endGesture = (event: React.PointerEvent<HTMLElement>) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    if (g.captured) event.currentTarget.releasePointerCapture?.(event.pointerId);
    const stale = performance.now() - g.lastT > STALE_MS;
    if (reduced || stale) vel.current = { x: 0, y: 0 };
    if (Math.hypot(vel.current.x, vel.current.y) >= DOME_STOP_VELOCITY) setCoasting(true);
    // O clique sintético vem logo depois do pointerup; só então o bloqueio cai.
    setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    const step: Record<string, [number, number]> = {
      ArrowRight: [unit, 0],
      ArrowLeft: [-unit, 0],
      ArrowUp: [0, unit],
      ArrowDown: [0, -unit],
    };
    const delta = step[event.key];
    if (!delta) return;
    event.preventDefault();
    rot.current = {
      y: rot.current.y + delta[0],
      x: clamp(rot.current.x + delta[1], -maxVertical, maxVertical),
    };
    apply();
  };

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endGesture,
      onPointerCancel: endGesture,
      onKeyDown,
    },
    shouldIgnoreClick: () => suppressClick.current,
  };
}
