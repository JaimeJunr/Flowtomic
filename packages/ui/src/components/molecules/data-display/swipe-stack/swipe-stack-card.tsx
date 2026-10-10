"use client";

import { animate, motion, useMotionValue } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";
import {
  flightTarget,
  type PointerSample,
  pointerVelocity,
  type RestPose,
  shouldSend,
  tiltAngles,
} from "./swipe-stack-utils";

const CLICK_SLOP = 4;

export type SwipeCardProps = {
  position: number;
  label: string;
  hidden: boolean;
  pose: RestPose;
  fanOrigin: boolean;
  zIndex: number;
  tilt: number;
  threshold: number;
  speed: number;
  reduceMotion: boolean;
  sendToBackOnClick: boolean;
  onSend: () => void;
  onDragChange: (dragging: boolean) => void;
  children: React.ReactNode;
};

type DragState = {
  startX: number;
  startY: number;
  width: number;
  height: number;
  samples: PointerSample[];
};

function capture(target: HTMLElement, pointerId: number) {
  try {
    target.setPointerCapture?.(pointerId);
  } catch {
    // Ponteiro sintetico (teste) nao pode ser capturado; o arraste segue sem captura.
  }
}

function useCardDrag(props: SwipeCardProps) {
  const { tilt, threshold, speed, reduceMotion, sendToBackOnClick, onSend, onDragChange } = props;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const transformOrigin = useMotionValue("50% 50%");
  const drag = React.useRef<DragState | null>(null);

  const reset = React.useCallback(() => {
    const spring = { type: "spring" as const, stiffness: 300 * speed, damping: 26 };
    animate(x, 0, spring);
    animate(y, 0, spring);
    animate(rotateX, 0, spring);
    animate(rotateY, 0, spring);
  }, [speed, x, y, rotateX, rotateY]);

  const fly = (dx: number, dy: number, width: number, height: number) => {
    if (reduceMotion) return onSend();
    const target = flightTarget(dx, dy, Math.max(width, height) * 1.5);
    const exit = { duration: 0.25, ease: "easeOut" as const };
    Promise.all([animate(x, target.x, exit), animate(y, target.y, exit)]).then(() => {
      // Ao virar o ultimo, o cartao volta por tras da pilha em vez de sumir.
      onSend();
      rotateX.set(0);
      rotateY.set(0);
      reset();
    });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    capture(event.currentTarget, event.pointerId);
    const ox = rect.width ? ((event.clientX - rect.left) / rect.width) * 100 : 50;
    const oy = rect.height ? ((event.clientY - rect.top) / rect.height) * 100 : 50;
    transformOrigin.set(`${ox}% ${oy}%`);
    const start = { x: event.clientX, y: event.clientY, t: event.timeStamp };
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width,
      height: rect.height,
      samples: [start],
    };
    onDragChange(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    x.set(dx);
    y.set(dy);
    if (!reduceMotion) {
      const angles = tiltAngles(dx, dy, state.width, state.height, tilt);
      rotateX.set(angles.rotateX);
      rotateY.set(angles.rotateY);
    }
    state.samples = [
      ...state.samples.slice(-2),
      { x: event.clientX, y: event.clientY, t: event.timeStamp },
    ];
  };

  const finish = (event: React.PointerEvent<HTMLElement>, cancelled: boolean) => {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    onDragChange(false);
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    const distance = Math.hypot(dx, dy);
    if (cancelled) return reset();
    if (distance < CLICK_SLOP) {
      reset();
      if (sendToBackOnClick) onSend();
      return;
    }
    const { vx, vy } = pointerVelocity(state.samples[0], state.samples[state.samples.length - 1]);
    if (shouldSend(distance, Math.hypot(vx, vy), threshold)) fly(dx, dy, state.width, state.height);
    else reset();
  };

  return {
    style: { x, y, rotateX, rotateY, transformOrigin, transformPerspective: 900 },
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: React.PointerEvent<HTMLElement>) => finish(event, false),
      onPointerCancel: (event: React.PointerEvent<HTMLElement>) => finish(event, true),
    },
  };
}

export function SwipeCard(props: SwipeCardProps) {
  const { position, label, hidden, pose, fanOrigin, zIndex, speed, reduceMotion, children } = props;
  const isTop = position === 0;
  const { style, handlers } = useCardDrag(props);
  const transition = reduceMotion
    ? { duration: 0.2 }
    : { type: "spring" as const, stiffness: 260 * speed, damping: 26 };

  return (
    <motion.div
      data-slot="swipe-stack-card"
      data-position={position}
      role={isTop ? "group" : undefined}
      aria-label={isTop ? label : undefined}
      aria-hidden={isTop ? undefined : true}
      initial={false}
      animate={{
        x: pose.x,
        y: pose.y,
        rotate: pose.rotate,
        scale: pose.scale,
        opacity: hidden ? 0 : 1,
      }}
      transition={transition}
      style={{ zIndex, transformOrigin: fanOrigin ? "0% 100%" : "50% 50%" }}
      className={cn("absolute inset-0", !isTop && "pointer-events-none")}
      {...(isTop ? handlers : {})}
    >
      <motion.div
        style={isTop ? style : undefined}
        className={cn(
          "relative size-full overflow-hidden rounded-xl border bg-card shadow-lg [&_img]:size-full [&_img]:object-cover",
          isTop && "cursor-grab touch-none active:cursor-grabbing"
        )}
      >
        {children}
        <motion.div
          aria-hidden
          initial={false}
          animate={{ opacity: pose.shade }}
          transition={transition}
          className="pointer-events-none absolute inset-0 bg-background"
        />
      </motion.div>
    </motion.div>
  );
}
