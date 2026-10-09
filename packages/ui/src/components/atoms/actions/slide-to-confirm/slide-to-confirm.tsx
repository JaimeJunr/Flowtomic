/**
 * SlideToConfirm Component - Flowtomic UI
 *
 * Pílula "deslize para confirmar": arrastar a alça pinta o caminho atrás dela;
 * chegando ao fim a ação dispara (com spinner se devolver promessa) e a pílula
 * vira "feito" ou "falha". Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/slide-to-confirm.md
 */

"use client";

import { Check, ChevronRight, Loader2 } from "lucide-react";
import {
  animate,
  type HTMLMotionProps,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  CONFIRM_THRESHOLD,
  KEY_STEP,
  labelOpacity,
  progress,
  type SlidePhase,
  slideReducer,
  springFor,
  travelOf,
} from "./slide-to-confirm-utils";

type NativeDivProps = Omit<
  React.ComponentProps<"div">,
  | "children"
  | "onError"
  | "style"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
>;

export type SlideToConfirmProps = NativeDivProps & {
  label?: React.ReactNode;
  doneLabel?: React.ReactNode;
  errorLabel?: React.ReactNode;
  onConfirm: () => void | Promise<unknown>;
  onDone?: () => void;
  onError?: (reason: unknown) => void;
  /** Trilho de 48 px (default) ou 56 px (lg) de altura. */
  size?: "default" | "lg";
  /** 0..100: rapidez do desenrolar e da volta. */
  speed?: number;
  /** 0..1: quanto a alça quica ao voltar. */
  returnBounce?: number;
  /** Fração de scale que o trilho afunda ao concluir. */
  landingDip?: number;
  /** Tempo em "feito" antes de voltar, em ms. 0 = fica até remontar. */
  holdMs?: number;
  disabled?: boolean;
  icon?: React.ReactNode;
};

const INSET_PX = 4;
const TRACK_HEIGHT = { default: 48, lg: 56 } as const;
const DEFAULT_ARIA_LABEL = "Deslize para confirmar";

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | null)?.then === "function";

/** Anima o valor com mola, ou salta direto quando o movimento é reduzido. */
function moveTo(
  value: ReturnType<typeof useMotionValue<number>>,
  target: number,
  reduced: boolean,
  speed: number,
  bounce: number
) {
  if (reduced) return value.set(target);
  animate(value, target, { type: "spring", ...springFor(speed, bounce) });
}

/** Pílula que exige deslizar a alça até o fim para confirmar uma ação. */
function SlideToConfirm({
  ref,
  className,
  label = DEFAULT_ARIA_LABEL,
  doneLabel = "Confirmado",
  errorLabel = "Não deu certo",
  onConfirm,
  onDone,
  onError,
  size = "default",
  speed = 50,
  returnBounce = 0.38,
  landingDip = 0.026,
  holdMs = 1500,
  disabled = false,
  icon,
  ...props
}: SlideToConfirmProps) {
  const reduced = useShouldReduceMotion();
  const handleSize = TRACK_HEIGHT[size] - 2 * INSET_PX;
  const [phase, dispatch] = React.useReducer(slideReducer, "idle" as SlidePhase);
  const phaseRef = React.useRef<SlidePhase>("idle");
  phaseRef.current = phase;

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRoot = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const pos = useMotionValue(0);
  const travel = useMotionValue(0);
  const handleW = useMotionValue(handleSize);
  const scale = useMotionValue(1);
  const x = useTransform([pos, travel], ([p, t]: number[]) => p * t);
  const fillW = useTransform([x, handleW], ([px, w]: number[]) => px + w);
  const textOpacity = useTransform(pos, labelOpacity);
  const [value, setValue] = React.useState(0);
  useMotionValueEvent(pos, "change", (latest) => setValue(Math.round(latest * 100)));

  const measure = React.useCallback(() => {
    const width = rootRef.current?.offsetWidth ?? 0;
    travel.set(travelOf(width, handleSize, INSET_PX));
    return travel.get();
  }, [travel, handleSize]);

  React.useEffect(() => {
    measure();
    const node = rootRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure]);

  const settle = (target: number, bounce: number) => moveTo(pos, target, reduced, speed, bounce);

  const confirm = async () => {
    const current = phaseRef.current;
    if (disabled || !(current === "idle" || current === "dragging" || current === "error")) return;
    dispatch("confirm");
    phaseRef.current = "pending";
    settle(1, 0);
    try {
      const result = onConfirm();
      if (isThenable(result)) await result;
      dispatch("resolve");
      onDone?.();
    } catch (reason) {
      dispatch("reject");
      settle(0, returnBounce);
      onError?.(reason);
    }
  };

  // Efeitos visuais por fase: desenrolar e afundar no "feito", encolher ao voltar.
  React.useEffect(() => {
    const inner = travel.get() + handleSize;
    if (phase === "done") {
      if (reduced) {
        handleW.set(inner);
        pos.set(0);
        return;
      }
      animate(handleW, inner, { type: "spring", ...springFor(speed, 0) });
      animate(pos, 0, { type: "spring", ...springFor(speed, 0) });
      animate(scale, [1, 1 - landingDip, 1], { duration: 0.35 });
    } else if (phase === "idle" || phase === "error") {
      if (reduced) handleW.set(handleSize);
      else animate(handleW, handleSize, { type: "spring", ...springFor(speed, 0) });
    }
  }, [phase, reduced, speed, landingDip, handleSize, handleW, pos, scale, travel]);

  React.useEffect(() => {
    if (phase !== "done" || holdMs <= 0) return;
    const timer = setTimeout(() => dispatch("reset"), holdMs);
    return () => clearTimeout(timer);
  }, [phase, holdMs]);

  const dragRef = React.useRef<{ startX: number; startPos: number; id: number } | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = phaseRef.current;
    if (disabled || event.button !== 0 || !(current === "idle" || current === "error")) return;
    measure();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { startX: event.clientX, startPos: pos.get(), id: event.pointerId };
    dispatch("dragStart");
    phaseRef.current = "dragging";
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const t = travel.get();
    pos.set(progress(drag.startPos * t + (event.clientX - drag.startX), t));
  };
  const handlePointerUp = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (pos.get() >= CONFIRM_THRESHOLD) return void confirm();
    dispatch("release");
    phaseRef.current = "idle";
    settle(0, returnBounce);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " " || event.key === "End") {
      event.preventDefault();
      void confirm();
    } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const step = event.key === "ArrowRight" ? KEY_STEP : -KEY_STEP;
      pos.set(Math.min(1, Math.max(0, Math.round((pos.get() + step) * 100) / 100)));
    }
  };

  const done = phase === "done";
  const failed = phase === "error";
  const ariaLabel = typeof label === "string" ? label : DEFAULT_ARIA_LABEL;

  return (
    <motion.div
      ref={setRoot}
      data-slot="slide-to-confirm"
      data-phase={phase}
      className={cn(
        "relative flex w-full select-none items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground text-sm",
        size === "lg" ? "h-14" : "h-12",
        done && "text-success-foreground",
        failed && "text-destructive",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      style={{ scale }}
      {...(props as HTMLMotionProps<"div">)}
    >
      <motion.div
        aria-hidden="true"
        data-slot="slide-to-confirm-fill"
        className={cn(
          "pointer-events-none absolute rounded-full",
          done ? "bg-success" : failed ? "bg-destructive" : "bg-primary"
        )}
        style={{ left: INSET_PX, top: INSET_PX, height: handleSize, width: fillW }}
      />
      {!done && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none truncate px-14"
          style={{ opacity: textOpacity }}
        >
          {failed ? errorLabel : label}
        </motion.span>
      )}
      <motion.div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        data-slot="slide-to-confirm-handle"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-busy={phase === "pending"}
        aria-disabled={disabled || undefined}
        className={cn(
          "absolute flex touch-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-medium text-primary-foreground",
          done ? "bg-success text-success-foreground" : failed ? "bg-destructive" : "bg-primary",
          !disabled && !done && "cursor-grab active:cursor-grabbing",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        style={{ left: INSET_PX, top: INSET_PX, height: handleSize, width: handleW, x }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        {phase === "pending" ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : done ? (
          <>
            <Check className="size-5" aria-hidden="true" />
            {doneLabel}
          </>
        ) : (
          (icon ?? <ChevronRight className="size-5" aria-hidden="true" />)
        )}
      </motion.div>
      <span className="sr-only" aria-live="polite">
        {done ? doneLabel : failed ? errorLabel : ""}
      </span>
    </motion.div>
  );
}

SlideToConfirm.displayName = "SlideToConfirm";

export { SlideToConfirm };
