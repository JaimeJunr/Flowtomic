/**
 * SwellChipGroup Component - Flowtomic UI
 *
 * Escolha única em chips: o escolhido incha (largura antes da altura, como
 * gelatina) e os vizinhos abrem espaço em cascata. Baseado em Radix RadioGroup
 * e motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/swell-chip-group.md
 */

"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  neighbourOffset,
  normalizeItems,
  type SwellChipItem,
  springDamping,
  springStiffness,
  staggerDelayMs,
} from "./swell-chip-group-utils";

export type { SwellChipItem } from "./swell-chip-group-utils";

type ChipSize = "sm" | "default" | "lg";

export type SwellChipGroupProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitive.Root>,
  "children" | "onValueChange"
> & {
  items: SwellChipItem[];
  onValueChange?: (value: string, index: number) => void;
  size?: ChipSize;
  /** Quanto o escolhido cresce (0.2 = 20%). Também define o espaço aberto pelos vizinhos. */
  swell?: number;
  /** px extras que cada vizinho é empurrado além do espaço aberto. */
  push?: number;
  /** Quanto cada não escolhido encolhe. */
  shrink?: number;
  /** 0..1.5: quanto a largura cresce antes da altura. 0 = uniforme. */
  jelly?: number;
  /** 1 - amortecimento. 0 para seco; 0.4 oscila. */
  bounce?: number;
  /** ms por posição de distância antes de o vizinho se mexer. */
  staggerMs?: number;
};

const SIZE_CLASSES: Record<ChipSize, string> = {
  sm: "h-7 px-3 text-xs",
  default: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

/** Atraso de scaleY por unidade de jelly, em segundos: a altura chega depois da largura. */
const JELLY_DELAY_S = 0.06;

function useSelectedWidth(chips: Array<HTMLElement | null>, selectedIndex: number): number {
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    setWidth(chips[selectedIndex]?.offsetWidth ?? 0);
  }, [chips, selectedIndex]);
  return width;
}

function SwellChipGroup({
  ref,
  className,
  items,
  value,
  defaultValue,
  onValueChange,
  size = "default",
  swell = 0.2,
  push = 6,
  shrink = 0.05,
  jelly = 1,
  bounce = 0.25,
  staggerMs = 22,
  ...props
}: SwellChipGroupProps) {
  const reduced = useShouldReduceMotion();
  const chips = React.useMemo(() => normalizeItems(items), [items]);
  const [inner, setInner] = React.useState(defaultValue ?? chips[0]?.value);
  const current = value ?? inner;
  const selectedIndex = chips.findIndex((chip) => chip.value === current);
  const nodes = React.useRef<Array<HTMLElement | null>>([]);
  const selectedWidth = useSelectedWidth(nodes.current, selectedIndex);

  const handleChange = (next: string) => {
    setInner(next);
    onValueChange?.(
      next,
      chips.findIndex((chip) => chip.value === next)
    );
  };

  const spring = {
    type: "spring" as const,
    stiffness: springStiffness(),
    damping: springDamping(Math.min(1, Math.max(0, bounce))),
  };

  const animateFor = (index: number, selected: boolean) => {
    if (reduced) return undefined;
    const scale = selected ? 1 + swell : 1 - shrink;
    const x = neighbourOffset(index, selectedIndex, selectedWidth, swell, push);
    return {
      animate: { scaleX: scale, scaleY: scale, x },
      transition: {
        scaleX: spring,
        scaleY: { ...spring, delay: selected ? jelly * JELLY_DELAY_S : 0 },
        x: { ...spring, delay: staggerDelayMs(index, selectedIndex, staggerMs) / 1000 },
      },
    };
  };

  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      data-slot="swell-chip-group"
      value={current}
      onValueChange={handleChange}
      className={cn("inline-flex items-center gap-2 px-6 py-2", className)}
      {...props}
    >
      {chips.map((chip, index) => {
        const selected = index === selectedIndex;
        return (
          <RadioGroupPrimitive.Item
            key={chip.value}
            value={chip.value}
            disabled={chip.disabled}
            asChild
          >
            <motion.button
              ref={(node: HTMLButtonElement | null) => {
                nodes.current[index] = node;
              }}
              type="button"
              data-slot="swell-chip"
              initial={false}
              {...animateFor(index, selected)}
              className={cn(
                "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
                SIZE_CLASSES[size],
                selected
                  ? "z-10 bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              )}
            >
              {chip.icon}
              {chip.label}
            </motion.button>
          </RadioGroupPrimitive.Item>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}

SwellChipGroup.displayName = "SwellChipGroup";

export { SwellChipGroup };
