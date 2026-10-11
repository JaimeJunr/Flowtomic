"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import type * as React from "react";
import { cn } from "@/lib/utils";
import type { RailPose } from "./depth-rail-carousel-utils";

export type DepthRailItem = { id: string; label: string; content: React.ReactNode };

const EASE = [0.22, 1, 0.36, 1] as const;

type CardProps = {
  item: DepthRailItem;
  index: number;
  total: number;
  offset: number;
  pose: RailPose;
  active: boolean;
  cardWidth: number;
  cardHeight: number;
  /** Em segundos; 0 troca na hora. */
  duration: number;
};

export function DepthRailCard({
  item,
  index,
  total,
  offset,
  pose,
  active,
  cardWidth,
  cardHeight,
  duration,
}: CardProps) {
  const transition = { duration, ease: EASE };
  return (
    <motion.div
      data-slot="depth-rail-carousel-card"
      data-offset={offset}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} de ${total}`}
      aria-hidden={active ? undefined : true}
      inert={!active}
      className="absolute top-1/2 left-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      style={{
        width: cardWidth,
        height: cardHeight,
        marginLeft: -cardWidth / 2,
        marginTop: -cardHeight / 2,
        zIndex: pose.zIndex,
        pointerEvents: active ? undefined : "none",
      }}
      initial={false}
      animate={{
        x: pose.x,
        z: pose.z,
        rotateY: pose.rotateY,
        opacity: pose.opacity,
        // O blur fica no próprio cartão: filter em ancestral achataria o 3D.
        filter: `blur(${pose.blur}px)`,
      }}
      transition={transition}
    >
      {item.content}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-background"
        initial={false}
        animate={{ opacity: pose.veil }}
        transition={transition}
      />
    </motion.div>
  );
}

const arrowClass =
  "absolute top-1/2 z-[200] flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

type ControlsProps = {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function DepthRailControls({ canPrev, canNext, onPrev, onNext }: ControlsProps) {
  return (
    <>
      <button
        type="button"
        data-slot="depth-rail-carousel-prev"
        aria-label="Anterior"
        disabled={!canPrev}
        onClick={onPrev}
        className={cn(arrowClass, "left-2")}
      >
        <ChevronLeft aria-hidden="true" style={{ width: 20, height: 20 }} />
      </button>
      <button
        type="button"
        data-slot="depth-rail-carousel-next"
        aria-label="Próximo"
        disabled={!canNext}
        onClick={onNext}
        className={cn(arrowClass, "right-2")}
      >
        <ChevronRight aria-hidden="true" style={{ width: 20, height: 20 }} />
      </button>
    </>
  );
}

type DotsProps = {
  items: DepthRailItem[];
  active: number;
  onSelect: (index: number) => void;
};

export function DepthRailDots({ items, active, onSelect }: DotsProps) {
  return (
    <div
      data-slot="depth-rail-carousel-dots"
      className="flex items-center justify-center gap-2 py-3"
    >
      {items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          aria-label={`Ir para ${item.label}`}
          aria-current={i === active ? "true" : undefined}
          onClick={() => onSelect(i)}
          className={cn(
            "h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            i === active ? "w-6 bg-primary" : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}
