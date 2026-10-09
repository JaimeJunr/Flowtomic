/**
 * DictationButton Component - Flowtomic UI
 *
 * Botão redondo de microfone que abre numa cápsula para a esquerda enquanto dita:
 * relógio, forma de onda rolando com o nível do som e um quadrado de parar. Toque
 * rápido trava gravando; segurar grava só enquanto segura; deslizar para a esquerda
 * cancela. Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/dictation-button.md
 */

"use client";

import { Mic } from "lucide-react";
import { motion } from "motion/react";
import type * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  BAR_COUNT,
  type DictationMode,
  type DictationStopReason,
  formatClock,
  type LevelSourceFactory,
  type LevelSourceKind,
  scatterOffset,
  useDictationSession,
} from "./dictation-button-utils";

export type { DictationStopReason } from "./dictation-button-utils";

type DictationSize = "sm" | "default" | "lg";

export type DictationButtonProps = Omit<React.ComponentProps<"button">, "onClick"> & {
  size?: DictationSize;
  shape?: "pill" | "rounded";
  showTime?: boolean;
  waveform?: boolean;
  slideToCancel?: boolean;
  /** Distância (px) de arrasto para a esquerda que cancela. */
  cancelDistance?: number;
  /** auto: toque trava, segurar para ao soltar. hold: soltar sempre para. toggle: soltar nunca para. */
  mode?: DictationMode;
  holdAfterMs?: number;
  /** Fonte do nível: simulado (demo) ou o microfone de verdade. */
  source?: LevelSourceKind;
  /** Substitui a fonte padrão — para teste e para quem já tem um stream. */
  levelSource?: LevelSourceFactory;
  onStart?: (detail: { source: LevelSourceKind }) => void;
  onStop?: (detail: { reason: DictationStopReason; durationMs: number }) => void;
};

const SIZE_PX: Record<DictationSize, number> = { sm: 28, default: 36, lg: 44 };
const EXPANDED_EXTRA_PX = 150;
const BAR_WIDTH_PX = 2;
const BAR_MIN_PERCENT = 10;

const barHeight = (level: number): string => `${Math.max(BAR_MIN_PERCENT, level * 100)}%`;

function Wave({ bars, level, reduced, height }: WaveProps) {
  const style = { height, gap: BAR_WIDTH_PX };
  if (reduced) {
    return (
      <span
        aria-hidden="true"
        data-slot="dictation-button-wave"
        className="flex items-center overflow-hidden rounded-full bg-muted"
        style={{ width: BAR_COUNT * BAR_WIDTH_PX * 2, height: BAR_WIDTH_PX * 2 }}
      >
        <span
          className="h-full bg-primary"
          style={{ width: `${Math.max(BAR_MIN_PERCENT, level * 100)}%` }}
        />
      </span>
    );
  }
  const padded = [...Array<number>(Math.max(0, BAR_COUNT - bars.length)).fill(0), ...bars];
  return (
    <span
      aria-hidden="true"
      data-slot="dictation-button-wave"
      className="flex items-center"
      style={style}
    >
      {padded.map((value, slot) => (
        <span
          // O histórico rola: a posição na janela é a identidade da barra.
          // biome-ignore lint/suspicious/noArrayIndexKey: janela de tamanho fixo
          key={slot}
          className="rounded-full bg-primary"
          style={{ width: BAR_WIDTH_PX, height: barHeight(value) }}
        />
      ))}
    </span>
  );
}

type WaveProps = { bars: number[]; level: number; reduced: boolean; height: number };

function Scatter({ bars, height, offset }: { bars: number[]; height: number; offset: number }) {
  return (
    <span
      aria-hidden="true"
      data-slot="dictation-button-scatter"
      className="pointer-events-none absolute top-0 flex items-center"
      style={{ right: offset, height, gap: BAR_WIDTH_PX }}
    >
      {bars.map((value, slot) => (
        <motion.span
          // biome-ignore lint/suspicious/noArrayIndexKey: janela de tamanho fixo
          key={slot}
          className="rounded-full bg-primary"
          style={{ width: BAR_WIDTH_PX, height: barHeight(value) }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: scatterOffset(slot) }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

/** Botão de ditado por voz: microfone que vira cápsula com relógio e forma de onda. */
function DictationButton({
  ref,
  className,
  size = "default",
  shape = "pill",
  showTime = true,
  waveform = true,
  slideToCancel = true,
  cancelDistance = 64,
  mode = "auto",
  holdAfterMs = 300,
  source = "simulated",
  levelSource,
  onStart,
  onStop,
  disabled = false,
  "aria-label": ariaLabel = "Ditar",
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: DictationButtonProps) {
  const reduced = useShouldReduceMotion();
  const session = useDictationSession({
    disabled,
    reduced,
    mode,
    holdAfterMs,
    source,
    levelSource,
    slideToCancel,
    cancelDistance,
    onStart,
    onStop,
  });
  const { listening, dragX } = session;
  const px = SIZE_PX[size];
  const waveHeight = Math.round(px * 0.55);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(event);
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    session.pressStart(event.clientX);
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerMove?.(event);
    session.pressMove(event.clientX);
  };
  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerUp?.(event);
    session.pressEnd();
  };
  const handlePointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerCancel?.(event);
    session.pressEnd();
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.key === "Escape") return session.stop("escape");
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (!event.repeat) session.toggleByKey();
  };
  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyUp?.(event);
    // Sem isso o Espaço dispararia um clique nativo ao soltar.
    if (event.key === "Enter" || event.key === " ") event.preventDefault();
  };
  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    onBlur?.(event);
    session.blur();
  };

  return (
    <span className="relative inline-flex shrink-0 justify-end" style={{ width: px, height: px }}>
      <button
        ref={ref}
        type="button"
        data-slot="dictation-button"
        data-state={listening ? "listening" : "idle"}
        aria-pressed={listening}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(
          "absolute top-0 right-0 flex touch-none select-none items-center justify-end overflow-hidden bg-secondary text-muted-foreground outline-none transition-[width,background-color,transform] duration-300 ease-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:pointer-events-none disabled:opacity-50",
          shape === "pill" ? "rounded-full" : "rounded-xl",
          reduced && "transition-none",
          className
        )}
        style={{ height: px, width: listening ? px + EXPANDED_EXTRA_PX : px }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={handleBlur}
        {...props}
      >
        {listening && (
          <span
            className="flex min-w-0 items-center gap-2 pr-1"
            style={{ transform: `translateX(${dragX}px)` }}
          >
            {showTime && (
              <span
                data-slot="dictation-button-clock"
                className="font-mono text-xs tabular-nums text-foreground"
              >
                {formatClock(session.elapsedMs)}
              </span>
            )}
            {waveform && (
              <Wave
                bars={session.bars}
                level={session.level}
                reduced={reduced}
                height={waveHeight}
              />
            )}
          </span>
        )}
        {listening && dragX < 0 && (
          <span
            data-slot="dictation-button-cancel"
            className="whitespace-nowrap pr-1 text-xs text-muted-foreground"
            style={{ opacity: Math.min(1, (-dragX / cancelDistance) * 1.5) }}
          >
            Cancelar
          </span>
        )}
        <span
          className="flex shrink-0 items-center justify-center"
          style={{ width: px, height: px }}
        >
          {listening ? (
            <span
              aria-hidden="true"
              className="rounded-[3px] bg-primary"
              style={{ width: px * 0.36, height: px * 0.36 }}
            />
          ) : (
            <Mic aria-hidden="true" size={Math.round(px * 0.45)} />
          )}
        </span>
      </button>
      {session.scatter && <Scatter bars={session.scatter} height={waveHeight} offset={px + 8} />}
    </span>
  );
}

DictationButton.displayName = "DictationButton";

export { DictationButton };
