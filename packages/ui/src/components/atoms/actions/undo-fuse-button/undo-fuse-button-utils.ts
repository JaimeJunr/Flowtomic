"use client";

import * as React from "react";

export type UndoFusePhase = "idle" | "armed" | "settled";
export type UndoFuseSettle = "reset" | "stay";
export type UndoFuseCommitReason = "press" | "fuseEnd";

export type FuseEvent =
  | { type: "press" }
  | { type: "undo" }
  | { type: "end"; settle: UndoFuseSettle };

/** Quanto do pavio ainda resta: 1 cheio, 0 queimado, linear e limitado a 0..1. */
export function fuseRemaining(elapsedMs: number, windowMs: number): number {
  if (!(windowMs > 0)) {
    throw new Error(
      `fuseRemaining: received windowMs ${windowMs}, expected a number greater than 0`
    );
  }
  return Math.min(1, Math.max(0, 1 - elapsedMs / windowMs));
}

type PillGeometry = { radius: number; straight: number; outerWidth: number; height: number };

function pillGeometry(width: number, height: number, inset: number): PillGeometry {
  const checks: [string, number][] = [
    ["width", width],
    ["height", height],
    ["inset", inset],
  ];
  for (const [name, value] of checks) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`pill geometry: received ${name} ${value}, expected a finite number >= 0`);
    }
  }
  const h = Math.max(0, height - 2 * inset);
  // Largura menor que a altura vira círculo, em vez de erro.
  const w = Math.max(h, width - 2 * inset);
  return { radius: h / 2, straight: w - h, outerWidth: w, height: h };
}

/** Perímetro do estádio (pílula) com `inset` aplicado: 2 * (w - h) + π * h. */
export function pillPerimeter(width: number, height: number, inset: number): number {
  const { straight, height: h } = pillGeometry(width, height, inset);
  return 2 * straight + Math.PI * h;
}

/** Caminho SVG da pílula: começa no topo central e segue no sentido horário. */
export function pillPath(width: number, height: number, inset: number): string {
  const { radius: r, outerWidth: w, height: h } = pillGeometry(width, height, inset);
  const cx = inset + w / 2;
  const top = inset;
  const rightX = inset + w - r;
  const leftX = inset + r;
  return [
    `M ${cx} ${top}`,
    `H ${rightX}`,
    `A ${r} ${r} 0 0 1 ${rightX} ${top + h}`,
    `H ${leftX}`,
    `A ${r} ${r} 0 0 1 ${leftX} ${top}`,
    `H ${cx}`,
  ].join(" ");
}

/** Transições do botão; evento que não cabe na fase atual devolve a própria fase. */
export function fuseReducer(state: UndoFusePhase, event: FuseEvent): UndoFusePhase {
  if (state === "idle" && event.type === "press") return "armed";
  if (state !== "armed") return state;
  if (event.type === "undo") return "idle";
  if (event.type === "end") return event.settle === "stay" ? "settled" : "idle";
  return state;
}

type MachineOptions = {
  windowMs: number;
  settle: UndoFuseSettle;
  commitOn: UndoFuseCommitReason;
  pauseOnHover: boolean;
  doneLabel: string;
  undoLabel: string;
  undoneAnnouncement: string;
  onCommit?: (reason: UndoFuseCommitReason) => void;
  onUndo?: () => void;
  onFuseEnd?: () => void;
  onPhaseChange?: (phase: UndoFusePhase) => void;
};

/** Máquina do pavio: o tempo decorrido (rAF, só quando não pausado) é a fonte da verdade. */
export function useFuseMachine(options: MachineOptions) {
  const [phase, setPhaseState] = React.useState<UndoFusePhase>("idle");
  const [remaining, setRemaining] = React.useState(1);
  const [message, setMessage] = React.useState("");
  const phaseRef = React.useRef<UndoFusePhase>("idle");
  const frameRef = React.useRef<number | null>(null);
  const pausedRef = React.useRef(false);
  const hoverArmedRef = React.useRef(false);
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  const stopFrames = React.useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  const transition = React.useCallback((event: FuseEvent): boolean => {
    const next = fuseReducer(phaseRef.current, event);
    if (next === phaseRef.current) return false;
    phaseRef.current = next;
    setPhaseState(next);
    optionsRef.current.onPhaseChange?.(next);
    return true;
  }, []);

  const finish = React.useCallback(() => {
    const { settle, commitOn, onFuseEnd, onCommit } = optionsRef.current;
    onFuseEnd?.();
    if (commitOn === "fuseEnd") onCommit?.("fuseEnd");
    setRemaining(0);
    transition({ type: "end", settle });
  }, [transition]);

  const runFuse = React.useCallback(() => {
    stopFrames();
    let elapsed = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last !== null && !pausedRef.current) elapsed += now - last;
      last = now;
      const left = fuseRemaining(elapsed, optionsRef.current.windowMs);
      setRemaining(left);
      if (left <= 0) {
        frameRef.current = null;
        finish();
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [finish, stopFrames]);

  const press = React.useCallback(() => {
    if (!transition({ type: "press" })) return;
    const { commitOn, onCommit, windowMs, doneLabel, undoLabel } = optionsRef.current;
    if (commitOn === "press") onCommit?.("press");
    pausedRef.current = false;
    hoverArmedRef.current = false;
    setRemaining(1);
    setMessage(
      `${doneLabel}. ${undoLabel} disponível por ${Math.round(windowMs / 1000)} segundos.`
    );
    runFuse();
  }, [runFuse, transition]);

  const undo = React.useCallback(() => {
    if (!transition({ type: "undo" })) return;
    stopFrames();
    pausedRef.current = false;
    setRemaining(1);
    setMessage(optionsRef.current.undoneAnnouncement);
    optionsRef.current.onUndo?.();
  }, [stopFrames, transition]);

  const hoverStart = React.useCallback((pointerType: string) => {
    if (pointerType !== "mouse" || !optionsRef.current.pauseOnHover) return;
    // O hover do próprio clique não pausa: só vale depois de o ponteiro sair e voltar.
    if (hoverArmedRef.current) pausedRef.current = true;
  }, []);

  const hoverEnd = React.useCallback(() => {
    hoverArmedRef.current = true;
    pausedRef.current = false;
  }, []);

  React.useEffect(() => stopFrames, [stopFrames]);

  return { phase, remaining, message, press, undo, hoverStart, hoverEnd };
}
