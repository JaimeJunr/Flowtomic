"use client";

import { motion } from "motion/react";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { parallaxShift, tiltFor } from "./expand-panels-utils";

export type ExpandPanelItem = {
  id: string;
  label: string;
  content: React.ReactNode;
  href?: string;
};

export type Orientation = "horizontal" | "vertical";

const EASE = [0.22, 1, 0.36, 1] as const;

export function panelTransition(reduced: boolean) {
  return reduced ? { duration: 0 } : { duration: 0.6, ease: EASE };
}

export type PanelProps = {
  item: ExpandPanelItem;
  index: number;
  active: number;
  basis: number;
  orientation: Orientation;
  tilt: number;
  parallax: number;
  showLabels: boolean;
  grayscale: boolean;
  reduced: boolean;
  openSize: number;
  onPointerEnter: (event: React.PointerEvent) => void;
  onPointerDown: (event: React.PointerEvent) => void;
  onFocus: () => void;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

function Caption({ label, reduced }: { label: string; reduced: boolean }) {
  const transition = (delay: number) =>
    reduced ? { duration: 0 } : { duration: 0.5, ease: EASE, delay };
  return (
    <span
      data-slot="expand-panels-caption"
      className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 bg-linear-to-b from-transparent to-background p-4 pt-12 text-left"
    >
      <motion.span
        aria-hidden="true"
        className="block h-0.5 bg-primary"
        initial={reduced ? false : { width: 0 }}
        animate={{ width: 32 }}
        transition={transition(0)}
      />
      <motion.span
        className="block font-display text-base font-semibold text-foreground"
        initial={reduced ? false : { y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={transition(0.06)}
      >
        {label}
      </motion.span>
    </span>
  );
}

const MotionButton = motion.create("button");
const MotionAnchor = motion.create("a");

export function Panel(props: PanelProps) {
  const { item, index, active, basis, orientation, tilt, parallax, reduced, openSize } = props;
  const isActive = index === active;
  const vertical = orientation === "vertical";
  const angle = reduced ? 0 : tiltFor(index, active, tilt) * (vertical ? -1 : 1);
  const shift = reduced ? 0 : parallaxShift(index, active, parallax);
  const transition = panelTransition(reduced);
  const state = {
    flexGrow: basis,
    [vertical ? "rotateX" : "rotateY"]: angle,
  };
  const Tag = item.href ? MotionAnchor : MotionButton;
  const tagProps = item.href ? { href: item.href } : { type: "button" as const };

  return (
    <Tag
      {...tagProps}
      data-slot="expand-panels-item"
      data-active={isActive}
      aria-label={item.label}
      aria-expanded={isActive}
      initial={false}
      animate={state}
      transition={transition}
      style={{ flexBasis: 0, flexShrink: 1 }}
      className={cn(
        "relative block min-h-0 min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-border bg-card text-left outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
      onPointerEnter={props.onPointerEnter}
      onPointerDown={props.onPointerDown}
      onFocus={props.onFocus}
      onClick={props.onClick}
      onKeyDown={props.onKeyDown}
    >
      <motion.span
        className={cn(
          "absolute block transition-[filter] duration-500",
          vertical ? "inset-x-0 top-1/2 -translate-y-1/2" : "inset-y-0 left-1/2 -translate-x-1/2",
          props.grayscale && !isActive && "grayscale"
        )}
        style={
          vertical
            ? { height: openSize || "100%", width: "100%" }
            : { width: openSize || "100%", height: "100%" }
        }
        data-slot="expand-panels-content"
        initial={false}
        animate={
          vertical
            ? { y: shift, opacity: isActive ? 1 : 0.15 }
            : { x: shift, opacity: isActive ? 1 : 0.15 }
        }
        transition={transition}
      >
        {item.content}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-background"
        initial={false}
        animate={{ opacity: isActive ? 0 : 0.45 }}
        transition={transition}
      />
      <motion.span
        aria-hidden="true"
        data-slot="expand-panels-label"
        data-state={isActive ? "hidden" : "visible"}
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 p-4 text-sm font-medium text-foreground",
          !vertical && "[writing-mode:vertical-rl] rotate-180"
        )}
        initial={false}
        animate={{ opacity: isActive ? 0 : 1 }}
        transition={transition}
      >
        {item.label}
      </motion.span>
      {isActive && props.showLabels ? <Caption label={item.label} reduced={reduced} /> : null}
    </Tag>
  );
}
