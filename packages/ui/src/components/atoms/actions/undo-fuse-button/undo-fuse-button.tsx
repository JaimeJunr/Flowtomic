/**
 * UndoFuseButton Component - Flowtomic UI
 *
 * Ação feita na hora, com janela para desfazer: o botão vira "Desfazer" e um pavio
 * aceso queima ao longo da borda; quando acaba, volta ao início ou fica em "feito".
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/undo-fuse-button.md
 */

"use client";

import { Archive, Check, Undo2 } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../button/button";
import {
  pillPath,
  pillPerimeter,
  type UndoFuseCommitReason,
  type UndoFusePhase,
  type UndoFuseSettle,
  useFuseMachine,
} from "./undo-fuse-button-utils";

export type { UndoFuseCommitReason, UndoFusePhase, UndoFuseSettle };

type UndoFuseSize = "sm" | "default" | "lg";
type UndoFuseKind = "outline" | "bottom" | "top";

export type UndoFuseButtonProps = Omit<
  React.ComponentProps<"button">,
  "children" | "onClick" | "style"
> & {
  label?: string;
  undoLabel?: string;
  doneLabel?: string;
  /** Texto anunciado a leitores de tela ao desfazer. */
  undoneAnnouncement?: string;
  icon?: React.ReactNode;
  size?: UndoFuseSize;
  /** Duração da janela de desfazer, em ms. */
  undoWindowMs?: number;
  fuse?: UndoFuseKind;
  /** Quando `onCommit` dispara: no clique (desfazer reverte) ou só quando o pavio acaba. */
  commitOn?: UndoFuseCommitReason;
  pauseOnHover?: boolean;
  /** Depois do pavio: volta ao início ou fica em "feito". */
  settle?: UndoFuseSettle;
  onCommit?: (reason: UndoFuseCommitReason) => void;
  onUndo?: () => void;
  onFuseEnd?: () => void;
  onPhaseChange?: (phase: UndoFusePhase) => void;
};

const LABEL_SWAP_S = 0.2;

type LabelStackProps = {
  phase: UndoFusePhase;
  blur: boolean;
  cells: Record<UndoFusePhase, React.ReactNode>;
};

/** Os rótulos das três fases dividem a mesma célula do grid: a largura é a do maior desde o primeiro render. */
function LabelStack({ phase, blur, cells }: LabelStackProps) {
  const order: UndoFusePhase[] = ["idle", "armed", "settled"];
  return (
    <span className="relative inline-grid">
      {order.map((name) => {
        const active = name === phase;
        return (
          <motion.span
            key={name}
            data-slot={`undo-fuse-button-label-${name}`}
            aria-hidden={active ? undefined : true}
            className={cn(
              "inline-flex items-center justify-center gap-2 [grid-area:1/1]",
              !active && "invisible"
            )}
            initial={false}
            animate={
              active
                ? { opacity: 1, filter: "blur(0px)" }
                : { opacity: 0, filter: blur ? "blur(4px)" : "blur(0px)" }
            }
            transition={{ duration: blur ? LABEL_SWAP_S : 0 }}
          >
            {cells[name]}
          </motion.span>
        );
      })}
    </span>
  );
}

const FUSE_INSET_PX = 1;

type ButtonBox = { width: number; height: number };

/** Mede o botão (ResizeObserver, com offsetWidth/offsetHeight como base); no jsdom dá 0. */
function useButtonBox(forwardedRef: React.Ref<HTMLButtonElement> | undefined) {
  const [box, setBox] = React.useState<ButtonBox>({ width: 0, height: 0 });
  const refCallback = React.useCallback(
    (node: HTMLButtonElement | null) => {
      let cleanupForwarded: (() => void) | undefined;
      if (typeof forwardedRef === "function") {
        const returned = forwardedRef(node);
        cleanupForwarded = typeof returned === "function" ? returned : undefined;
      } else if (forwardedRef) forwardedRef.current = node;
      if (!node) return;
      const measure = () => setBox({ width: node.offsetWidth, height: node.offsetHeight });
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => {
        observer.disconnect();
        if (typeof cleanupForwarded === "function") cleanupForwarded();
        else if (typeof forwardedRef === "function") forwardedRef(null);
        else if (forwardedRef) forwardedRef.current = null;
      };
    },
    [forwardedRef]
  );
  return { box, refCallback };
}

/** Pavio na borda: path em px (o dash não escala com geometria CSS), então precisa do tamanho medido. */
function OutlineFuse({ remaining, box }: { remaining: number; box: ButtonBox }) {
  if (box.width <= 0 || box.height <= 0) return null;
  const perimeter = pillPerimeter(box.width, box.height, FUSE_INSET_PX);
  return (
    <svg
      aria-hidden="true"
      data-slot="undo-fuse-button-fuse"
      width={box.width}
      height={box.height}
      viewBox={`0 0 ${box.width} ${box.height}`}
      className="pointer-events-none absolute inset-0 overflow-visible"
      // Inline porque o `[&_svg]:size-4` do buttonVariants ganha de qualquer classe aqui.
      style={{ width: box.width, height: box.height }}
    >
      <path
        d={pillPath(box.width, box.height, FUSE_INSET_PX)}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        className="stroke-primary"
        style={{
          strokeDasharray: perimeter,
          strokeDashoffset: perimeter * (1 - remaining),
        }}
      />
    </svg>
  );
}

function BarFuse({ remaining, edge }: { remaining: number; edge: "top" | "bottom" }) {
  return (
    <span
      aria-hidden="true"
      data-slot="undo-fuse-button-fuse"
      className={cn(
        "pointer-events-none absolute inset-x-3 h-0.5 origin-right rounded-full bg-primary",
        edge === "top" ? "top-0" : "bottom-0"
      )}
      style={{ transform: `scaleX(${remaining})` }}
    />
  );
}

/** Botão de ação imediata com janela de desfazer marcada por um pavio. */
function UndoFuseButton({
  ref,
  className,
  label = "Arquivar",
  undoLabel = "Desfazer",
  doneLabel = "Arquivado",
  undoneAnnouncement = "Ação desfeita",
  icon,
  size = "default",
  undoWindowMs = 4000,
  fuse = "outline",
  commitOn = "press",
  pauseOnHover = true,
  settle = "reset",
  onCommit,
  onUndo,
  onFuseEnd,
  onPhaseChange,
  disabled = false,
  onKeyDown,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  ...props
}: UndoFuseButtonProps) {
  const reduced = useShouldReduceMotion();
  const byPointerRef = React.useRef(false);
  const machine = useFuseMachine({
    windowMs: undoWindowMs,
    settle,
    commitOn,
    pauseOnHover,
    doneLabel,
    undoLabel,
    undoneAnnouncement,
    onCommit,
    onUndo,
    onFuseEnd,
    onPhaseChange,
  });
  const { phase, remaining } = machine;
  const { box, refCallback } = useButtonBox(ref);

  const handleClick = () => (phase === "armed" ? machine.undo() : machine.press());
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    byPointerRef.current = false;
    if (event.key === "Escape") machine.undo();
  };

  const cells: Record<UndoFusePhase, React.ReactNode> = {
    idle: (
      <>
        {icon ?? <Archive />}
        {label}
      </>
    ),
    armed: (
      <>
        <Undo2 />
        {undoLabel}
      </>
    ),
    settled: (
      <>
        <Check />
        {doneLabel}
      </>
    ),
  };

  return (
    <span className="relative inline-flex">
      <button
        ref={refCallback}
        type="button"
        data-slot="undo-fuse-button"
        data-phase={phase}
        disabled={phase === "settled" || (disabled && phase === "idle")}
        className={cn(
          buttonVariants({ variant: "secondary", size }),
          "relative select-none rounded-full",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          byPointerRef.current = true;
        }}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          machine.hoverStart(event.pointerType);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          if (event.pointerType === "mouse") machine.hoverEnd();
        }}
        {...props}
      >
        <LabelStack phase={phase} blur={!reduced && byPointerRef.current} cells={cells} />
        {phase === "armed" &&
          (fuse === "outline" ? (
            <OutlineFuse remaining={remaining} box={box} />
          ) : (
            <BarFuse remaining={remaining} edge={fuse} />
          ))}
      </button>
      <span className="sr-only" aria-live="polite">
        {machine.message}
      </span>
    </span>
  );
}

UndoFuseButton.displayName = "UndoFuseButton";

export { UndoFuseButton };
