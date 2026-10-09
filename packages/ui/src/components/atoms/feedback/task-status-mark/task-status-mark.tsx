/**
 * TaskStatusMark Component - Flowtomic UI
 *
 * Ícone de estado de tarefa que muda de forma no lugar: anel tracejado
 * (pendente), arco que gira ou cresce (rodando), anel fechado com ✓ e rótulo
 * riscado (feito), ✕ (falhou) e ✕ fino (cancelado). Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/task-status-mark.md
 */

"use client";

import { motion } from "motion/react";
import type * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  type MarkShape,
  markShape,
  ringDasharray,
  statusText,
  type TaskStatus,
} from "./task-status-mark-utils";

export type { TaskStatus } from "./task-status-mark-utils";

type Size = "sm" | "default" | "lg";

export type TaskStatusMarkProps = Omit<React.ComponentProps<"span">, "children"> & {
  status?: TaskStatus;
  /** 0..1 enquanto roda; ausente = indeterminado. */
  progress?: number;
  label?: React.ReactNode;
  size?: Size;
  dashes?: number;
  spinMs?: number;
  /** Fração do anel ocupada pelo arco indeterminado. */
  arcLength?: number;
  drawMs?: number;
  strike?: boolean;
  strikeDelayMs?: number;
};

const SIZE_CLASSES: Record<Size, { icon: string; text: string }> = {
  sm: { icon: "size-4", text: "text-xs" },
  default: { icon: "size-5", text: "text-sm" },
  lg: { icon: "size-6", text: "text-base" },
};

const CHECK_PATH = "M7.5 12.5l3 3L16.5 9";
const CROSS_PATH = "M8.5 8.5l7 7M15.5 8.5l-7 7";
const RING_RADIUS = 9;
const WASH_OPACITY = 0.08;
const MS = 1000;

type MarkProps = { shape: MarkShape; cancelled: boolean; draw: number; reduced: boolean };

/** pathLength=1 como atributo e dashoffset 1→0: o traço é "desenhado" sem medir o path. */
function Glyph({ shape, cancelled, draw, reduced }: MarkProps) {
  const isCheck = shape === "check";
  return (
    <motion.path
      key={shape}
      d={isCheck ? CHECK_PATH : CROSS_PATH}
      pathLength={1}
      fill="none"
      strokeWidth={cancelled ? 1.5 : 2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="1"
      initial={{ strokeDashoffset: reduced ? 0 : 1 }}
      animate={{ strokeDashoffset: 0 }}
      transition={{ duration: reduced ? 0 : draw, delay: reduced || cancelled ? 0 : draw * 0.4 }}
    />
  );
}

function Strike({ delay, reduced }: { delay: number; reduced: boolean }) {
  return (
    <motion.span
      aria-hidden="true"
      data-slot="task-status-mark-strike"
      className="pointer-events-none absolute inset-x-0 top-1/2 h-px origin-left bg-current"
      initial={{ scaleX: reduced ? 1 : 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : delay }}
    />
  );
}

/** Marca de estado de uma tarefa, com rótulo opcional que risca ao concluir. */
function TaskStatusMark({
  ref,
  className,
  status = "pending",
  progress,
  label,
  size = "default",
  dashes = 8,
  spinMs = 1100,
  arcLength = 0.68,
  drawMs = 240,
  strike = true,
  strikeDelayMs = 60,
  ...props
}: TaskStatusMarkProps) {
  const reduced = useShouldReduceMotion();
  const sizes = SIZE_CLASSES[size];
  const shape = markShape(status, progress);
  const spinning = shape === "spinner" && !reduced;
  const draw = drawMs / MS;
  const done = status === "done";
  const cancelled = status === "cancelled";
  const dimmed = done || cancelled;
  const dasharray = ringDasharray(shape, { dashes, progress, arcLength });

  return (
    <span
      ref={ref}
      data-slot="task-status-mark"
      data-status={status}
      className={cn("inline-flex items-center gap-2", sizes.text, className)}
      {...props}
    >
      <svg
        aria-hidden="true"
        data-slot="task-status-mark-icon"
        data-shape={shape}
        data-spinning={spinning}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={cn(
          "shrink-0",
          sizes.icon,
          done && "text-success",
          status === "failed" && "text-destructive"
        )}
      >
        <g transform="rotate(-90 12 12)">
          <motion.g
            style={{ originX: "12px", originY: "12px" }}
            animate={{ rotate: spinning ? 360 : 0 }}
            transition={
              spinning
                ? { duration: spinMs / MS, ease: "linear", repeat: Number.POSITIVE_INFINITY }
                : { duration: 0 }
            }
          >
            <motion.circle
              cx={12}
              cy={12}
              r={RING_RADIUS}
              pathLength={100}
              strokeWidth={2}
              strokeLinecap="round"
              initial={false}
              animate={{
                strokeDasharray: dasharray,
                strokeOpacity: cancelled ? 0 : 1,
                fillOpacity: done ? WASH_OPACITY : 0,
              }}
              fill="currentColor"
              transition={{ duration: reduced ? 0 : 0.3 }}
            />
          </motion.g>
        </g>
        {(shape === "check" || shape === "cross") && (
          <Glyph shape={shape} cancelled={cancelled} draw={draw} reduced={reduced} />
        )}
      </svg>
      {label !== undefined && (
        <span
          data-slot="task-status-mark-label"
          className={cn("relative inline-block", dimmed && "opacity-60")}
        >
          {label}
          {done && strike && <Strike delay={draw + strikeDelayMs / MS} reduced={reduced} />}
        </span>
      )}
      <span className="sr-only">{statusText(status, progress)}</span>
    </span>
  );
}

TaskStatusMark.displayName = "TaskStatusMark";

export { TaskStatusMark };
