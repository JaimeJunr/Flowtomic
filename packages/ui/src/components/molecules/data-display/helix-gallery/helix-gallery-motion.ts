"use client";

import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import {
  approach,
  directionSign,
  type HelixMode,
  type HelixOptions,
  helixSlot,
  slotStyle,
  usesAuto,
  usesDrag,
  usesScroll,
} from "./helix-gallery-utils";

export type HelixMotionParams = HelixOptions & {
  cardTilt: number;
  speed: number;
  direction: "up" | "down";
  mode: HelixMode;
  pauseOnHover: boolean;
};

// Tempo (s) das aproximações: ~400 ms para parar/retomar, ~600 ms para a inércia morrer.
const VELOCITY_TAU = 0.13;
const INERTIA_TAU = 0.2;
const MAX_DT = 0.1;
const MAX_INERTIA = 30;
const DRAG_THRESHOLD = 4;

type MotionState = {
  progress: number;
  velocity: number;
  inertia: number;
  dragVelocity: number;
  hovering: boolean;
  focused: boolean;
  dragging: boolean;
  lastY: number;
  lastTime: number;
  moved: number;
  lastScroll: number;
  lastFrame: number | null;
};

const initialState = (): MotionState => ({
  progress: 0,
  velocity: 1,
  inertia: 0,
  dragVelocity: 0,
  hovering: false,
  focused: false,
  dragging: false,
  lastY: 0,
  lastTime: 0,
  moved: 0,
  lastScroll: 0,
  lastFrame: null,
});

const isMouseLike = (event: React.PointerEvent) =>
  event.pointerType === "mouse" || event.pointerType === "pen";

/** Escreve o transform direto nos cartões (sem re-render) e cuida de laço, arrasto e rolagem. */
export function useHelixMotion(params: HelixMotionParams, reduced: boolean) {
  const cards = React.useRef<(HTMLElement | null)[]>([]);
  const paramsRef = React.useRef(params);
  const state = React.useRef<MotionState>(initialState());

  const apply = React.useCallback(() => {
    const p = paramsRef.current;
    cards.current.forEach((element, index) => {
      if (!element) return;
      const style = slotStyle(helixSlot(index, state.current.progress, p), p.cardTilt);
      element.style.transform = style.transform;
      element.style.opacity = String(style.opacity);
      element.style.filter = style.filter;
    });
  }, []);

  React.useLayoutEffect(() => {
    paramsRef.current = params;
    apply();
  });

  const register = React.useCallback((index: number, element: HTMLElement | null) => {
    cards.current[index] = element;
  }, []);

  const onFrame = (now: number) => {
    const s = state.current;
    const p = paramsRef.current;
    const dt = s.lastFrame === null ? 0 : Math.min((now - s.lastFrame) / 1000, MAX_DT);
    s.lastFrame = now;
    const paused = (s.hovering && p.pauseOnHover) || s.focused;
    s.velocity = approach(s.velocity, paused ? 0 : 1, dt, VELOCITY_TAU);
    // A cauda exponencial nunca chega a zero; abaixo disso o laço para de verdade.
    if (paused && s.velocity < 0.001) s.velocity = 0;
    let delta = usesAuto(p.mode) ? directionSign(p.direction) * p.speed * dt * s.velocity : 0;
    if (!s.dragging && s.inertia !== 0) {
      delta += s.inertia * dt;
      s.inertia = Math.abs(s.inertia) < 0.01 ? 0 : approach(s.inertia, 0, dt, INERTIA_TAU);
    }
    if (delta === 0) return;
    s.progress += delta;
    apply();
  };
  useFrameLoop(onFrame, !reduced && (usesAuto(params.mode) || usesDrag(params.mode)));

  const scrollEnabled = usesScroll(params.mode) && !reduced;
  React.useEffect(() => {
    if (!scrollEnabled) return;
    state.current.lastScroll = window.scrollY;
    const onScroll = () => {
      const p = paramsRef.current;
      const delta = window.scrollY - state.current.lastScroll;
      state.current.lastScroll = window.scrollY;
      state.current.progress += (delta / p.verticalSpacing) * p.speed * directionSign(p.direction);
      apply();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollEnabled, apply]);

  const handlers = {
    onPointerEnter: (event: React.PointerEvent) => {
      if (isMouseLike(event)) state.current.hovering = true;
    },
    onPointerLeave: (event: React.PointerEvent) => {
      if (isMouseLike(event)) state.current.hovering = false;
    },
    onFocus: () => {
      state.current.focused = true;
    },
    onBlur: () => {
      state.current.focused = false;
    },
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (!usesDrag(paramsRef.current.mode) || event.button !== 0) return;
      const s = state.current;
      Object.assign(s, {
        dragging: true,
        lastY: event.clientY,
        lastTime: event.timeStamp,
        moved: 0,
        inertia: 0,
        dragVelocity: 0,
      });
      try {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      } catch {
        // Ponteiro sintético (teste, caneta sem captura): o arrasto segue sem captura.
      }
    },
    onPointerMove: (event: React.PointerEvent) => {
      const s = state.current;
      if (!s.dragging) return;
      const dy = event.clientY - s.lastY;
      const elapsed = (event.timeStamp - s.lastTime) / 1000;
      const step = -dy / paramsRef.current.verticalSpacing;
      s.progress += step;
      s.moved += Math.abs(dy);
      if (elapsed > 0) s.dragVelocity = s.dragVelocity * 0.5 + (step / elapsed) * 0.5;
      s.lastY = event.clientY;
      s.lastTime = event.timeStamp;
      apply();
    },
    onPointerUp: (event: React.PointerEvent) => {
      const s = state.current;
      if (!s.dragging) return;
      s.dragging = false;
      // Mão parada antes de soltar: sem inércia.
      const idle = event.timeStamp - s.lastTime > 100;
      const v = reduced || idle ? 0 : s.dragVelocity;
      s.inertia = Math.max(-MAX_INERTIA, Math.min(MAX_INERTIA, v));
    },
    // Arrasto de verdade não deve disparar o clique do link.
    onClickCapture: (event: React.MouseEvent) => {
      if (state.current.moved > DRAG_THRESHOLD) {
        event.preventDefault();
        state.current.moved = 0;
      }
    },
  };

  return { register, handlers };
}
