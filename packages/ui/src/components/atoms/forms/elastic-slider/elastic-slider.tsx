"use client";

import { Minus, Plus } from "lucide-react";
import { animate, type MotionValue, motion, useMotionValue, useTransform } from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  assertRange,
  decay,
  MAX_OVERFLOW,
  nextValueFromKey,
  overflowFromPointer,
  percentOf,
  valueFromPointer,
} from "./elastic-slider-utils";

export type ElasticSliderProps = Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue" | "children"
> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  /** 0 = contínuo. */
  step?: number;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  /** Formata o número exibido. */
  formatValue?: (value: number) => string;
  "aria-label": string;
};

const SPRING_BACK = { type: "spring", bounce: 0.5 } as const;

function useOverflowStyles(overflow: MotionValue<number>, hover: MotionValue<number>) {
  const width = useMotionValue(1);
  const scaleX = useTransform([overflow, width], ([o, w]: number[]) => 1 + Math.abs(o) / w);
  const scaleY = useTransform([overflow, hover], ([o, h]: number[]) => {
    return h * (1 - 0.2 * Math.min(1, Math.abs(o) / MAX_OVERFLOW));
  });
  // A trilha ancora na ponta oposta ao puxão.
  const originX = useTransform(overflow, (o) => (o > 0 ? 0 : 1));
  const startPull = useTransform(overflow, (o) => Math.min(0, o));
  const endPull = useTransform(overflow, (o) => Math.max(0, o));
  const startScale = useTransform(startPull, (o) => 1 + (0.4 * Math.abs(o)) / MAX_OVERFLOW);
  const endScale = useTransform(endPull, (o) => 1 + (0.4 * Math.abs(o)) / MAX_OVERFLOW);
  return { width, scaleX, scaleY, originX, startPull, endPull, startScale, endScale };
}

function ElasticSlider({
  value: valueProp,
  defaultValue = 50,
  onValueChange,
  min = 0,
  max = 100,
  step = 0,
  startIcon,
  endIcon,
  formatValue = (v: number) => String(Math.round(v)),
  className,
  ref,
  ...props
}: ElasticSliderProps) {
  assertRange(min, max);
  const reduce = useShouldReduceMotion();
  const [inner, setInner] = React.useState(defaultValue);
  const [dragging, setDragging] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const value = valueProp ?? inner;
  const overflow = useMotionValue(0);
  const hover = useMotionValue(1);
  const fx = useOverflowStyles(overflow, hover);

  const commit = (next: number) => {
    if (next === value) return;
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };

  const pointToValue = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    commit(valueFromPointer(e.clientX, rect, min, max, step));
    if (reduce) return;
    fx.width.set(rect.width || 1);
    overflow.set(decay(overflowFromPointer(e.clientX, rect)));
  };

  const release = () => {
    setDragging(false);
    if (!reduce) animate(overflow, 0, SPRING_BACK);
  };

  const setHover = (on: boolean) => {
    setHovered(on);
    if (reduce) hover.set(1);
    else animate(hover, on ? 2 : 1, { type: "spring", stiffness: 400, damping: 30 });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    pointToValue(e);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const next = nextValueFromKey(e.key, value, min, max, step);
    if (next === null) return;
    e.preventDefault();
    commit(next);
  };

  const isMouse = (e: React.PointerEvent) => e.pointerType === "mouse" || e.pointerType === "pen";
  const iconTone = hovered ? "text-foreground" : "text-muted-foreground";
  const trackStyle = reduce
    ? undefined
    : { scaleX: fx.scaleX, scaleY: fx.scaleY, originX: fx.originX };

  return (
    <div
      ref={ref}
      data-slot="elastic-slider"
      data-dragging={dragging}
      className={cn("flex w-64 flex-col items-center gap-3 select-none touch-none", className)}
      {...props}
    >
      <div className="flex w-full items-center gap-3">
        <motion.span
          data-slot="elastic-slider-start"
          aria-hidden="true"
          className={cn("flex shrink-0 transition-colors", iconTone)}
          style={reduce ? undefined : { scale: fx.startScale, x: fx.startPull }}
        >
          {startIcon ?? <Minus className="size-4" />}
        </motion.span>
        <motion.div
          data-slot="elastic-slider-track"
          role="slider"
          tabIndex={0}
          aria-label={props["aria-label"]}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={formatValue(value)}
          className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={trackStyle}
          onPointerDown={onPointerDown}
          onPointerMove={(e) => dragging && pointToValue(e)}
          onPointerUp={release}
          onPointerCancel={release}
          onPointerEnter={(e) => isMouse(e) && setHover(true)}
          onPointerLeave={(e) => isMouse(e) && setHover(false)}
          onKeyDown={onKeyDown}
        >
          <div
            data-slot="elastic-slider-range"
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: `${percentOf(value, min, max)}%` }}
          />
        </motion.div>
        <motion.span
          data-slot="elastic-slider-end"
          aria-hidden="true"
          className={cn("flex shrink-0 transition-colors", iconTone)}
          style={reduce ? undefined : { scale: fx.endScale, x: fx.endPull }}
        >
          {endIcon ?? <Plus className="size-4" />}
        </motion.span>
      </div>
      <span
        data-slot="elastic-slider-value"
        className="font-mono text-sm text-muted-foreground tabular-nums"
      >
        {formatValue(value)}
      </span>
    </div>
  );
}
ElasticSlider.displayName = "ElasticSlider";

export { ElasticSlider };
