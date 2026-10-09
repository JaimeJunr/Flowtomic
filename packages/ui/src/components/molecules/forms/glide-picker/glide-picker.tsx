/**
 * GlidePicker Component - Flowtomic UI
 *
 * Seletor compacto: um chip com o valor abre um menu que cresce a partir do
 * canto do chip. Uma pílula de destaque desliza de linha em linha, seguindo
 * ponteiro e teclado. Baseado em Radix DropdownMenu e motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/glide-picker.md
 */

"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  exitDuration,
  type GlidePickerOptionInput,
  type GlidePickerOptionObject,
  normalizeOption,
  pillTarget,
} from "./glide-picker-utils";

export type GlidePickerOption = GlidePickerOptionInput;

export type GlidePickerProps = {
  options: GlidePickerOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option: GlidePickerOptionObject) => void;
  placeholder?: string;
  showTags?: boolean;
  size?: "sm" | "default" | "lg";
  /** Largura do menu em px; nunca menor que o chip. */
  menuWidth?: number;
  side?: "top" | "bottom";
  align?: "start" | "end";
  /** Duração de entrada do menu, em ms. */
  popMs?: number;
  /** Duração da pílula entre linhas, em ms. 0 = hover comum. */
  glideMs?: number;
  /** A pílula fica na última linha ao sair; reentrar desliza dali. */
  rememberPosition?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
};

const SIZE_CLASSES = {
  sm: "h-7 px-2.5 text-xs",
  default: "h-8 px-3 text-sm",
  lg: "h-11 px-4 text-base",
} as const;

type PillRect = { top: number; height: number };

/** Mede a linha alvo; a pílula é absoluta, então precisa do offset dentro do menu. */
function usePillRect(
  rows: React.RefObject<Array<HTMLElement | null>>,
  target: number | null,
  rowsReady: boolean
) {
  const [rect, setRect] = React.useState<PillRect | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: rowsReady força a medição quando as linhas montam
  React.useLayoutEffect(() => {
    const row = target === null ? null : rows.current[target];
    setRect(row ? { top: row.offsetTop, height: row.offsetHeight } : null);
  }, [rows, target, rowsReady]);
  return rect;
}

type MenuProps = {
  options: GlidePickerOptionObject[];
  selected: string | undefined;
  showTags: boolean;
  menuWidth: number;
  side: "top" | "bottom";
  align: "start" | "end";
  popMs: number;
  glideMs: number;
  rememberPosition: boolean;
  reduced: boolean;
  onChange: (value: string) => void;
};

function GlidePickerMenu(props: MenuProps) {
  const { options, selected, showTags, rememberPosition, reduced } = props;
  const selectedIndex = options.findIndex((o) => o.value === selected);
  const [highlighted, setHighlighted] = React.useState<number | null>(null);
  const [last, setLast] = React.useState<number | null>(null);
  // O Portal do Radix monta as linhas depois do primeiro layout; sem isto a pílula nunca mede.
  const [rowsReady, setRowsReady] = React.useState(false);
  const rows = React.useRef<Array<HTMLElement | null>>([]);
  const target = pillTarget(
    highlighted,
    selectedIndex < 0 ? null : selectedIndex,
    rememberPosition,
    last
  );
  const rect = usePillRect(rows, target, rowsReady);
  const glide = reduced ? 0 : props.glideMs / 1000;
  const enter = reduced ? 0.1 : props.popMs / 1000;
  const exit = reduced ? 0.1 : exitDuration(props.popMs) / 1000;
  const hidden = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 };

  return (
    <DropdownMenu.Portal forceMount>
      <DropdownMenu.Content
        forceMount
        asChild
        side={props.side}
        align={props.align}
        sideOffset={6}
        onPointerLeave={() => setHighlighted(null)}
      >
        <motion.div
          data-slot="glide-picker-content"
          className="relative z-50 origin-(--radix-dropdown-menu-content-transform-origin) rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none"
          style={{
            minWidth: `max(${props.menuWidth}px, var(--radix-dropdown-menu-trigger-width))`,
          }}
          initial={hidden}
          animate={{ opacity: 1, scale: 1, transition: { duration: enter } }}
          exit={{ ...hidden, transition: { duration: exit } }}
        >
          {rect && (
            <motion.div
              aria-hidden="true"
              data-slot="glide-picker-pill"
              className="pointer-events-none absolute inset-x-1 rounded-sm bg-accent"
              initial={false}
              animate={{
                y: rect.top,
                height: rect.height,
                opacity: highlighted === null ? 0.6 : 1,
              }}
              transition={{ duration: glide, ease: "easeOut" }}
              style={{ top: 0 }}
            />
          )}
          <DropdownMenu.RadioGroup value={selected ?? ""} onValueChange={props.onChange}>
            {options.map((option, index) => (
              <DropdownMenu.RadioItem
                key={option.value}
                ref={(node) => {
                  rows.current[index] = node;
                  if (node && index === options.length - 1) setRowsReady(true);
                }}
                value={option.value}
                data-slot="glide-picker-option"
                onFocus={() => {
                  setHighlighted(index);
                  setLast(index);
                }}
                className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <span className="flex-1">{option.label}</span>
                {showTags && option.tag && (
                  <span className="text-xs text-muted-foreground">{option.tag}</span>
                )}
                <span className="flex size-4 items-center justify-center">
                  <DropdownMenu.ItemIndicator>
                    <Check className="size-4 text-primary" aria-hidden="true" />
                  </DropdownMenu.ItemIndicator>
                </span>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </motion.div>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}

/** Chip que abre um menu de opções com pílula de destaque deslizante. */
function GlidePicker({
  ref,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Selecionar…",
  showTags = true,
  size = "default",
  menuWidth = 176,
  side = "bottom",
  align = "start",
  popMs = 180,
  glideMs = 220,
  rememberPosition = true,
  disabled = false,
  "aria-label": ariaLabel = "Selecionar",
  className,
}: GlidePickerProps) {
  const reduced = useShouldReduceMotion();
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState(defaultValue);
  const selected = value ?? internal;
  const normalized = React.useMemo(() => options.map(normalizeOption), [options]);
  const current = normalized.find((o) => o.value === selected);

  const handleChange = (next: string) => {
    const option = normalized.find((o) => o.value === next);
    if (!option) return;
    setInternal(next);
    onValueChange?.(next, option);
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger
        ref={ref}
        data-slot="glide-picker"
        data-state={open ? "open" : "closed"}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-2 rounded-md bg-secondary font-medium text-secondary-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          SIZE_CLASSES[size],
          disabled && "opacity-50",
          className
        )}
      >
        <span className={cn(!current && "text-muted-foreground")}>
          {current ? current.label : placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </DropdownMenu.Trigger>
      <AnimatePresence>
        {open && (
          <GlidePickerMenu
            onChange={handleChange}
            options={normalized}
            selected={selected}
            showTags={showTags}
            menuWidth={menuWidth}
            side={side}
            align={align}
            popMs={popMs}
            glideMs={glideMs}
            rememberPosition={rememberPosition}
            reduced={reduced}
          />
        )}
      </AnimatePresence>
    </DropdownMenu.Root>
  );
}

GlidePicker.displayName = "GlidePicker";

export { GlidePicker };
