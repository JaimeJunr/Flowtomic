"use client";

import {
  animate,
  type MotionValue,
  motionValue,
  type ValueAnimationTransition,
} from "motion/react";
import * as React from "react";

import { useFrontDrag } from "./card-cycle-drag";
import {
  bringToFront,
  identityOrder,
  type PoseOptions,
  rotateNext,
  rotatePrev,
  type SlotPose,
  slotPose,
  springForBounce,
} from "./card-cycle-utils";

export type CardMotion = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  z: MotionValue<number>;
  opacity: MotionValue<number>;
  veil: MotionValue<number>;
};

export type CardCycleMotionConfig = {
  itemCount: number;
  height: number;
  pose: PoseOptions;
  hoverSpread: number;
  bounce: number;
  parallax: number;
  interval: number;
  autoplay: boolean;
  pauseOnHover: boolean;
  draggable: boolean;
  reduce: boolean;
  onChange?: (frontIndex: number) => void;
  onCardClick?: (index: number) => void;
};

const FALL_TWEEN = { duration: 0.35, ease: "easeIn" } as const;
const FALL_FACTOR = 1.2;
// Rede de segurança: uma animação interrompida por outra pode nunca resolver.
const SETTLE_LIMIT_MS = 1500;
const PARALLAX_DEGREES = 10;
const TILT_SPRING = { type: "spring", stiffness: 120, damping: 20 } as const;

type Transition = ValueAnimationTransition<number>;
function createCardMotion(pose: SlotPose): CardMotion {
  return {
    x: motionValue(pose.x),
    y: motionValue(pose.y),
    z: motionValue(pose.z),
    opacity: motionValue(pose.opacity),
    veil: motionValue(pose.veil),
  };
}

function isHoverPointer(event: { pointerType?: string }) {
  return event.pointerType === "mouse" || event.pointerType === "pen";
}

function useBrowserPause() {
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    const sync = () => setHidden(document.visibilityState === "hidden");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return hidden;
}

export function useCardCycle(config: CardCycleMotionConfig) {
  const { itemCount } = config;
  const cfg = React.useRef(config);
  cfg.current = config;

  const [order, setOrder] = React.useState(() => identityOrder(itemCount));
  const orderRef = React.useRef(order);
  const busy = React.useRef(false);
  const alive = React.useRef(true);
  const suppressClick = React.useRef(false);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const hidden = useBrowserPause();

  // Um conjunto de MotionValues por item; recriado só se a quantidade de itens mudar.
  const motions = React.useMemo(
    () =>
      Array.from({ length: itemCount }, (_, index) =>
        createCardMotion(slotPose(index, cfg.current.pose, 0))
      ),
    [itemCount]
  );
  const rotX = React.useMemo(() => motionValue(0), []);
  const rotY = React.useMemo(() => motionValue(0), []);

  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const play = React.useCallback((mv: MotionValue<number>, target: number, spring?: Transition) => {
    if (cfg.current.reduce) {
      mv.stop();
      mv.set(target);
      return Promise.resolve();
    }
    const transition = spring ?? springForBounce(cfg.current.bounce);
    return Promise.resolve(animate(mv, target, transition)).then(() => undefined);
  }, []);

  const settle = React.useCallback(
    (jobs: Promise<void>[]) =>
      Promise.race([
        Promise.all(jobs).then(() => undefined),
        new Promise<void>((resolve) => setTimeout(resolve, SETTLE_LIMIT_MS)),
      ]),
    []
  );

  const applyPoses = React.useCallback(
    (target: number[], spread: number) => {
      const jobs: Promise<void>[] = [];
      target.forEach((itemIndex, slot) => {
        const pose = slotPose(slot, cfg.current.pose, spread);
        const m = motions[itemIndex];
        if (!m) return;
        jobs.push(play(m.x, pose.x), play(m.y, pose.y), play(m.z, pose.z));
        jobs.push(play(m.opacity, pose.opacity), play(m.veil, pose.veil));
      });
      return settle(jobs);
    },
    [motions, play, settle]
  );

  const commit = React.useCallback((target: number[]) => {
    orderRef.current = target;
    setOrder(target);
    cfg.current.onChange?.(target[0]);
  }, []);

  const place = React.useCallback(
    (itemIndex: number, slot: number, offsetY: number) => {
      const m = motions[itemIndex];
      const pose = slotPose(slot, cfg.current.pose, 0);
      m.x.set(pose.x);
      m.y.set(pose.y + offsetY);
      m.z.set(pose.z);
      m.veil.set(pose.veil);
      m.opacity.set(0);
    },
    [motions]
  );

  const run = React.useCallback(
    async (target: number[], direction: "forward" | "backward") => {
      if (busy.current) return;
      busy.current = true;
      try {
        const current = orderRef.current;
        const fall = cfg.current.height * FALL_FACTOR;
        if (direction === "forward") {
          // Fase 1: quem estava na frente cai e some.
          const leaving = current.slice(0, current.indexOf(target[0]));
          const falling = leaving.flatMap((i) => [
            play(motions[i].y, motions[i].y.get() + fall, FALL_TWEEN),
            play(motions[i].opacity, 0, FALL_TWEEN),
          ]);
          // Sem movimento não há fase 1: a troca precisa ser síncrona.
          if (!cfg.current.reduce) await settle(falling);
          if (!alive.current) return;
          commit(target);
          // Fase 2: reaparece no fundo enquanto os demais avançam.
          for (const i of leaving) place(i, target.indexOf(i), 0);
        } else {
          place(target[0], 0, fall);
          commit(target);
        }
        await applyPoses(target, 0);
      } finally {
        busy.current = false;
      }
    },
    [motions, play, settle, commit, place, applyPoses]
  );

  const next = React.useCallback(() => void run(rotateNext(orderRef.current), "forward"), [run]);
  const prev = React.useCallback(() => void run(rotatePrev(orderRef.current), "backward"), [run]);

  const selectCard = React.useCallback(
    (itemIndex: number) => {
      if (suppressClick.current) return;
      if (orderRef.current[0] !== itemIndex) {
        void run(bringToFront(orderRef.current, itemIndex), "forward");
      }
      cfg.current.onCardClick?.(itemIndex);
    },
    [run]
  );

  const spread = hovered ? config.hoverSpread : 0;
  const { frontDrag, dragging } = useFrontDrag({
    motions,
    orderRef,
    busy,
    suppressClick,
    draggable: config.draggable,
    next,
    settleBack: () => void applyPoses(orderRef.current, spread),
  });

  const paused = (config.pauseOnHover && hovered) || focused || hidden || dragging;
  const running = config.autoplay && !config.reduce;
  // biome-ignore lint/correctness/useExhaustiveDependencies: `order` reinicia a contagem após cada troca.
  React.useEffect(() => {
    if (!running || paused) return;
    const id = setTimeout(next, config.interval);
    return () => clearTimeout(id);
  }, [running, paused, config.interval, next, order]);

  const { stepX, stepY, depth, skew, visibleCards, dim } = config.pose;
  // biome-ignore lint/correctness/useExhaustiveDependencies: as props de pose entram para reabrir a pilha.
  React.useEffect(() => {
    if (busy.current) return;
    void applyPoses(orderRef.current, spread);
  }, [spread, stepX, stepY, depth, skew, visibleCards, dim, applyPoses]);

  const tilt = (nx: number, ny: number) => {
    const max = cfg.current.parallax * PARALLAX_DEGREES;
    void play(rotY, nx * max, TILT_SPRING);
    void play(rotX, -ny * max, TILT_SPRING);
  };

  const rootHandlers = {
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      if (isHoverPointer(event)) setHovered(true);
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      if (!isHoverPointer(event) || cfg.current.reduce || cfg.current.parallax === 0) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      tilt(
        clamp(((event.clientX - rect.left) / rect.width) * 2 - 1),
        clamp(((event.clientY - rect.top) / rect.height) * 2 - 1)
      );
    },
    onPointerLeave: () => {
      setHovered(false);
      tilt(0, 0);
    },
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowRight") next();
      else if (event.key === "ArrowLeft") prev();
    },
  };

  return {
    order,
    motions,
    rotX,
    rotY,
    next,
    prev,
    selectCard,
    rootHandlers,
    frontDrag,
    dragging,
    autoplayRunning: running,
  };
}
