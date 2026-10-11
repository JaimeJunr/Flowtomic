"use client";

import { type AnimationPlaybackControls, animate, type MotionValue } from "motion/react";
import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import {
  CORNERS,
  freeCornerOrigins,
  lockedCornerOrigins,
  nearestQuarter,
  type Point,
  parallaxOffset,
  parseRadius,
  spinStep,
} from "./target-cursor-utils";
import { createValues, isHuman, useHideNativeCursor } from "./target-cursor-values";

export type ControllerOptions = {
  targetSelector: string;
  spinDuration: number;
  snapDuration: number;
  size: number;
  cornerSize: number;
  padding: number;
  parallax: boolean;
  matchRadius: boolean;
  showLabel: boolean;
  pressEffect: boolean;
  hideNativeCursor: boolean;
  container?: React.RefObject<HTMLElement | null>;
};

export type LockInfo = {
  label: string | null;
  radius: number;
  halfWidth: number;
  halfHeight: number;
};

// Seguir o ponteiro com o alvo travado: curto o bastante para não parecer atraso.
const FOLLOW_SECONDS = 0.12;
const PRESS_SECONDS = 0.15;
const MAX_FRAME_SECONDS = 0.1;

/**
 * Cérebro da mira: escuta o ponteiro, decide travar/soltar e empurra tudo para MotionValues
 * (sem re-render por movimento). Só `active` e `lock` são estado do React.
 */
export function useTargetCursorController(
  options: ControllerOptions,
  rootRef: React.RefObject<HTMLDivElement | null>
) {
  const reduce = useShouldReduceMotion();
  const [active, setActive] = React.useState(false);
  const [lock, setLock] = React.useState<LockInfo | null>(null);
  const [values] = React.useState(() => createValues(options.size, options.cornerSize));

  const latest = React.useRef({ options, reduce });
  const lockedEl = React.useRef<Element | null>(null);
  const quarter = React.useRef(0);
  const pointer = React.useRef<Point>({ x: 0, y: 0 });
  const activeRef = React.useRef(false);
  const releaseUntil = React.useRef(0);
  const lastFrame = React.useRef(0);
  const controls = React.useRef(new Map<MotionValue<number>, AnimationPlaybackControls>());
  React.useEffect(() => {
    latest.current = { options, reduce };
  });

  const { container } = options;

  React.useEffect(() => {
    const moveTo = (mv: MotionValue<number>, target: number, seconds: number) => {
      controls.current.get(mv)?.stop();
      if (latest.current.reduce || seconds <= 0) {
        mv.set(target);
        return;
      }
      controls.current.set(mv, animate(mv, target, { duration: seconds, ease: "easeOut" }));
    };

    // A raiz é fixed (ou absolute no container): as coordenadas dela partem do canto dela.
    const origin = (): Point => {
      const rect = (rootRef.current ?? container?.current)?.getBoundingClientRect();
      return { x: rect?.left ?? 0, y: rect?.top ?? 0 };
    };

    const place = (rect: DOMRect, seconds: number) => {
      const { options: o, reduce: r } = latest.current;
      const base = origin();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const par =
        o.parallax && !r
          ? parallaxOffset(pointer.current.x - cx, pointer.current.y - cy)
          : { x: 0, y: 0 };
      moveTo(values.x, cx - base.x + par.x, seconds);
      moveTo(values.y, cy - base.y + par.y, seconds);
      const origins = lockedCornerOrigins(rect, o.padding, o.cornerSize, quarter.current);
      for (const corner of CORNERS) {
        moveTo(values.corners[corner].x, origins[corner].x, seconds);
        moveTo(values.corners[corner].y, origins[corner].y, seconds);
      }
    };

    const lockTo = (el: Element) => {
      const { options: o } = latest.current;
      const rect = el.getBoundingClientRect();
      lockedEl.current = el;
      lastFrame.current = 0;
      controls.current.get(values.rotate)?.stop();
      const target = nearestQuarter(values.rotate.get());
      quarter.current = target / 90;
      moveTo(values.rotate, target, o.snapDuration);
      const radius = o.matchRadius
        ? parseRadius(getComputedStyle(el).borderRadius, o.cornerSize)
        : 0;
      setLock({
        label: o.showLabel ? el.getAttribute("data-cursor-label") : null,
        radius,
        halfWidth: rect.width / 2,
        halfHeight: rect.height / 2,
      });
      place(rect, o.snapDuration);
    };

    const release = () => {
      if (!lockedEl.current) return;
      const { options: o } = latest.current;
      lockedEl.current = null;
      lastFrame.current = 0;
      setLock(null);
      controls.current.get(values.rotate)?.stop();
      releaseUntil.current = performance.now() + o.snapDuration * 1000;
      const base = origin();
      moveTo(values.x, pointer.current.x - base.x, o.snapDuration);
      moveTo(values.y, pointer.current.y - base.y, o.snapDuration);
      const origins = freeCornerOrigins(o.size, o.cornerSize);
      for (const corner of CORNERS) {
        moveTo(values.corners[corner].x, origins[corner].x, o.snapDuration);
        moveTo(values.corners[corner].y, origins[corner].y, o.snapDuration);
      }
    };

    const follow = () => {
      const el = lockedEl.current;
      if (!el) return;
      if (!el.isConnected) release();
      else place(el.getBoundingClientRect(), 0);
    };

    const over = (target: EventTarget | null) => {
      if (!activeRef.current) return;
      const el =
        target instanceof Element ? target.closest(latest.current.options.targetSelector) : null;
      const inside = el && (!container?.current || container.current.contains(el));
      if (inside && el !== lockedEl.current) lockTo(el);
      else if (!inside) release();
    };

    const handleMove = (event: PointerEvent) => {
      if (!isHuman(event)) return;
      pointer.current = { x: event.clientX, y: event.clientY };
      if (!activeRef.current) {
        activeRef.current = true;
        setActive(true);
        over(event.target);
      }
      if (lockedEl.current) {
        if (lockedEl.current.isConnected) {
          place(lockedEl.current.getBoundingClientRect(), FOLLOW_SECONDS);
          return;
        }
        release();
      }
      const base = origin();
      const wait = (releaseUntil.current - performance.now()) / 1000;
      moveTo(values.x, event.clientX - base.x, wait);
      moveTo(values.y, event.clientY - base.y, wait);
    };

    const press = (down: boolean) => {
      if (!activeRef.current || !latest.current.options.pressEffect) return;
      moveTo(values.scale, down ? 0.85 : 1, PRESS_SECONDS);
      moveTo(values.dotScale, down ? 1.5 : 1, PRESS_SECONDS);
    };

    const handleLeave = () => {
      release();
      activeRef.current = false;
      setActive(false);
    };

    const handleOver = (event: Event) => over(event.target);
    const handleDown = () => press(true);
    const handleUp = () => press(false);

    const scope: HTMLElement | Window = container?.current ?? window;
    scope.addEventListener("pointermove", handleMove as EventListener);
    scope.addEventListener("pointerover", handleOver);
    if (container?.current) container.current.addEventListener("pointerleave", handleLeave);
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    const live = controls.current;
    return () => {
      scope.removeEventListener("pointermove", handleMove as EventListener);
      scope.removeEventListener("pointerover", handleOver);
      container?.current?.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
      for (const control of live.values()) control.stop();
      live.clear();
    };
  }, [container, rootRef, values]);

  // Tamanho da mira livre mudou por prop: reposiciona os braços (se não estiver travada).
  React.useEffect(() => {
    if (lockedEl.current) return;
    const origins = freeCornerOrigins(options.size, options.cornerSize);
    for (const corner of CORNERS) {
      values.corners[corner].x.set(origins[corner].x);
      values.corners[corner].y.set(origins[corner].y);
    }
  }, [options.size, options.cornerSize, values]);

  useFrameLoop(
    (now) => {
      if (lockedEl.current) return;
      const seconds = lastFrame.current
        ? Math.min((now - lastFrame.current) / 1000, MAX_FRAME_SECONDS)
        : 0;
      lastFrame.current = now;
      values.rotate.set(
        values.rotate.get() + spinStep(seconds, latest.current.options.spinDuration)
      );
    },
    active && options.spinDuration > 0 && !reduce
  );

  useHideNativeCursor(active && options.hideNativeCursor, container);

  return { active, lock, values };
}
