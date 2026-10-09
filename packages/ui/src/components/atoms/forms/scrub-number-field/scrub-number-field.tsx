/**
 * ScrubNumberField Component - Flowtomic UI
 *
 * Chip com rótulo e número que se edita arrastando: cada `sensitivity` px é um
 * passo, Shift acelera e Alt desacelera. Passando do limite o número estica
 * como borracha e volta ao soltar. Clicar sem mover abre a edição por teclado.
 *
 * `ref` vai para a div raiz.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/scrub-number-field.md
 */

"use client";

import { animate } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  clamp,
  decimalsFromStep,
  formatDelta,
  formatNumber,
  nudgeValue,
  parseNumberInput,
  rubberBand,
  scrubValue,
} from "./scrub-number-field-utils";

type ScrubNumberFieldSize = "sm" | "default" | "lg";

export type ScrubNumberFieldProps = Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue" | "children"
> & {
  label: string;
  suffix?: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  /** Define as casas decimais. */
  step?: number;
  size?: ScrubNumberFieldSize;
  /** Pixels por passo. */
  sensitivity?: number;
  /** % da faixa que dá para passar do limite. 0 = parada seca. */
  rubberReach?: number;
  /** Tempo da volta da borracha, em ms. */
  returnMs?: number;
  coarseMultiplier?: number;
  fineMultiplier?: number;
  showDelta?: boolean;
  showDirty?: boolean;
  showFill?: boolean;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
};

const SIZE_CLASSES: Record<ScrubNumberFieldSize, string> = {
  sm: "h-7 text-xs",
  default: "h-8 text-sm",
  lg: "h-10 text-base",
};

const CLICK_THRESHOLD_PX = 3;

type DragState = {
  startX: number;
  anchorX: number;
  anchorValue: number;
  /** Valor sem limitar no último movimento. */
  raw: number;
  multiplier: number;
  startValue: number;
  moved: boolean;
};

function modifierMultiplier(
  event: { shiftKey: boolean; altKey: boolean },
  coarse: number,
  fine: number
): number {
  if (event.shiftKey) return coarse;
  return event.altKey ? fine : 1;
}

/** Campo numérico em chip: arraste para mudar, clique para digitar. */
function ScrubNumberField({
  ref,
  className,
  label,
  suffix = "",
  value: valueProp,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  size = "default",
  sensitivity = 2,
  rubberReach = 8,
  returnMs = 300,
  coarseMultiplier = 10,
  fineMultiplier = 0.1,
  showDelta = true,
  showDirty = false,
  showFill = true,
  disabled = false,
  onValueChange,
  onValueCommit,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: ScrubNumberFieldProps) {
  const reduced = useShouldReduceMotion();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const drag = React.useRef<DragState | null>(null);
  const returning = React.useRef<{ stop: () => void } | null>(null);
  const [innerValue, setInnerValue] = React.useState(defaultValue);
  const [scrubbing, setScrubbing] = React.useState(false);
  const [stretched, setStretched] = React.useState<number | null>(null);
  const [pointerX, setPointerX] = React.useState(0);
  const [delta, setDelta] = React.useState(0);
  const [draft, setDraft] = React.useState<string | null>(null);

  const value = valueProp ?? innerValue;
  const decimals = decimalsFromStep(step);
  const range = { min, max, step };
  const shown = stretched ?? value;
  const inputText = draft ?? formatNumber(shown, decimals);
  const dirty = value !== defaultValue;

  React.useEffect(() => () => returning.current?.stop(), []);

  const emit = (next: number, commit: boolean) => {
    if (next !== value) {
      setInnerValue(next);
      onValueChange?.(next);
    }
    if (commit) onValueCommit?.(next);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (disabled || event.button !== 0 || draft !== null) return;
    event.preventDefault();
    returning.current?.stop();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = {
      startX: event.clientX,
      anchorX: event.clientX,
      anchorValue: value,
      raw: value,
      multiplier: 1,
      startValue: value,
      moved: false,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const state = drag.current;
    if (!state || disabled) return;
    if (!state.moved && Math.abs(event.clientX - state.startX) < CLICK_THRESHOLD_PX) return;
    const multiplier = modifierMultiplier(event, coarseMultiplier, fineMultiplier);
    if (state.moved && multiplier !== state.multiplier) {
      // Trocar de modificador no meio do arrasto não pode saltar o valor.
      state.anchorX = event.clientX;
      state.anchorValue = state.raw;
    }
    state.multiplier = multiplier;
    state.moved = true;
    state.raw = scrubValue(state.anchorValue, event.clientX - state.anchorX, {
      step,
      sensitivity,
      multiplier,
    });
    const committed = clamp(state.raw, min, max);
    setScrubbing(true);
    setPointerX(event.clientX - event.currentTarget.getBoundingClientRect().left);
    setDelta(committed - state.startValue);
    setStretched(rubberBand(state.raw, min, max, rubberReach));
    emit(committed, false);
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    drag.current = null;
    if (!state || disabled) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (!state.moved) {
      inputRef.current?.focus();
      inputRef.current?.select();
      return;
    }
    setScrubbing(false);
    emit(clamp(state.raw, min, max), true);
    releaseStretch(state.raw);
  };

  const releaseStretch = (raw: number) => {
    const from = rubberBand(raw, min, max, rubberReach);
    const to = clamp(raw, min, max);
    if (reduced || from === to || returnMs <= 0) {
      setStretched(null);
      return;
    }
    returning.current = animate(from, to, {
      duration: returnMs / 1000,
      ease: "easeOut",
      onUpdate: setStretched,
      onComplete: () => setStretched(null),
    });
  };

  const commitDraft = () => {
    if (draft === null) return;
    const next = parseNumberInput(draft, value, range);
    setDraft(null);
    emit(next, true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key === "Enter") {
      event.preventDefault();
      commitDraft();
      return;
    }
    if (event.key === "Escape") {
      setDraft(null);
      return;
    }
    const direction = KEY_DIRECTION[event.key];
    if (direction) {
      event.preventDefault();
      const multiplier = PAGE_KEYS.has(event.key)
        ? coarseMultiplier
        : modifierMultiplier(event, coarseMultiplier, fineMultiplier);
      setDraft(null);
      emit(nudgeValue(value, direction, multiplier, range), true);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setDraft(null);
      emit(event.key === "Home" ? min : max, true);
    }
  };

  const fillPct = max > min ? ((clamp(shown, min, max) - min) / (max - min)) * 100 : 0;

  return (
    <div
      ref={ref}
      data-slot="scrub-number-field"
      data-dirty={dirty}
      data-scrubbing={scrubbing}
      className={cn(
        "relative inline-flex touch-none select-none items-center gap-2 rounded-md bg-secondary px-3",
        "cursor-ew-resize transition-shadow",
        SIZE_CLASSES[size],
        showDirty && dirty && "ring-1 ring-primary",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        finishDrag(event);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        finishDrag(event);
      }}
      {...props}
    >
      {showFill && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-md"
        >
          <span
            data-slot="scrub-number-field-fill"
            className="absolute inset-y-0 left-0 bg-primary/15"
            style={{ width: `${fillPct}%` }}
          />
        </span>
      )}
      <span className="relative text-muted-foreground">{label}</span>
      <span className="relative inline-flex items-baseline gap-1">
        <input
          ref={inputRef}
          data-slot="scrub-number-field-input"
          type="text"
          inputMode="decimal"
          role="spinbutton"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${formatNumber(value, decimals)}${suffix ? ` ${suffix}` : ""}`}
          disabled={disabled}
          value={inputText}
          style={{ width: `${Math.max(inputText.length, 1) + 1}ch` }}
          className="cursor-ew-resize bg-transparent text-right font-mono tabular-nums text-foreground outline-none focus:cursor-text"
          onFocus={() => setDraft(formatNumber(value, decimals))}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={handleKeyDown}
        />
        {suffix && <span className="text-muted-foreground">{suffix}</span>}
      </span>
      {showDelta && scrubbing && delta !== 0 && (
        <span
          aria-hidden="true"
          data-slot="scrub-number-field-delta"
          className="pointer-events-none absolute bottom-full mb-1 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 font-mono text-xs tabular-nums text-primary-foreground"
          style={{ left: pointerX }}
        >
          {formatDelta(delta, decimals)}
        </span>
      )}
    </div>
  );
}

const KEY_DIRECTION: Record<string, 1 | -1 | undefined> = {
  ArrowUp: 1,
  ArrowRight: 1,
  PageUp: 1,
  ArrowDown: -1,
  ArrowLeft: -1,
  PageDown: -1,
};
const PAGE_KEYS = new Set(["PageUp", "PageDown"]);

ScrubNumberField.displayName = "ScrubNumberField";

export { ScrubNumberField };
