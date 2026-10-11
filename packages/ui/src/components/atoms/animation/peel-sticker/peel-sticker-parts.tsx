"use client";

import { type MotionValue, motion, useTransform } from "motion/react";
import type * as React from "react";

import { foldShadowOpacity, peelGeometry } from "./peel-sticker-utils";

const FOLD_SHADOW_HEIGHT = 28;

type LayersProps = {
  fraction: MotionValue<number>;
  width: number;
  extent: number;
  direction: number;
  shadowIntensity: number;
  children: React.ReactNode;
};

/**
 * Todas as camadas vivem num quadro girado por `direction`: assim a dobra é sempre
 * "de baixo para cima" no quadro e o ângulo escolhido só gira o conjunto. O conteúdo
 * gira o contrário para ficar reto.
 */
export function PeelLayers({
  fraction,
  width,
  extent,
  direction,
  shadowIntensity,
  children,
}: LayersProps) {
  const frameWidth = Math.ceil(width * Math.SQRT2);
  const inset = (frameWidth - width) / 2;
  const clipPath = useTransform(
    fraction,
    (f) => `inset(0 0 ${peelGeometry(extent, f).clipBottomPct}% 0)`
  );
  const backTop = useTransform(fraction, (f) => {
    const { flapHeight, foldY } = peelGeometry(extent, f);
    return foldY - flapHeight;
  });
  const backHeight = useTransform(fraction, (f) => peelGeometry(extent, f).flapHeight);
  const shadowTop = useTransform(
    fraction,
    (f) => peelGeometry(extent, f).foldY - FOLD_SHADOW_HEIGHT
  );
  const shadowOpacity = useTransform(fraction, (f) => foldShadowOpacity(shadowIntensity, f));
  const counter = { left: inset, top: (extent - width) / 2, width, height: width };

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: (width - frameWidth) / 2,
        top: (width - extent) / 2,
        width: frameWidth,
        height: extent,
        transform: `rotate(${direction}deg)`,
      }}
    >
      <motion.div className="absolute inset-0" style={{ clipPath }}>
        <div
          data-slot="peel-sticker-face"
          className="absolute rounded-2xl bg-background p-2"
          style={{ ...counter, transform: `rotate(${-direction}deg)` }}
        >
          <div className="flex size-full items-center justify-center overflow-hidden rounded-xl">
            {children}
          </div>
        </div>
      </motion.div>
      <motion.div
        aria-hidden="true"
        data-slot="peel-sticker-back"
        className="absolute inset-x-0 overflow-hidden"
        style={{ top: backTop, height: backHeight }}
      >
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: extent, transform: "scaleY(-1)" }}
        >
          <div
            className="absolute rounded-2xl bg-muted"
            style={{ ...counter, transform: `rotate(${-direction}deg)` }}
          />
        </div>
      </motion.div>
      <motion.div
        aria-hidden="true"
        data-slot="peel-sticker-shadow"
        className="absolute"
        style={{
          left: inset,
          width,
          height: FOLD_SHADOW_HEIGHT,
          top: shadowTop,
          opacity: shadowOpacity,
          backgroundImage:
            "linear-gradient(to bottom, transparent, color-mix(in oklch, var(--foreground) 35%, transparent))",
        }}
      />
    </div>
  );
}
