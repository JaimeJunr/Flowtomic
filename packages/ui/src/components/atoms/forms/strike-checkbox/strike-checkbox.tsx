/**
 * StrikeCheckbox Component - Flowtomic UI
 *
 * Linha de checklist: ao marcar, o preenchimento cresce do centro da caixa numa
 * mola, o ✓ é desenhado e um risco atravessa o texto com a largura dele.
 * Estado indeterminate não é suportado (tratado como desmarcado).
 * Baseado em Radix Checkbox e motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/strike-checkbox.md
 */

"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { motion } from "motion/react";
import type * as React from "react";
import { useState } from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { type StrikeDirection, springFromBounce, strikeOrigin } from "./strike-checkbox-utils";

type Size = "sm" | "default" | "lg";

/** `ref` aponta para o controle (o checkbox), não para o `<label>` da raiz. `className` vai na raiz. */
export type StrikeCheckboxProps = Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  "children" | "className"
> & {
  className?: string;
  label: React.ReactNode;
  size?: Size;
  /** Quanto o preenchimento passa do tamanho cheio. 0 chega seco. */
  bounce?: number;
  /** 0..0.5: em que ponto da mola o risco começa (0 junto do preenchimento). */
  strikeLag?: number;
  /** Opacidade do texto quando marcado. */
  doneOpacity?: number;
  strike?: StrikeDirection;
};

const SIZE_CLASSES: Record<Size, { box: string; text: string }> = {
  sm: { box: "size-4", text: "text-sm" },
  default: { box: "size-5", text: "text-base" },
  lg: { box: "size-6", text: "text-lg" },
};

const CHECK_PATH = "M5 12.5l4.5 4.5L19 7.5";
const REDUCED_FADE_S = 0.1;
const CHECK_DELAY_S = 0.08;

/** Risco de 1/12 do corpo da fonte (mín. 1px), centrado na altura do texto. */
const STRIKE_HEIGHT = "max(1px, 0.0833em)";

function StrikeCheckbox({
  ref,
  className,
  label,
  size = "default",
  bounce = 0.2,
  strikeLag = 0.12,
  doneOpacity = 0.5,
  strike = "left",
  disabled,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: StrikeCheckboxProps) {
  const reduced = useShouldReduceMotion();
  const sizes = SIZE_CLASSES[size];
  const origin = strikeOrigin(strike);
  const isControlled = checked !== undefined;
  const [inner, setInner] = useState(defaultChecked ?? false);
  const done = (isControlled ? checked : inner) === true;
  const spring = reduced ? { duration: REDUCED_FADE_S } : springFromBounce(bounce);
  const strikeDelay = reduced ? 0 : strikeLag;

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: o controle (Radix Checkbox, um button) está aninhado no label; o Biome só reconhece input
    <label
      data-slot="strike-checkbox"
      data-state={done ? "checked" : "unchecked"}
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-2.5",
        sizes.text,
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <CheckboxPrimitive.Root
        ref={ref}
        data-slot="strike-checkbox-box"
        disabled={disabled}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(next) => {
          setInner(next === true);
          onCheckedChange?.(next);
        }}
        className={cn(
          "relative grid shrink-0 place-items-center overflow-hidden rounded-sm border border-input",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed",
          sizes.box
        )}
        {...props}
      >
        <motion.span
          aria-hidden="true"
          data-slot="strike-checkbox-fill"
          className="absolute inset-0 rounded-[inherit] bg-primary"
          initial={false}
          animate={{ scale: done ? 1 : 0 }}
          transition={spring}
        />
        <CheckboxPrimitive.Indicator forceMount asChild>
          <motion.svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative size-full p-0.5 text-primary-foreground"
          >
            <motion.path
              d={CHECK_PATH}
              initial={false}
              animate={{ pathLength: done ? 1 : 0 }}
              transition={reduced ? spring : { duration: 0.2, delay: done ? CHECK_DELAY_S : 0 }}
            />
          </motion.svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span className="relative inline-block">
        <motion.span
          className="block text-foreground"
          initial={false}
          animate={{ opacity: done ? doneOpacity : 1 }}
          transition={{ duration: reduced ? REDUCED_FADE_S : 0.2 }}
        >
          {label}
        </motion.span>
        {origin && (
          <motion.span
            aria-hidden="true"
            data-slot="strike-checkbox-strike"
            className={cn(
              "pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 bg-foreground",
              origin
            )}
            style={{ height: STRIKE_HEIGHT }}
            initial={false}
            animate={{ scaleX: done ? 1 : 0 }}
            transition={{ ...spring, delay: strikeDelay }}
          />
        )}
      </span>
    </label>
  );
}

StrikeCheckbox.displayName = "StrikeCheckbox";

export { StrikeCheckbox };
