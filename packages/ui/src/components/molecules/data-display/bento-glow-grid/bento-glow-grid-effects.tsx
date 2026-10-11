"use client";

import { motion } from "motion/react";
import * as React from "react";

import { particleSeeds } from "./bento-glow-grid-utils";

const LOOP_FLOAT_PX = 10;

export function BentoParticles({ count, seed }: { count: number; seed: number }) {
  const seeds = React.useMemo(() => particleSeeds(count, seed), [count, seed]);
  return (
    <>
      {seeds.map((p, i) => (
        <motion.span
          // biome-ignore lint/suspicious/noArrayIndexKey: sementes são posicionais e estáveis
          key={i}
          aria-hidden="true"
          data-slot="bento-glow-grid-particle"
          className="pointer-events-none absolute size-1 rounded-full bg-primary"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          initial={{ opacity: 0 }}
          animate={{ y: [0, -LOOP_FLOAT_PX, LOOP_FLOAT_PX, 0], opacity: [0.3, 1, 0.3] }}
          exit={{ opacity: 0 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

export type RippleSpec = { id: number; x: number; y: number; size: number };

export function BentoRipple({
  ripple,
  onDone,
}: {
  ripple: RippleSpec;
  onDone: (id: number) => void;
}) {
  return (
    <motion.span
      aria-hidden="true"
      data-slot="bento-glow-grid-ripple"
      className="pointer-events-none absolute rounded-full border border-primary"
      style={{
        left: ripple.x - ripple.size / 2,
        top: ripple.y - ripple.size / 2,
        width: ripple.size,
        height: ripple.size,
      }}
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      onAnimationComplete={() => onDone(ripple.id)}
    />
  );
}
