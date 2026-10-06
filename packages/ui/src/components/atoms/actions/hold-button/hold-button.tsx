/**
 * HoldButton Component - Flowtomic UI
 *
 * Botão de ação irreversível que só executa se a pessoa segurar: um líquido
 * enche o botão enquanto segura, o texto troca de cor na borda do líquido e,
 * ao completar, o rótulo vira o de "feito". Um clique rápido só mostra a dica.
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/hold-button.md
 */

"use client";

import { type HTMLMotionProps, motion } from "motion/react";
import type * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../button/button";
import {
  type FillDirection,
  fillClipPath,
  type HoldPhase,
  useHoldMachine,
} from "./hold-button-utils";

export { fillClipPath, holdProgress, releaseProgress } from "./hold-button-utils";

type HoldButtonTone = "destructive" | "primary";

// Props de arrasto e animação do HTML colidem com as do motion.button.
type NativeButtonProps = Omit<
  React.ComponentProps<"button">,
  | "children"
  | "onClick"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "style"
>;

export type HoldButtonProps = NativeButtonProps & {
  /** Rótulo em repouso e durante o segurar. */
  children: React.ReactNode;
  /** Rótulo depois de completar. */
  doneLabel: React.ReactNode;
  icon?: React.ReactNode;
  doneIcon?: React.ReactNode;
  /** Cor do líquido: "destructive" para exclusão, "primary" para confirmações comuns. */
  tone?: HoldButtonTone;
  size?: "sm" | "default" | "lg";
  fillDirection?: FillDirection;
  /** Tempo de segurar, em ms. */
  holdMs?: number;
  /** Tempo de o líquido voltar ao soltar antes, em ms. */
  releaseMs?: number;
  wave?: boolean;
  /** Tempo no estado "feito" antes de voltar. 0 = fica feito. */
  resetAfterMs?: number;
  /** Chamado uma vez, no quadro em que o líquido completa. */
  onHoldComplete: () => void;
  /** Texto da dica num clique rápido. */
  tapHint?: string;
};

const TONE_CLASSES: Record<HoldButtonTone, { fill: string; label: string; wave: string }> = {
  destructive: {
    fill: "bg-destructive",
    label: "text-destructive-foreground",
    wave: "fill-destructive",
  },
  primary: { fill: "bg-primary", label: "text-primary-foreground", wave: "fill-primary" },
};

const WAVE_THICKNESS_PX = 10;
const WAVE_CYCLE_PX = 24;
const WAVE_PATH = "M0 0 Q10 6 0 12 T0 24 T0 36 T0 48 L10 48 L10 0 Z";
const ANNOUNCE_STEP = 25;
const LABEL_SWAP_MS = 0.2;

function SwapLabel({
  done,
  children,
  reduced,
}: {
  done: boolean;
  children: React.ReactNode;
  reduced: boolean;
}) {
  const hidden = reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)" };
  const shown = reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" };
  return (
    <motion.span
      key={done ? "done" : "rest"}
      className="inline-flex items-center gap-2"
      initial={hidden}
      animate={shown}
      transition={{ duration: LABEL_SWAP_MS }}
    >
      {children}
    </motion.span>
  );
}

/** Ondulação na borda que avança: path senoidal na cor do líquido, rolando ao longo da borda. */
function WaveEdge({
  progress,
  direction,
  tone,
}: {
  progress: number;
  direction: FillDirection;
  tone: HoldButtonTone;
}) {
  const horizontal = direction === "right";
  const edge = `${progress * 100}%`;
  return (
    <span
      aria-hidden="true"
      data-slot="hold-button-wave"
      className="pointer-events-none absolute overflow-hidden"
      style={
        horizontal
          ? { top: 0, bottom: 0, left: edge, width: WAVE_THICKNESS_PX }
          : { left: 0, right: 0, bottom: edge, height: WAVE_THICKNESS_PX }
      }
    >
      <motion.svg
        width={WAVE_THICKNESS_PX}
        height="200%"
        viewBox="0 0 10 48"
        preserveAspectRatio="none"
        className={cn(
          "absolute",
          TONE_CLASSES[tone].wave,
          !horizontal && "origin-top-left rotate-90"
        )}
        style={horizontal ? undefined : { left: "100%", top: 0 }}
        animate={{ y: [0, -WAVE_CYCLE_PX] }}
        transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <path d={WAVE_PATH} />
      </motion.svg>
    </span>
  );
}

function pressScale(phase: HoldPhase, reduced: boolean): number | number[] {
  if (reduced) return 1;
  if (phase === "holding") return 0.97;
  return phase === "done" ? [1, 1.03, 1] : 1;
}

function announcement(
  phase: HoldPhase,
  progress: number,
  doneLabel: React.ReactNode
): React.ReactNode {
  if (phase === "done") return doneLabel;
  const step = Math.floor((progress * 100) / ANNOUNCE_STEP) * ANNOUNCE_STEP;
  return phase === "holding" && step > 0 ? `segurando… ${step}%` : "";
}

/** Botão que exige segurar para confirmar uma ação irreversível, sem modal. */
function HoldButton({
  ref,
  className,
  children,
  doneLabel,
  icon,
  doneIcon,
  tone = "destructive",
  size = "default",
  fillDirection = "right",
  holdMs = 1500,
  releaseMs = 200,
  wave = true,
  resetAfterMs = 1600,
  onHoldComplete,
  tapHint = "Segure para confirmar",
  disabled = false,
  onKeyDown,
  onKeyUp,
  ...props
}: HoldButtonProps) {
  const reduced = useShouldReduceMotion();
  const machine = useHoldMachine({
    disabled,
    holdMs,
    releaseMs,
    resetAfterMs,
    direction: fillDirection,
    onHoldComplete,
  });
  const { phase, progress } = machine;
  const done = phase === "done";
  const tones = TONE_CLASSES[tone];
  const content = (
    <SwapLabel done={done} reduced={reduced}>
      {done ? doneIcon : icon}
      {done ? doneLabel : children}
    </SwapLabel>
  );
  const showWave = wave && !reduced && progress > 0 && progress < 1;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    if (!event.repeat) machine.start();
  };
  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyUp?.(event);
    if (event.key === " " || event.key === "Enter") machine.release();
  };

  return (
    <span className="relative inline-flex">
      <motion.button
        ref={ref}
        type="button"
        data-slot="hold-button"
        data-state={phase}
        aria-busy={phase === "holding"}
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: "secondary", size }),
          "relative touch-none select-none overflow-hidden",
          className
        )}
        animate={{ scale: pressScale(phase, reduced) }}
        transition={{ duration: phase === "done" ? 0.3 : 0.15 }}
        onPointerDown={(event) => event.button === 0 && machine.start()}
        onPointerUp={machine.release}
        onPointerCancel={machine.release}
        onPointerLeave={machine.release}
        onBlur={machine.release}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        {...(props as HTMLMotionProps<"button">)}
      >
        <span
          aria-hidden="true"
          data-slot="hold-button-fill"
          className={cn(
            "pointer-events-none absolute inset-0",
            tones.fill,
            fillDirection === "right" ? "origin-left" : "origin-bottom"
          )}
          style={{
            transform: fillDirection === "right" ? `scaleX(${progress})` : `scaleY(${progress})`,
          }}
        />
        {showWave && <WaveEdge progress={progress} direction={fillDirection} tone={tone} />}
        <span className="relative inline-flex items-center gap-2">{content}</span>
        <span
          aria-hidden="true"
          data-slot="hold-button-fill-label"
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center gap-2",
            tones.label
          )}
          style={{ clipPath: fillClipPath(progress, fillDirection) }}
        >
          {content}
        </span>
      </motion.button>
      <span className="sr-only" aria-live="polite">
        {announcement(phase, progress, doneLabel)}
      </span>
      {machine.tapHintVisible && (
        <output className="pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground">
          {tapHint}
        </output>
      )}
    </span>
  );
}

HoldButton.displayName = "HoldButton";

export { HoldButton };
