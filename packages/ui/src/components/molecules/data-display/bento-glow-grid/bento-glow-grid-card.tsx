"use client";

import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { BentoParticles, BentoRipple, type RippleSpec } from "./bento-glow-grid-effects";
import {
  bentoSpan,
  MAX_PULL_PX,
  MAX_TILT_DEG,
  rippleDiameter,
  tiltFor,
} from "./bento-glow-grid-utils";

export type BentoGlowItem = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  content?: React.ReactNode;
};

const MASK_LAYER = "linear-gradient(currentColor, currentColor)";
// Recorta a camada só no anel de 1px: miolo (content-box) subtraído do todo.
const RING_MASK = {
  maskImage: `${MASK_LAYER}, ${MASK_LAYER}`,
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
  WebkitMaskImage: `${MASK_LAYER}, ${MASK_LAYER}`,
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
} as const;

const SPRING = { type: "spring", stiffness: 220, damping: 22 } as const;

export type BentoGlowGridCardProps = {
  item: BentoGlowItem;
  index: number;
  tilt: boolean;
  magnetism: boolean;
  particles: boolean;
  particleCount: number;
  ripple: boolean;
  borderGlow: boolean;
  borderRadius: number;
  reduced: boolean;
};

function useCardMotion(tilt: boolean, magnetism: boolean) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const follow = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const { px, py } = tiltFor(
      event.clientX - rect.left,
      event.clientY - rect.top,
      rect.width,
      rect.height
    );
    if (tilt) {
      animate(rotateY, px * MAX_TILT_DEG, SPRING);
      animate(rotateX, -py * MAX_TILT_DEG, SPRING);
    }
    if (magnetism) {
      animate(x, px * MAX_PULL_PX, SPRING);
      animate(y, py * MAX_PULL_PX, SPRING);
    }
  };
  const rest = () => {
    for (const value of [rotateX, rotateY, x, y]) animate(value, 0, SPRING);
  };
  return { style: { rotateX, rotateY, x, y }, follow, rest };
}

export function BentoGlowGridCard(props: BentoGlowGridCardProps) {
  const { item, index, tilt, magnetism, particles, particleCount, ripple, borderGlow } = props;
  const { reduced, borderRadius } = props;
  const canTilt = tilt && !reduced;
  const canPull = magnetism && !reduced;
  const motionState = useCardMotion(canTilt, canPull);
  const [hovered, setHovered] = React.useState(false);
  const [ripples, setRipples] = React.useState<RippleSpec[]>([]);
  const nextId = React.useRef(0);

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!ripple || reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = rippleDiameter(rect.width, rect.height, x, y);
    setRipples((list) => [...list, { id: nextId.current++, x, y, size }]);
  };
  const dropRipple = React.useCallback(
    (id: number) => setRipples((list) => list.filter((r) => r.id !== id)),
    []
  );

  const showParticles = hovered && particles && !reduced && particleCount > 0;

  return (
    <motion.div
      role="listitem"
      data-slot="bento-glow-grid-card"
      className={cn(
        "relative min-h-48 overflow-hidden rounded-2xl border border-border bg-card p-5",
        "flex flex-col justify-between gap-6 text-card-foreground",
        bentoSpan(index)
      )}
      style={{ ...motionState.style, transformPerspective: 800 }}
      onPointerEnter={() => setHovered(true)}
      onPointerMove={canTilt || canPull ? motionState.follow : undefined}
      onPointerLeave={() => {
        setHovered(false);
        motionState.rest();
      }}
      onClick={onClick}
    >
      {item.eyebrow ? (
        <span className="text-xs font-medium text-muted-foreground">{item.eyebrow}</span>
      ) : null}
      {item.content}
      <div className="space-y-1">
        <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
        {item.description ? (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        ) : null}
      </div>
      {borderGlow ? (
        <span
          aria-hidden="true"
          data-slot="bento-glow-grid-border"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            padding: "1px",
            background: `radial-gradient(circle ${borderRadius}px at var(--mx, 50%) var(--my, 50%), var(--primary), transparent 60%)`,
            opacity: "var(--glow, 0)",
            ...RING_MASK,
          }}
        />
      ) : null}
      <AnimatePresence>
        {showParticles ? <BentoParticles count={particleCount} seed={index + 1} /> : null}
      </AnimatePresence>
      {ripples.map((r) => (
        <BentoRipple key={r.id} ripple={r} onDone={dropRipple} />
      ))}
    </motion.div>
  );
}
