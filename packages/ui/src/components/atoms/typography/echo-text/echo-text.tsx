/**
 * EchoText Component - Flowtomic UI
 *
 * Texto nítido com ecos fantasmas atrás, cada um mais transparente e borrado. Na entrada os
 * ecos chegam espalhados de um lado e se juntam atrás do texto; com o ponteiro perto, os ecos
 * fogem dele e os mais fundos demoram mais a acompanhar. O loop só roda enquanto há movimento
 * e com a área visível. Com movimento reduzido sobra só o texto da frente.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/echo-text.md
 */

"use client";

import { useInView } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type EchoDirection = "right" | "left" | "up" | "down" | "diagonal";
type EchoMode = "entrance" | "pointer" | "both";

type EchoTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Máx. 24. */
  echoes?: number;
  /** 0..1: quão devagar os ecos fundos perseguem o alvo. */
  lag?: number;
  /** Deslocamento máximo, em px (entrada e ponteiro). */
  offsetPx?: number;
  direction?: EchoDirection;
  /** Multiplicador de opacidade de um eco para o próximo. */
  fade?: number;
  /** Desfoque máximo do eco mais fundo, em px. */
  blurPx?: number;
  /** Cor dos ecos; false = mesma cor do texto. */
  tint?: string | false;
  mode?: EchoMode;
  /** Distância em que o ponteiro puxa o deslocamento máximo. */
  pointerRadiusPx?: number;
  /** Duração da entrada, em ms. */
  durationMs?: number;
};

type Vector = { x: number; y: number };

const MAX_ECHOES = 24;
const SETTLE_EPSILON = 0.01;
const ZERO: Vector = { x: 0, y: 0 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const toTransform = ({ x, y }: Vector) => `translate3d(${x}px, ${y}px, 0)`;

function clampEchoes(echoes: number): number {
  return clamp(Math.round(echoes), 0, MAX_ECHOES);
}

/** Estilo do eco `index` (1..echoes): opacidade, desfoque e cor. */
function echoStyle(
  index: number,
  echoes: number,
  options: { fade: number; blurPx: number; tint: string | false }
): { opacity: number; filter: string; color: string } {
  return {
    opacity: options.fade ** index,
    filter: `blur(${(options.blurPx * index) / echoes}px)`,
    color: options.tint === false ? "currentColor" : options.tint,
  };
}

function initialVector(direction: EchoDirection, magnitude: number): Vector {
  switch (direction) {
    case "right":
      return { x: magnitude, y: 0 };
    case "left":
      return { x: -magnitude, y: 0 };
    case "up":
      return { x: 0, y: -magnitude };
    case "down":
      return { x: 0, y: magnitude };
    case "diagonal":
      return { x: magnitude * Math.SQRT1_2, y: magnitude * Math.SQRT1_2 };
  }
}

/** `pointer` é a posição do ponteiro relativa ao centro; o alvo empurra para o lado oposto. */
function pointerTarget(pointer: Vector, radiusPx: number, offsetPx: number): Vector {
  const distance = Math.hypot(pointer.x, pointer.y);
  if (distance === 0 || radiusPx <= 0) return ZERO;
  const strength = Math.min(1, distance / radiusPx) * offsetPx;
  return { x: 0 - (pointer.x / distance) * strength, y: 0 - (pointer.y / distance) * strength };
}

/** Eco 0 persegue o alvo; cada eco seguinte persegue o anterior, já atualizado no quadro. */
function chainStep(positions: Vector[], target: Vector, lag: number): Vector[] {
  const factor = 1 - lag;
  const next: Vector[] = [];
  let leader = target;
  for (const position of positions) {
    const updated = {
      x: position.x + (leader.x - position.x) * factor,
      y: position.y + (leader.y - position.y) * factor,
    };
    next.push(updated);
    leader = updated;
  }
  return next;
}

function entranceProgress(input: {
  elapsedMs: number;
  index: number;
  echoes: number;
  lag: number;
  durationMs: number;
}): number {
  const { elapsedMs, index, echoes, lag, durationMs } = input;
  if (durationMs <= 0) return 1;
  const delay = lag * durationMs * (index / echoes);
  const linear = clamp((elapsedMs - delay) / durationMs, 0, 1);
  return 1 - (1 - linear) ** 3;
}

function EchoText({
  text,
  echoes = 10,
  lag = 0.24,
  offsetPx = 32,
  direction = "right",
  fade = 0.72,
  blurPx = 3,
  tint = "var(--primary)",
  mode = "both",
  pointerRadiusPx = 320,
  durationMs = 900,
  className,
  ref,
  ...props
}: EchoTextProps) {
  if (text.trim().length === 0) {
    throw new Error(
      `EchoText: invalid text, received ${JSON.stringify(text)}, expected text: string não vazio`
    );
  }

  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  const echoRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const entranceStart = React.useRef<number | null>(null);
  const isInView = useInView(rootRef);
  const reduceMotion = useShouldReduceMotion();
  const count = reduceMotion ? 0 : clampEchoes(echoes);
  const withEntrance = mode !== "pointer";
  const withPointer = mode !== "entrance";

  React.useEffect(() => {
    const root = rootRef.current;
    if (count === 0 || !isInView || !root) return;
    let chain: Vector[] = Array.from({ length: count }, () => ZERO);
    let target: Vector = ZERO;
    let frame = 0;
    let running = false;

    const tick = (now: number) => {
      if (entranceStart.current === null) entranceStart.current = now;
      const elapsedMs = now - entranceStart.current;
      chain = chainStep(chain, target, lag);
      let entering = false;
      let chasing = false;
      for (let i = 0; i < count; i++) {
        const index = i + 1;
        const progress = withEntrance
          ? entranceProgress({ elapsedMs, index, echoes: count, lag, durationMs })
          : 1;
        if (progress < 1) entering = true;
        if (Math.hypot(chain[i].x - target.x, chain[i].y - target.y) > SETTLE_EPSILON) {
          chasing = true;
        }
        const start = initialVector(direction, offsetPx * (index / count));
        const el = echoRefs.current[i];
        if (el) {
          el.style.transform = toTransform({
            x: chain[i].x + start.x * (1 - progress),
            y: chain[i].y + start.y * (1 - progress),
          });
        }
      }
      if (entering || chasing) {
        frame = requestAnimationFrame(tick);
      } else {
        chain = chain.map(() => target);
        running = false;
      }
    };
    const ensureRunning = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: Event) => {
      const { clientX, clientY } = event as PointerEvent;
      const rect = root.getBoundingClientRect();
      target = pointerTarget(
        { x: clientX - (rect.left + rect.width / 2), y: clientY - (rect.top + rect.height / 2) },
        pointerRadiusPx,
        offsetPx
      );
      ensureRunning();
    };
    const onLeave = () => {
      target = ZERO;
      ensureRunning();
    };

    if (withPointer) {
      window.addEventListener("pointermove", onMove);
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    ensureRunning();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [
    count,
    isInView,
    lag,
    offsetPx,
    direction,
    durationMs,
    pointerRadiusPx,
    withEntrance,
    withPointer,
  ]);

  return (
    <div
      ref={rootRef}
      data-slot="echo-text"
      className={cn("relative inline-block", className)}
      {...props}
    >
      {Array.from({ length: count }, (_, i) => {
        const index = i + 1;
        const start = withEntrance ? initialVector(direction, offsetPx * (index / count)) : ZERO;
        return (
          <span
            key={index}
            ref={(node) => {
              echoRefs.current[i] = node;
            }}
            aria-hidden="true"
            data-slot="echo-text-echo"
            className="pointer-events-none absolute top-0 left-0 select-none whitespace-nowrap"
            style={{
              ...echoStyle(index, count, { fade, blurPx, tint }),
              transform: toTransform(start),
            }}
          >
            {text}
          </span>
        );
      })}
      <span data-slot="echo-text-front" className="relative whitespace-nowrap">
        {text}
      </span>
    </div>
  );
}

EchoText.displayName = "EchoText";

export type { EchoDirection, EchoMode, EchoTextProps };
export {
  chainStep,
  clampEchoes,
  EchoText,
  echoStyle,
  entranceProgress,
  initialVector,
  pointerTarget,
};
