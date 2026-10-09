/**
 * LiftRating Component - Flowtomic UI
 *
 * Nota de 1 a N: ao passar o ponteiro, as estrelas até a do ponteiro acendem
 * e sobem, e um balão com o rótulo acompanha. Clicar confirma com um "pop".
 * Baseado em Radix RadioGroup e motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/lift-rating.md
 */

"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Heart, Star, Zap } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { litCount, nextRating, tipOffset } from "./lift-rating-utils";

type LiftRatingShape = "star" | "heart" | "bolt";
type LiftRatingSize = "sm" | "default" | "lg";

export type LiftRatingProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Chamado a cada estrela cruzada na pré-visualização; null quando limpa. */
  onPreview?: (value: number | null) => void;
  count?: number;
  shape?: LiftRatingShape;
  /** Substitui o shape. */
  icon?: React.ReactNode;
  /** Um rótulo por estrela, mostrado no balão. */
  labels?: string[];
  size?: LiftRatingSize;
  /** px que as estrelas pré-visualizadas sobem. 0 = só cor. */
  lift?: number;
  magnify?: number;
  riseMs?: number;
  popScale?: number;
  showTip?: boolean;
  allowClear?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
};

const SHAPES = { star: Star, heart: Heart, bolt: Zap } as const;
const ICON_PX: Record<LiftRatingSize, number> = { sm: 16, default: 24, lg: 32 };
const GAP_PX = 4;
const WAVE_DELAY_S = 0.025;

type StarVisualProps = {
  lit: boolean;
  icon: React.ReactNode;
  shape: LiftRatingShape;
  px: number;
};

function StarGlyph({ lit, icon, shape, px }: StarVisualProps) {
  const cls = cn("transition-colors", lit ? "fill-current text-primary" : "text-muted-foreground");
  if (icon) return <span className={cls}>{icon}</span>;
  const Shape = SHAPES[shape];
  return <Shape className={cls} width={px} height={px} aria-hidden="true" />;
}

function LiftRating({
  ref,
  className,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  onPreview,
  count = 5,
  shape = "star",
  icon,
  labels = [],
  size = "default",
  lift = 6,
  magnify = 1.15,
  riseMs = 320,
  popScale = 1.3,
  showTip = true,
  allowClear = true,
  readOnly = false,
  disabled = false,
  "aria-label": ariaLabel = "Avaliação",
  onPointerLeave,
  onKeyDown,
  ...props
}: LiftRatingProps) {
  const reduced = useShouldReduceMotion();
  const [inner, setInner] = React.useState(defaultValue);
  const [preview, setPreview] = React.useState<number | null>(null);
  const [popped, setPopped] = React.useState<number | null>(null);
  const value = valueProp ?? inner;
  const px = ICON_PX[size];
  const indices = Array.from({ length: count }, (_, i) => i + 1);
  const interactive = !readOnly && !disabled;
  const lit = litCount(value, interactive ? preview : null);

  const commit = (next: number) => {
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };
  const showPreview = (index: number | null) => {
    if (!interactive || index === preview) return;
    setPreview(index);
    onPreview?.(index);
  };
  const choose = (index: number) => {
    commit(nextRating(value, index, allowClear));
    setPopped(index);
  };
  const nameOf = (index: number) =>
    labels[index - 1] ?? `${index} ${index === 1 ? "estrela" : "estrelas"}`;
  const lifted = (index: number) => interactive && preview !== null && index <= preview;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (allowClear && interactive && (event.key === "Backspace" || event.key === "Delete")) {
      event.preventDefault();
      commit(0);
    }
  };
  const handleLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    showPreview(null);
  };

  const rootClass = cn("relative inline-flex items-center", disabled && "opacity-50", className);
  const rootProps = {
    "data-slot": "lift-rating",
    "data-value": value,
    style: { gap: GAP_PX },
    ...props,
  };

  const renderGlyph = (index: number) => (
    <motion.span
      className="inline-flex"
      initial={false}
      animate={{
        y: reduced || !lifted(index) ? 0 : -lift,
        scale: reduced
          ? 1
          : popped === index && popScale !== 1
            ? [1, popScale, 1]
            : preview === index
              ? magnify
              : 1,
      }}
      transition={{
        duration: riseMs / 1000,
        delay: reduced ? 0 : Math.max(0, index - 1) * WAVE_DELAY_S,
        ease: "easeOut",
      }}
      onAnimationComplete={() => setPopped((p) => (p === index ? null : p))}
    >
      <StarGlyph lit={index <= lit} icon={icon} shape={shape} px={px} />
    </motion.span>
  );

  if (readOnly) {
    return (
      <div
        ref={ref}
        role="img"
        aria-label={`${ariaLabel}: ${value} de ${count}`}
        className={rootClass}
        {...rootProps}
      >
        {indices.map((index) => (
          <span key={index} data-slot="lift-rating-item" data-lit={index <= value}>
            <StarGlyph lit={index <= value} icon={icon} shape={shape} px={px} />
          </span>
        ))}
      </div>
    );
  }

  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      aria-label={ariaLabel}
      value={value > 0 ? String(value) : ""}
      disabled={disabled}
      orientation="horizontal"
      className={rootClass}
      onPointerLeave={handleLeave}
      onKeyDown={handleKeyDown}
      {...(rootProps as object)}
    >
      {indices.map((index) => {
        return (
          <RadioGroupPrimitive.Item
            key={index}
            value={String(index)}
            aria-label={nameOf(index)}
            data-slot="lift-rating-item"
            data-lit={index <= lit}
            className="rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed"
            onPointerEnter={() => showPreview(index)}
            onPointerMove={() => showPreview(index)}
            onClick={(event) => {
              event.preventDefault();
              choose(index);
            }}
          >
            {renderGlyph(index)}
          </RadioGroupPrimitive.Item>
        );
      })}
      {showTip && interactive && preview !== null && (
        <motion.div
          data-slot="lift-rating-tip"
          aria-hidden="true"
          className="pointer-events-none absolute bottom-full left-0 mb-2"
          initial={false}
          animate={{ x: tipOffset(preview, px, GAP_PX) }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 35 }}
        >
          <span className="-translate-x-1/2 block whitespace-nowrap rounded-md border bg-popover px-2 py-0.5 text-popover-foreground text-xs shadow-sm">
            {labels[preview - 1] ?? String(preview)}
          </span>
        </motion.div>
      )}
    </RadioGroupPrimitive.Root>
  );
}

LiftRating.displayName = "LiftRating";

export { LiftRating };
