/**
 * GridLoader Component - Flowtomic UI
 *
 * Indicador de "pensando" para IA: grade minúscula de pontos que acendem em
 * onda seguindo um padrão, ao lado do verbo e de um cronômetro. Ao terminar,
 * a onda congela e os pontos se reorganizam num check (sucesso) ou num X (falha).
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/grid-loader.md
 */

"use client";

import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  CHECK_MASK,
  CROSS_MASK,
  type CustomPattern,
  formatElapsed,
  formatSeconds,
  type GridLoaderPattern,
  type GridSize,
  type PatternDefinition,
  REDUCED_CENTER,
  resolvePattern,
} from "./grid-loader-utils";

export type GridLoaderStatus = "working" | "done" | "error";

export type GridLoaderProps = Omit<React.ComponentProps<"div">, "children"> & {
  status?: GridLoaderStatus;
  label?: string;
  doneLabel?: string;
  errorLabel?: string;
  pattern?: GridLoaderPattern | CustomPattern;
  grid?: GridSize;
  shape?: "round" | "square";
  size?: "sm" | "default" | "lg";
  /** Duração de um passo da onda, em ms. */
  stepMs?: number;
  /** Opacidade das células apagadas (a silhueta sempre visível). */
  idleOpacity?: number;
  showTimer?: boolean;
  /** Segundos controlados; quando passado, o relógio interno não roda. */
  elapsed?: number;
};

const KEYFRAMES_NAME = "flowtomic-grid-loader-wave";
const KEYFRAMES_CSS = `@keyframes ${KEYFRAMES_NAME}{0%,100%{opacity:var(--grid-loader-idle)}18%{opacity:1}42%{opacity:var(--grid-loader-idle)}}`;
const TICK_MS = 100;
const REDUCED_LIT_OPACITY = 0.5;

const CELL_SIZE: Record<NonNullable<GridLoaderProps["size"]>, string> = {
  sm: "size-1",
  default: "size-1.5",
  lg: "size-2",
};
const GAP_SIZE: Record<NonNullable<GridLoaderProps["size"]>, string> = {
  sm: "gap-0.5",
  default: "gap-0.5",
  lg: "gap-1",
};
const TEXT_SIZE: Record<NonNullable<GridLoaderProps["size"]>, string> = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
};
const GRID_COLS: Record<GridSize, string> = { 3: "grid-cols-3", 4: "grid-cols-4" };

/** Segundos desde a montagem (ou desde a última volta a "working"); congela ao terminar. */
function useElapsedSeconds(status: GridLoaderStatus, controlled: number | undefined): number {
  const [seconds, setSeconds] = React.useState(0);
  React.useEffect(() => {
    if (controlled !== undefined || status !== "working") return;
    const start = Date.now();
    setSeconds(0);
    const id = setInterval(() => setSeconds((Date.now() - start) / 1000), TICK_MS);
    return () => clearInterval(id);
  }, [status, controlled]);
  return controlled ?? seconds;
}

type CellStyleInput = {
  index: number;
  status: GridLoaderStatus;
  reduced: boolean;
  definition: PatternDefinition;
  stepMs: number;
  idleOpacity: number;
  grid: GridSize;
};

function isLit({
  index,
  status,
  grid,
}: Pick<CellStyleInput, "index" | "status" | "grid">): boolean {
  if (status === "working") return false;
  const mask = status === "done" ? CHECK_MASK[grid] : CROSS_MASK[grid];
  return mask[index] === 1;
}

function cellStyle(input: CellStyleInput): React.CSSProperties {
  const { index, status, reduced, definition, stepMs, idleOpacity, grid } = input;
  if (status !== "working") return { opacity: isLit(input) ? 1 : idleOpacity };
  if (reduced) {
    return { opacity: REDUCED_CENTER[grid].includes(index) ? REDUCED_LIT_OPACITY : idleOpacity };
  }
  const delay = definition.delays[index];
  if (delay === null || delay === undefined) return { opacity: idleOpacity };
  return {
    opacity: idleOpacity,
    animationName: KEYFRAMES_NAME,
    animationDuration: `${definition.loop * stepMs}ms`,
    animationDelay: `${delay * stepMs}ms`,
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",
  };
}

function statusText(
  status: GridLoaderStatus,
  texts: { label: string; doneLabel: string; errorLabel: string }
): string {
  if (status === "done") return texts.doneLabel;
  return status === "error" ? texts.errorLabel : texts.label;
}

function announcement(
  status: GridLoaderStatus,
  texts: { label: string; doneLabel: string; errorLabel: string },
  seconds: number,
  showTimer: boolean
): string {
  if (status === "working") return `${texts.label}, em andamento`;
  const base = statusText(status, texts);
  return showTimer ? `${base} ${formatSeconds(seconds)} segundos` : base;
}

/** Indicador de progresso de IA: grade de pontos em onda que vira check ou X. */
function GridLoader({
  ref,
  className,
  status = "working",
  label = "Pensando",
  doneLabel = "Pronto em",
  errorLabel = "Falhou após",
  pattern = "orbit",
  grid = 3,
  shape = "round",
  size = "default",
  stepMs = 90,
  idleOpacity = 0.15,
  showTimer = true,
  elapsed,
  style,
  ...props
}: GridLoaderProps) {
  const reduced = useShouldReduceMotion();
  const seconds = useElapsedSeconds(status, elapsed);
  const definition = resolvePattern(pattern, grid);
  const texts = { label, doneLabel, errorLabel };
  const finished = status !== "working";
  const cells = Array.from({ length: grid * grid }, (_, index) => index);

  return (
    // biome-ignore lint/a11y/useSemanticElements: a API tipa a raiz como div (ComponentProps<"div">)
    <div
      ref={ref}
      data-slot="grid-loader"
      data-status={status}
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-2", TEXT_SIZE[size], className)}
      style={style}
      {...props}
    >
      <style>{KEYFRAMES_CSS}</style>
      <span
        data-slot="grid-loader-grid"
        aria-hidden="true"
        className={cn(
          "grid shrink-0",
          GRID_COLS[grid],
          GAP_SIZE[size],
          status === "done" && "text-success",
          status === "error" && "text-destructive"
        )}
        style={{ "--grid-loader-idle": idleOpacity } as React.CSSProperties}
      >
        {cells.map((index) => (
          <span
            key={index}
            data-slot="grid-loader-cell"
            data-on={finished ? String(isLit({ index, status, grid })) : undefined}
            className={cn(
              "bg-current",
              CELL_SIZE[size],
              shape === "round" && "rounded-full",
              reduced ? "transition-none" : "transition-opacity duration-300"
            )}
            style={cellStyle({ index, status, reduced, definition, stepMs, idleOpacity, grid })}
          />
        ))}
      </span>
      <span aria-hidden="true" className="inline-flex items-baseline gap-1 text-foreground">
        <span>{statusText(status, texts)}</span>
        {showTimer && (
          <span
            data-slot="grid-loader-timer"
            aria-hidden="true"
            className="font-mono text-muted-foreground tabular-nums"
          >
            {formatElapsed(seconds)}
          </span>
        )}
      </span>
      <span className="sr-only">{announcement(status, texts, seconds, showTimer)}</span>
    </div>
  );
}

GridLoader.displayName = "GridLoader";

export { GridLoader };
