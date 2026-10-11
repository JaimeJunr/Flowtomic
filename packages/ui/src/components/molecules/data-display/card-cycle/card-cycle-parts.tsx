"use client";

import { motion } from "motion/react";
import type * as React from "react";

import { cn } from "@/lib/utils";
import type { CardMotion } from "./card-cycle-motion";
import type { CardCycleItem } from "./card-cycle-utils";

type DragHandlers = {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
};

type CardCycleCardProps = {
  item: CardCycleItem;
  itemIndex: number;
  /** 0 é o cartão da frente. */
  slot: number;
  visible: boolean;
  motion: CardMotion;
  width: number;
  height: number;
  skew: number;
  draggable: boolean;
  dragging: boolean;
  dragHandlers: DragHandlers;
  onSelect: (itemIndex: number) => void;
};

function CardCycleCard({
  item,
  itemIndex,
  slot,
  visible,
  motion: m,
  width,
  height,
  skew,
  draggable,
  dragging,
  dragHandlers,
  onSelect,
}: CardCycleCardProps) {
  const front = slot === 0;
  const grabbable = front && draggable;
  return (
    <motion.div
      data-slot="card-cycle-card"
      data-slot-position={slot}
      // Só o cartão da frente existe para leitor de tela e teclado.
      aria-hidden={front ? undefined : true}
      inert={!front}
      onClick={() => onSelect(itemIndex)}
      {...(grabbable ? dragHandlers : {})}
      style={{
        x: m.x,
        y: m.y,
        z: m.z,
        opacity: m.opacity,
        skewY: skew,
        zIndex: 100 - slot,
        width,
        height,
        transformOrigin: "bottom left",
        touchAction: grabbable ? "none" : undefined,
      }}
      className={cn(
        "absolute bottom-0 left-0 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
        !visible && "pointer-events-none",
        !front && visible && "cursor-pointer",
        grabbable && "cursor-grab select-none",
        grabbable && dragging && "cursor-grabbing"
      )}
    >
      <CardCycleHeader icon={item.icon} title={item.title} />
      <div className="min-h-0 flex-1">{item.content}</div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-background"
        style={{ opacity: m.veil }}
      />
    </motion.div>
  );
}
CardCycleCard.displayName = "CardCycleCard";

function CardCycleHeader({ icon, title }: { icon?: React.ReactNode; title: string }) {
  return (
    <div
      data-slot="card-cycle-header"
      className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm font-medium"
    >
      {icon ? (
        <span className="flex shrink-0 text-muted-foreground [&_svg]:size-4">{icon}</span>
      ) : null}
      <span className="truncate">{title}</span>
    </div>
  );
}
CardCycleHeader.displayName = "CardCycleHeader";

export { CardCycleCard };
export type { CardCycleCardProps };
