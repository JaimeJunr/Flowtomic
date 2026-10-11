"use client";

import * as React from "react";

import type { CardMotion } from "./card-cycle-motion";
import { shouldThrow } from "./card-cycle-utils";

const CLICK_SLOP = 4;

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
  samples: { x: number; y: number; t: number }[];
};

function dragSpeed(samples: DragState["samples"]) {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (!first || !last || last.t <= first.t) return 0;
  return (Math.hypot(last.x - first.x, last.y - first.y) / (last.t - first.t)) * 1000;
}

type FrontDragParams = {
  motions: CardMotion[];
  orderRef: React.RefObject<number[]>;
  busy: React.RefObject<boolean>;
  suppressClick: React.RefObject<boolean>;
  draggable: boolean;
  next: () => void;
  /** Devolve o cartão à pose do degrau quando o arremesso não passa do limite. */
  settleBack: () => void;
};

/** Arrasto do cartão da frente: segue o ponteiro e arremessa ao fundo se passar do limite. */
export function useFrontDrag({
  motions,
  orderRef,
  busy,
  suppressClick,
  draggable,
  next,
  settleBack,
}: FrontDragParams) {
  const drag = React.useRef<DragState | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const frontDrag = {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      const m = motions[orderRef.current[0]];
      if (!draggable || busy.current || event.button > 0) return;
      m.x.stop();
      m.y.stop();
      drag.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: m.x.get(),
        originY: m.y.get(),
        moved: false,
        samples: [{ x: event.clientX, y: event.clientY, t: event.timeStamp }],
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setDragging(true);
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      const state = drag.current;
      if (!state || state.pointerId !== event.pointerId) return;
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      if (Math.hypot(dx, dy) > CLICK_SLOP) state.moved = true;
      const m = motions[orderRef.current[0]];
      m.x.set(state.originX + dx);
      m.y.set(state.originY + dy);
      state.samples = [
        ...state.samples.filter((s) => event.timeStamp - s.t < 100),
        { x: event.clientX, y: event.clientY, t: event.timeStamp },
      ];
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
      const state = drag.current;
      if (!state || state.pointerId !== event.pointerId) return;
      drag.current = null;
      setDragging(false);
      if (!state.moved) return;
      // O clique do mesmo gesto chega logo depois do pointerup; descarta só ele.
      suppressClick.current = true;
      setTimeout(() => {
        suppressClick.current = false;
      }, 0);
      const distance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY);
      if (shouldThrow(distance, dragSpeed(state.samples))) next();
      else settleBack();
    },
  };

  return { frontDrag, dragging };
}
