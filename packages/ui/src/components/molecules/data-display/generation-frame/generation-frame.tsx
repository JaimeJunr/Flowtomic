/**
 * GenerationFrame Component - Flowtomic UI
 *
 * Quadro reservado para uma imagem gerada por IA, com proporção fixa desde o
 * início. A mídia interpola desfoque, saturação, opacidade e escala a cada
 * troca de estágio; uma faixa suave cruza o quadro enquanto trabalha e um chip
 * mostra o estágio. Em erro, oferece "Tentar de novo". Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/generation-frame.md
 */

"use client";

import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  assertStageMs,
  DEFAULT_LABELS,
  type GenerationStatus,
  isWorking,
  STAGE_STYLE,
  stageFilter,
} from "./generation-frame-utils";

export type { GenerationStatus } from "./generation-frame-utils";

export type GenerationFrameProps = Omit<React.ComponentProps<"figure">, "children"> & {
  status?: GenerationStatus;
  /** `<img>`, `<video>` ou `<canvas>`; preenche o quadro. */
  children?: React.ReactNode;
  aspectRatio?: string;
  /** Duração da transição entre estágios, em ms. */
  stageMs?: number;
  sweep?: boolean;
  showStatus?: boolean;
  /** Tempo até o chip "Pronta" sumir. 0 mantém o chip. */
  hideAfterMs?: number;
  labels?: Partial<Record<GenerationStatus, string>>;
  retryLabel?: string;
  /** Sem ele, não há pílula de nova tentativa. */
  onRetry?: () => void;
  caption?: React.ReactNode;
};

const SWEEP_SECONDS = 1.6;
const SWEEP_GRADIENT =
  "linear-gradient(115deg, transparent 30%, color-mix(in oklab, var(--background) 35%, transparent) 50%, transparent 70%)";

function Sweep() {
  return (
    <motion.span
      aria-hidden="true"
      data-slot="generation-frame-sweep"
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: SWEEP_GRADIENT }}
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{ duration: SWEEP_SECONDS, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
    />
  );
}

function StatusMark({ status, reduced }: { status: GenerationStatus; reduced: boolean }) {
  if (status === "complete") return <Check aria-hidden="true" className="size-3 text-success" />;
  if (status === "error") return <X aria-hidden="true" className="size-3 text-destructive" />;
  return (
    <span
      aria-hidden="true"
      className={cn("size-1.5 rounded-full bg-primary", !reduced && "animate-pulse")}
    />
  );
}

type StatusChipProps = { status: GenerationStatus; label: string; reduced: boolean };

function StatusChip({ status, label, reduced }: StatusChipProps) {
  return (
    <output
      data-slot="generation-frame-status"
      className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-foreground text-xs backdrop-blur"
    >
      <StatusMark status={status} reduced={reduced} />
      <motion.span
        key={status}
        initial={{ opacity: reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.span>
    </output>
  );
}

/** O chip de "Pronta" some sozinho depois de `hideAfterMs`; qualquer outro estágio o traz de volta. */
function useChipVisible(status: GenerationStatus, hideAfterMs: number): boolean {
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    setHidden(false);
    if (status !== "complete" || hideAfterMs <= 0) return;
    const timer = setTimeout(() => setHidden(true), hideAfterMs);
    return () => clearTimeout(timer);
  }, [status, hideAfterMs]);
  return !hidden;
}

/** Quadro de imagem em geração, com proporção reservada e tratamento visual por estágio. */
function GenerationFrame({
  ref,
  className,
  style,
  status = "generating",
  children,
  aspectRatio = "4 / 3",
  stageMs = 400,
  sweep = true,
  showStatus = true,
  hideAfterMs = 1200,
  labels,
  retryLabel = "Tentar de novo",
  onRetry,
  caption,
  ...props
}: GenerationFrameProps) {
  assertStageMs(stageMs);
  const reduced = useShouldReduceMotion();
  const chipVisible = useChipVisible(status, hideAfterMs);
  const working = isWorking(status);
  const stage = STAGE_STYLE[status];
  const label = labels?.[status] ?? DEFAULT_LABELS[status];

  return (
    <figure
      ref={ref}
      data-slot="generation-frame"
      data-status={status}
      aria-busy={working}
      className={cn("relative m-0 overflow-hidden rounded-lg bg-muted", className)}
      style={{ ...style, aspectRatio }}
      {...props}
    >
      <motion.div
        data-slot="generation-frame-media"
        className="absolute inset-0 [&>*]:absolute [&>*]:inset-0 [&>*]:size-full [&>*]:object-cover"
        initial={false}
        animate={{ filter: stageFilter(status), opacity: stage.opacity, scale: stage.scale }}
        transition={{ duration: reduced ? 0 : stageMs / 1000, ease: "easeOut" }}
      >
        {children}
      </motion.div>
      {sweep && working && !reduced && <Sweep />}
      {showStatus && chipVisible && <StatusChip status={status} label={label} reduced={reduced} />}
      {status === "error" && onRetry && (
        <button
          type="button"
          data-slot="generation-frame-retry"
          onClick={onRetry}
          className="absolute right-2 bottom-2 rounded-full bg-foreground px-3 py-1 text-background text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {retryLabel}
        </button>
      )}
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-background/80 px-3 py-2 text-foreground text-xs backdrop-blur">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

GenerationFrame.displayName = "GenerationFrame";

export { GenerationFrame };
