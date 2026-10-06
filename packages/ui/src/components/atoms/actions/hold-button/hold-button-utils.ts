"use client";

import * as React from "react";

export type HoldPhase = "idle" | "holding" | "done";
export type FillDirection = "right" | "up";

const TAP_MAX_MS = 250;
const TAP_HINT_MS = 1500;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** Progresso do segurar: linear, limitado a 0..1; `from` permite retomar de onde o líquido estava. */
export function holdProgress(elapsedMs: number, holdMs: number, from = 0): number {
  if (!(holdMs > 0)) {
    throw new Error(`holdProgress: received holdMs ${holdMs}, expected a number greater than 0`);
  }
  return clamp01(from + elapsedMs / holdMs);
}

/** Progresso do retorno ao soltar: sai de `from` e chega em 0 com ease-out cúbico. */
export function releaseProgress(from: number, elapsedMs: number, releaseMs: number): number {
  if (releaseMs <= 0) return 0;
  const t = clamp01(elapsedMs / releaseMs);
  return from * (1 - t) ** 3;
}

/** Recorte do rótulo de cima: só a parte já coberta pelo líquido fica visível. */
export function fillClipPath(progress: number, direction: FillDirection): string {
  const hidden = `${(1 - clamp01(progress)) * 100}%`;
  return direction === "right" ? `inset(0 ${hidden} 0 0)` : `inset(${hidden} 0 0 0)`;
}

type MachineOptions = {
  disabled: boolean;
  holdMs: number;
  releaseMs: number;
  resetAfterMs: number;
  direction: FillDirection;
  onHoldComplete: () => void;
};

/** Máquina do segurar: rAF para o líquido, timers para reset e dica. Estado espelhado em refs para os handlers. */
export function useHoldMachine(options: MachineOptions) {
  const { disabled, holdMs, releaseMs, resetAfterMs, onHoldComplete } = options;
  const [phase, setPhaseState] = React.useState<HoldPhase>("idle");
  const [progress, setProgressState] = React.useState(0);
  const [tapHintVisible, setTapHintVisible] = React.useState(false);
  const phaseRef = React.useRef<HoldPhase>("idle");
  const progressRef = React.useRef(0);
  const frameRef = React.useRef<number | null>(null);
  const pressedAtRef = React.useRef(0);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const completeRef = React.useRef(onHoldComplete);
  completeRef.current = onHoldComplete;

  const setPhase = React.useCallback((next: HoldPhase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);
  const setProgress = React.useCallback((next: number) => {
    progressRef.current = next;
    setProgressState(next);
  }, []);
  const stopFrames = React.useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);
  const later = React.useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  /** Chama `step(elapsedMs)` a cada quadro, até ele devolver `true`. */
  const runFrames = React.useCallback(
    (step: (elapsedMs: number) => boolean) => {
      stopFrames();
      let startedAt: number | null = null;
      const tick = (now: number) => {
        startedAt ??= now;
        frameRef.current = step(now - startedAt) ? null : requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    },
    [stopFrames]
  );

  const rewind = React.useCallback(() => {
    const from = progressRef.current;
    runFrames((elapsed) => {
      setProgress(releaseProgress(from, elapsed, releaseMs));
      return elapsed >= releaseMs;
    });
  }, [releaseMs, runFrames, setProgress]);

  const complete = React.useCallback(() => {
    setProgress(1);
    setPhase("done");
    completeRef.current();
    if (resetAfterMs > 0) {
      later(() => {
        setPhase("idle");
        rewind();
      }, resetAfterMs);
    }
  }, [later, resetAfterMs, rewind, setPhase, setProgress]);

  const start = React.useCallback(() => {
    if (disabled || phaseRef.current !== "idle") return;
    const from = progressRef.current;
    pressedAtRef.current = Date.now();
    setPhase("holding");
    runFrames((elapsed) => {
      const next = holdProgress(elapsed, holdMs, from);
      setProgress(next);
      if (next < 1) return false;
      complete();
      return true;
    });
  }, [complete, disabled, holdMs, runFrames, setPhase, setProgress]);

  const release = React.useCallback(() => {
    if (phaseRef.current !== "holding") return;
    setPhase("idle");
    if (Date.now() - pressedAtRef.current < TAP_MAX_MS) {
      setTapHintVisible(true);
      later(() => setTapHintVisible(false), TAP_HINT_MS);
    }
    rewind();
  }, [later, rewind, setPhase]);

  React.useEffect(
    () => () => {
      stopFrames();
      for (const timer of timersRef.current) clearTimeout(timer);
    },
    [stopFrames]
  );

  return { phase, progress, tapHintVisible, start, release };
}
