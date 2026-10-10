"use client";

import { type MotionValue, motion, useTransform } from "motion/react";
import type * as React from "react";

import { cardTransform, depthShade, stepAngle } from "./ring-carousel-utils";

export type RingCarouselItem = { id: string; content: React.ReactNode; label: string };

type RingCardProps = {
  item: RingCarouselItem;
  index: number;
  count: number;
  radius: number;
  rotation: MotionValue<number>;
  layout: "cylinder" | "orbit";
  width: number;
  height: number;
  depthFade: number;
  isFront: boolean;
  facesViewer: boolean;
  onSelect: (index: number) => void;
};

export function RingCard({
  item,
  index,
  count,
  radius,
  rotation,
  layout,
  width,
  height,
  depthFade,
  isFront,
  facesViewer,
  onSelect,
}: RingCardProps) {
  const shade = useTransform(rotation, (value) => depthShade(value, index, count, depthFade));
  // No orbit o cartão desfaz a rotação do anel para ficar sempre de frente.
  const counterRotation = useTransform(rotation, (value) => -index * stepAngle(count) - value);
  const orbit = layout === "orbit";

  return (
    // biome-ignore lint/a11y/useSemanticElements: slide de carrossel exige role=group com aria-roledescription.
    <div
      data-slot="ring-carousel-card"
      data-front={isFront ? "true" : "false"}
      role="group"
      aria-roledescription="slide"
      aria-label={item.label}
      aria-hidden={facesViewer ? undefined : true}
      inert={!facesViewer}
      onClick={() => onSelect(index)}
      className="absolute top-1/2 left-1/2"
      style={{
        width,
        height,
        transform: cardTransform(index, count, radius),
        transformStyle: "preserve-3d",
        backfaceVisibility: orbit ? undefined : "hidden",
      }}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-lg border bg-card shadow-md"
        style={orbit ? { rotateY: counterRotation } : undefined}
      >
        {item.content}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-background"
          style={{ opacity: shade }}
        />
      </motion.div>
    </div>
  );
}
