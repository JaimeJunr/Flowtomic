/**
 * SwipeActionsRow Component - Flowtomic UI
 *
 * Linha de lista com ações escondidas atrás: arrastar revela a gaveta, soltar
 * além de 60% da largura executa a ação principal e a linha dobra até sumir.
 * Passando do limite, a linha resiste como borracha. Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/swipe-actions-row.md
 */

"use client";

import { animate, type HTMLMotionProps, motion, useMotionValue } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  DEFAULT_COMMIT_AT,
  FLING_VELOCITY,
  releaseTarget,
  rubberOffset,
} from "./swipe-actions-row-utils";

type SwipeActionTone = "destructive" | "neutral" | "primary";

export type SwipeAction = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** A primeira ação (principal) usa "destructive" por padrão; as demais, "neutral". */
  tone?: SwipeActionTone;
  /** Dobra a linha ao ser pressionada. A principal sempre dobra. */
  dismiss?: boolean;
  onSelect?: () => void;
};

// Props de arrasto e animação do HTML colidem com as do motion.div.
type NativeDivProps = Omit<
  React.ComponentProps<"div">,
  | "children"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "style"
>;

export type SwipeActionsRowProps = NativeDivProps & {
  children: React.ReactNode;
  /** A primeira é a do swipe completo. */
  actions: SwipeAction[];
  direction?: "left" | "right";
  actionWidth?: number;
  snapBounce?: number;
  resistance?: number;
  collapseMs?: number;
  /** Fração da largura da linha a partir da qual o arrasto executa a ação principal. */
  commitAt?: number;
  fullSwipe?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAction?: (action: SwipeAction) => void;
  /** Depois que a linha dobrou. Remova o item aqui. */
  onCommit?: (action: SwipeAction) => void;
  closeOnAction?: boolean;
  disabled?: boolean;
  /** Nome acessível da linha. */
  label?: string;
};

const TONE_CLASSES: Record<SwipeActionTone, string> = {
  destructive: "bg-destructive text-destructive-foreground",
  neutral: "bg-secondary text-secondary-foreground",
  primary: "bg-primary text-primary-foreground",
};

// Abaixo disso o toque é clique, não arrasto.
const DRAG_THRESHOLD_PX = 4;

type DragState = {
  pointerId: number;
  startX: number;
  startOffset: number;
  offset: number;
  velocity: number;
  lastX: number;
  lastT: number;
  moved: boolean;
  jumped: boolean;
};

function toneOf(action: SwipeAction, index: number): SwipeActionTone {
  return action.tone ?? (index === 0 ? "destructive" : "neutral");
}

/** Estado "aberto" controlado ou não; só notifica quando muda. */
function useOpenState(
  controlled: boolean | undefined,
  onOpenChange?: (open: boolean) => void
): [boolean, (next: boolean) => void] {
  const [inner, setInner] = React.useState(false);
  const isOpen = controlled ?? inner;
  const setOpen = (next: boolean) => {
    if (next === isOpen) return;
    if (controlled === undefined) setInner(next);
    onOpenChange?.(next);
  };
  return [isOpen, setOpen];
}

/** Linha de lista com gaveta de ações revelada por arrasto. */
function SwipeActionsRow({
  ref,
  className,
  children,
  actions,
  direction = "left",
  actionWidth = 80,
  snapBounce = 0.2,
  resistance = 0.55,
  collapseMs = 200,
  commitAt = DEFAULT_COMMIT_AT,
  fullSwipe = true,
  open,
  onOpenChange,
  onAction,
  onCommit,
  closeOnAction = true,
  disabled = false,
  label = "Item da lista",
  onKeyDown,
  ...props
}: SwipeActionsRowProps) {
  const reduced = useShouldReduceMotion();
  const drawerId = React.useId();
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<DragState | null>(null);
  const committedRef = React.useRef<SwipeAction | null>(null);
  const suppressClickRef = React.useRef(false);
  const x = useMotionValue(0);
  const [isOpen, setOpen] = useOpenState(open, onOpenChange);
  const [committing, setCommitting] = React.useState(false);
  const [jumped, setJumped] = React.useState(false);

  const sign = direction === "left" ? -1 : 1;
  const drawerWidth = actions.length * actionWidth;
  const ordered = direction === "left" ? [...actions.slice(1), actions[0]] : actions;

  const glideTo = (target: number, flick: boolean) => {
    const transition = reduced
      ? { duration: 0 }
      : flick
        ? { type: "spring" as const, bounce: snapBounce, duration: 0.45 }
        : { duration: 0.2, ease: "easeOut" as const };
    animate(x, target, transition);
  };

  // Mudanças externas (prop open, teclado) reposicionam a superfície; durante o arrasto quem manda é o ponteiro.
  // biome-ignore lint/correctness/useExhaustiveDependencies: glideTo muda a cada render e só deve rodar quando o estado muda
  React.useEffect(() => {
    if (dragRef.current || committing) return;
    glideTo(isOpen ? sign * drawerWidth : 0, false);
  }, [isOpen, drawerWidth, sign, committing]);

  const commit = (action: SwipeAction) => {
    committedRef.current = action;
    action.onSelect?.();
    onAction?.(action);
    setCommitting(true);
    glideTo(sign * (surfaceRef.current?.offsetWidth ?? drawerWidth), false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: onCommit e collapseMs são lidos uma vez, quando o commit começa
  React.useEffect(() => {
    if (!committing) return;
    const timer = setTimeout(
      () => onCommit?.(committedRef.current as SwipeAction),
      reduced ? 0 : collapseMs
    );
    return () => clearTimeout(timer);
  }, [committing]);

  const press = (action: SwipeAction, index: number) => {
    if (action.dismiss || index === 0) {
      commit(action);
      return;
    }
    action.onSelect?.();
    onAction?.(action);
    if (closeOnAction) setOpen(false);
  };

  const rowWidth = () => surfaceRef.current?.offsetWidth ?? 0;

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || committing || event.button !== 0 || rowWidth() <= 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const startOffset = isOpen ? drawerWidth : 0;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset,
      offset: startOffset,
      velocity: 0,
      lastX: event.clientX,
      lastT: performance.now(),
      moved: false,
      jumped: false,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD_PX) return;
    drag.moved = true;
    const reveal = direction === "left" ? -dx : dx;
    const now = performance.now();
    const dt = now - drag.lastT;
    if (dt > 0) {
      const step = direction === "left" ? drag.lastX - event.clientX : event.clientX - drag.lastX;
      drag.velocity = step / dt;
    }
    drag.lastX = event.clientX;
    drag.lastT = now;
    const width = rowWidth();
    drag.offset = rubberOffset(
      drag.startOffset + reveal,
      width,
      commitAt,
      fullSwipe,
      drawerWidth,
      resistance
    );
    x.set(sign * drag.offset);
    const past = fullSwipe && drag.offset >= commitAt * width;
    if (past && !drag.jumped && typeof navigator.vibrate === "function") navigator.vibrate(10);
    drag.jumped = past;
    setJumped(past);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setJumped(false);
    if (!drag.moved) return;
    suppressClickRef.current = true;
    const target = releaseTarget(
      drag.offset,
      drag.velocity,
      drawerWidth,
      rowWidth(),
      commitAt,
      fullSwipe
    );
    if (target === "commit") {
      commit(actions[0]);
      return;
    }
    const nextOpen = target === "open";
    glideTo(nextOpen ? sign * drawerWidth : 0, Math.abs(drag.velocity) >= FLING_VELOCITY);
    setOpen(nextOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.key !== "Escape" || !isOpen) return;
    setOpen(false);
    toggleRef.current?.focus();
  };

  const state = committing ? "committing" : isOpen ? "open" : "closed";
  const dur = reduced ? 0 : collapseMs / 1000;

  return (
    <motion.div
      ref={ref}
      data-slot="swipe-actions-row"
      data-state={state}
      role="group"
      aria-label={label}
      className={cn("relative overflow-hidden", disabled && "opacity-50", className)}
      initial={false}
      animate={{ height: committing ? 0 : "auto" }}
      transition={{ duration: dur }}
      onKeyDown={handleKeyDown}
      {...(props as HTMLMotionProps<"div">)}
    >
      <div
        id={drawerId}
        data-slot="swipe-actions-row-drawer"
        inert={!isOpen && !committing}
        className={cn(
          "absolute inset-y-0 flex w-full bg-muted",
          direction === "left" ? "right-0 justify-end" : "left-0 justify-start"
        )}
      >
        {ordered.map((action) => {
          const index = actions.indexOf(action);
          const isPrimary = index === 0;
          const hidden = jumped && !isPrimary;
          return (
            <motion.button
              key={action.id}
              type="button"
              data-slot="swipe-actions-row-action"
              data-tone={toneOf(action, index)}
              data-jumped={jumped && isPrimary ? "true" : undefined}
              className={cn(
                "flex shrink-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                TONE_CLASSES[toneOf(action, index)]
              )}
              initial={false}
              animate={{ width: jumped && isPrimary ? "100%" : hidden ? 0 : actionWidth }}
              transition={{ duration: reduced ? 0 : 0.15 }}
              onClick={() => press(action, index)}
            >
              {action.icon}
              {action.label}
            </motion.button>
          );
        })}
      </div>
      <motion.div
        ref={surfaceRef}
        data-slot="swipe-actions-row-surface"
        className={cn(
          "relative select-none bg-card",
          !disabled && "cursor-grab active:cursor-grabbing"
        )}
        style={{ x, touchAction: "pan-y" }}
        animate={{ opacity: committing && reduced ? 0 : 1 }}
        transition={{ duration: dur }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;
          suppressClickRef.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {children}
        <button
          ref={toggleRef}
          type="button"
          disabled={disabled}
          aria-expanded={isOpen}
          aria-controls={drawerId}
          className="sr-only absolute top-1 right-1 rounded-md bg-card px-2 py-1 text-foreground text-xs focus:not-sr-only focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setOpen(!isOpen)}
        >
          Ações
        </button>
      </motion.div>
    </motion.div>
  );
}

SwipeActionsRow.displayName = "SwipeActionsRow";

export { SwipeActionsRow };
