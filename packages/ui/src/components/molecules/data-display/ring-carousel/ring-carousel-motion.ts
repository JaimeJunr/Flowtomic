"use client";

import { type AnimationPlaybackControls, animate, useMotionValue } from "motion/react";
import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import {
  approach,
  decayVelocity,
  dragToDegrees,
  frontIndex,
  nearestSnap,
  type RingSample,
  releaseVelocity,
  shortestRotationTo,
} from "./ring-carousel-utils";

export type RingMotionOptions = {
  rootRef: React.RefObject<HTMLDivElement | null>;
  count: number;
  step: number;
  radius: number;
  autoplay: "drift" | "step" | "off";
  speed: number;
  interval: number;
  direction: "left" | "right";
  draggable: boolean;
  snap: boolean;
  pauseOnHover: boolean;
  focusOnClick: boolean;
  reduce: boolean;
  onFrontChange?: (index: number) => void;
  announce: (index: number) => void;
};

type Mode = "auto" | "drag" | "inertia" | "glide";
type Press = { startX: number; lastX: number; moved: boolean };

const DRAG_THRESHOLD_PX = 4;
const STOP_VELOCITY = 5;
const HOVER_EASE_S = 0.4;
const GLIDE_SPRING = { type: "spring" as const, stiffness: 90, damping: 18 };

function useInView(rootRef: React.RefObject<HTMLDivElement | null>): boolean {
  const [inView, setInView] = React.useState(true);
  React.useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      if (last) setInView(last.isIntersecting);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootRef]);
  return inView;
}

export function useRingMotion(options: RingMotionOptions) {
  const opts = React.useRef(options);
  opts.current = options;
  const rotation = useMotionValue(0);
  const [front, setFront] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const inView = useInView(options.rootRef);

  const run = React.useRef({
    mode: "auto" as Mode,
    velocity: 0,
    dir: options.direction === "left" ? -1 : 1,
    hover: 1,
    hovering: false,
    lastNow: null as number | null,
    clock: 0,
    keyPaused: false,
    press: null as Press | null,
    samples: [] as RingSample[],
    glide: null as AnimationPlaybackControls | null,
    justDragged: false,
  });

  React.useEffect(() => {
    run.current.dir = options.direction === "left" ? -1 : 1;
  }, [options.direction]);

  React.useEffect(
    () => rotation.on("change", (value) => setFront(frontIndex(value, opts.current.count))),
    [rotation]
  );

  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    opts.current.onFrontChange?.(front);
  }, [front]);

  const glideTo = (target: number) => {
    const state = run.current;
    state.glide?.stop();
    state.clock = 0;
    if (opts.current.reduce) {
      state.mode = "auto";
      rotation.set(target);
      return;
    }
    state.mode = "glide";
    state.glide = animate(rotation, target, {
      ...GLIDE_SPRING,
      onComplete: () => {
        state.mode = "auto";
      },
    });
  };

  const settle = () => {
    const { snap, step } = opts.current;
    if (snap) glideTo(nearestSnap(rotation.get(), step));
    else run.current.mode = "auto";
  };

  const runInertia = (dt: number) => {
    const state = run.current;
    rotation.set(rotation.get() + state.velocity * dt);
    state.velocity = decayVelocity(state.velocity, dt);
    if (Math.abs(state.velocity) < STOP_VELOCITY) settle();
  };

  const runAutoplay = (dt: number) => {
    const { autoplay, speed, interval, pauseOnHover, step } = opts.current;
    const state = run.current;
    if (autoplay === "off" || state.keyPaused) return;
    state.hover = approach(state.hover, pauseOnHover && state.hovering ? 0 : 1, dt, HOVER_EASE_S);
    if (autoplay === "drift") {
      rotation.set(rotation.get() + state.dir * speed * state.hover * dt);
      return;
    }
    state.clock += dt * state.hover;
    if (state.clock >= interval) glideTo(nearestSnap(rotation.get(), step) + state.dir * step);
  };

  useFrameLoop((now) => {
    const state = run.current;
    const dt = state.lastNow === null ? 0 : Math.min((now - state.lastNow) / 1000, 0.1);
    state.lastNow = now;
    if (state.mode === "inertia") runInertia(dt);
    else if (state.mode === "auto") runAutoplay(dt);
  }, !options.reduce && inView);

  const focusCard = (index: number) => {
    if (!opts.current.focusOnClick || run.current.justDragged) return;
    opts.current.announce(index);
    glideTo(shortestRotationTo(rotation.get(), index, opts.current.step));
  };

  const goBy = (delta: number) => {
    const { step, count, announce } = opts.current;
    const target = nearestSnap(rotation.get(), step) - delta * step;
    run.current.keyPaused = true;
    announce(frontIndex(target, count));
    glideTo(target);
  };

  const handlers = {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      const state = run.current;
      state.keyPaused = false;
      if (!opts.current.draggable) return;
      state.justDragged = false;
      state.glide?.stop();
      if (state.mode === "glide" || state.mode === "inertia") state.mode = "auto";
      state.press = { startX: event.clientX, lastX: event.clientX, moved: false };
      state.samples = [];
    },
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      const state = run.current;
      const press = state.press;
      if (!press) return;
      if (!press.moved) {
        if (Math.abs(event.clientX - press.startX) < DRAG_THRESHOLD_PX) return;
        press.moved = true;
        state.mode = "drag";
        setDragging(true);
        try {
          event.currentTarget.setPointerCapture?.(event.pointerId);
        } catch {
          // Captura é só conforto; sem ela o arraste continua dentro da raiz.
        }
      }
      const degrees = dragToDegrees(event.clientX - press.lastX, opts.current.radius);
      press.lastX = event.clientX;
      rotation.set(rotation.get() + degrees);
      const now = performance.now();
      state.samples = [
        ...state.samples.filter((s) => now - s.t <= 200),
        { t: now, rotation: rotation.get() },
      ];
    },
    onPointerUp: () => {
      const state = run.current;
      const press = state.press;
      state.press = null;
      if (!press?.moved) return;
      setDragging(false);
      state.justDragged = true;
      const velocity = opts.current.reduce ? 0 : releaseVelocity(state.samples, performance.now());
      if (Math.abs(velocity) < STOP_VELOCITY) {
        settle();
        return;
      }
      state.dir = Math.sign(velocity);
      state.velocity = velocity;
      state.mode = "inertia";
    },
    onPointerEnter: (event: React.PointerEvent<HTMLDivElement>) => {
      run.current.keyPaused = false;
      if (event.pointerType === "mouse" || event.pointerType === "pen") run.current.hovering = true;
    },
    onPointerLeave: () => {
      run.current.hovering = false;
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") goBy(1);
      else if (event.key === "ArrowLeft") goBy(-1);
    },
  };

  return { rotation, front, dragging, handlers, focusCard };
}
