"use client";

import { motion } from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  assertBounciness,
  assertItemCount,
  entrySpring,
  focusPose,
  restPose,
  stackOrder,
} from "./fan-cards-utils";

export type FanCardItem = {
  id: string;
  label: string;
  image?: string;
  content?: React.ReactNode;
};

export type FanCardsProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  items: FanCardItem[];
  cardSize?: number;
  spread?: number;
  rotation?: number;
  arc?: number;
  pushDistance?: number;
  hoverScale?: number;
  bounciness?: number;
  delay?: number;
  stagger?: number;
  interactive?: boolean;
  onSelect?: (index: number) => void;
};

const MOVE_SPRING = { type: "spring", stiffness: 300, damping: 24 } as const;
const INSTANT = { duration: 0 } as const;

type CardProps = {
  item: FanCardItem;
  index: number;
  count: number;
  hovered: number | null;
  settings: Required<
    Pick<
      FanCardsProps,
      "cardSize" | "spread" | "rotation" | "arc" | "pushDistance" | "hoverScale" | "bounciness"
    >
  > & { delay: number; stagger: number };
  reduced: boolean;
  interactive: boolean;
  onSelect?: (index: number) => void;
  setHovered: (index: number | null) => void;
};

function CardBody({ item, onSelect, index }: Pick<CardProps, "item" | "onSelect" | "index">) {
  const body = item.image ? (
    <img src={item.image} alt={item.label} className="size-full object-cover" draggable={false} />
  ) : (
    item.content
  );
  const frame = "block size-full overflow-hidden rounded-3xl border-4 border-card bg-card";
  if (!onSelect) return <div className={frame}>{body}</div>;
  return (
    <button
      type="button"
      aria-label={item.label}
      className={cn(
        frame,
        "cursor-pointer p-0 text-left focus-visible:outline-2 focus-visible:outline-ring"
      )}
      onClick={() => onSelect(index)}
    >
      {body}
    </button>
  );
}

function Card(props: CardProps) {
  const { item, index, count, hovered, settings, reduced, interactive, onSelect, setHovered } =
    props;
  const rest = restPose(index, count, settings);
  const pose = focusPose(index, hovered, rest, settings.pushDistance);
  const focused = hovered === index;
  const mouseLike = (e: React.PointerEvent) => e.pointerType === "mouse" || e.pointerType === "pen";

  return (
    <motion.div
      role="listitem"
      data-slot="fan-cards-card"
      data-index={index}
      data-focused={focused}
      className={cn("absolute top-5 select-none rounded-3xl", focused ? "shadow-xl" : "shadow-lg")}
      style={{
        width: settings.cardSize,
        height: settings.cardSize,
        left: "50%",
        marginLeft: -settings.cardSize / 2,
        zIndex: stackOrder(index, count, hovered),
      }}
      initial={false}
      animate={{ ...pose, scale: focused ? settings.hoverScale : 1 }}
      transition={reduced ? INSTANT : MOVE_SPRING}
      onPointerEnter={(e) => interactive && mouseLike(e) && setHovered(index)}
      onPointerLeave={(e) => interactive && mouseLike(e) && setHovered(null)}
      onFocus={() => interactive && onSelect && setHovered(index)}
      onBlur={() => interactive && onSelect && setHovered(null)}
    >
      <motion.div
        className="size-full"
        initial={reduced ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={
          reduced
            ? INSTANT
            : {
                ...entrySpring(settings.bounciness),
                delay: settings.delay + index * settings.stagger,
              }
        }
      >
        <CardBody item={item} onSelect={onSelect} index={index} />
      </motion.div>
    </motion.div>
  );
}

function FanCards({
  items,
  cardSize = 200,
  spread = 85,
  rotation = 10,
  arc = 0,
  pushDistance = 160,
  hoverScale = 1.06,
  bounciness = 0.6,
  delay = 0.5,
  stagger = 0.06,
  interactive = true,
  onSelect,
  className,
  style,
  ref,
  ...props
}: FanCardsProps) {
  assertItemCount(items.length);
  assertBounciness(bounciness);
  const reduced = useShouldReduceMotion();
  const [hovered, setHovered] = React.useState<number | null>(null);
  const settings = {
    cardSize,
    spread,
    rotation,
    arc,
    pushDistance,
    hoverScale,
    bounciness,
    delay,
    stagger,
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: div posicionável; os filhos são motion.div absolutos
    <div
      ref={ref}
      role="list"
      data-slot="fan-cards"
      className={cn("relative w-full", className)}
      style={{ height: cardSize + Math.abs(arc) + 40, ...style }}
      {...props}
    >
      {items.map((item, index) => (
        <Card
          key={item.id}
          item={item}
          index={index}
          count={items.length}
          hovered={hovered}
          settings={settings}
          reduced={reduced}
          interactive={interactive}
          onSelect={onSelect}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
FanCards.displayName = "FanCards";

export { FanCards };
