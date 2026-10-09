/**
 * CursorTrail Component - Flowtomic UI
 *
 * Área em que o mouse deixa para trás pequenas cópias de um conteúdo (um ícone,
 * uma palavra) em intervalos regulares, como pegadas. Podem girar para a direção
 * do movimento e flutuar levemente; quando o mouse para, somem uma a uma, da mais
 * antiga para a mais nova. O rastro é decorativo e não bloqueia cliques.
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/cursor-trail.md
 */

"use client";

import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type CursorTrailProps = React.ComponentProps<"div"> & {
  /** O que vira rastro (ícone, palavra). Obrigatório: não há emoji padrão. */
  content: React.ReactNode;
  /** Distância mínima entre duas cópias, em px. */
  spacingPx?: number;
  /** Gira cada cópia para a direção do movimento. */
  followDirection?: boolean;
  /** Pequena flutuação aleatória de posição e rotação. */
  float?: boolean;
  maxPoints?: number;
  /** Intervalo entre as remoções quando o mouse para, em ms. */
  removeIntervalMs?: number;
  /** Duração da saída (fade e encolher), em ms. */
  exitMs?: number;
};

type Coordinates = { x: number; y: number };
type TrailPoint = Coordinates & { id: number; angle: number; jitter: Jitter };
type Jitter = { x: number; y: number; rotate: number };

const IDLE_MS = 100;
const FLOAT_PX = 8;
const FLOAT_DEG = 10;
const POINTER_TYPES = ["mouse", "pen"];
const NO_JITTER: Jitter = { x: 0, y: 0, rotate: 0 };

function shouldCreatePoint(last: Coordinates | null, current: Coordinates, spacingPx: number) {
  return last === null || Math.hypot(current.x - last.x, current.y - last.y) >= spacingPx;
}

/** Ângulo em graus do deslocamento de `from` até `to` (0 = para a direita, 90 = para baixo). */
function pointerAngle(from: Coordinates, to: Coordinates): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

/** `random` devolve [0, 1]: o meio do intervalo não desloca nada. */
function floatJitter(random: () => number = Math.random): Jitter {
  const spread = (limit: number) => (random() - 0.5) * 2 * limit;
  return { x: spread(FLOAT_PX), y: spread(FLOAT_PX), rotate: spread(FLOAT_DEG) };
}

function pose(point: TrailPoint) {
  return { x: point.jitter.x, y: point.jitter.y, rotate: point.angle + point.jitter.rotate };
}

function CursorTrail({
  content,
  spacingPx = 100,
  followDirection = true,
  float = true,
  maxPoints = 5,
  removeIntervalMs = 30,
  exitMs = 500,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ref,
  ...props
}: CursorTrailProps) {
  const reduceMotion = useShouldReduceMotion();
  const [points, setPoints] = React.useState<TrailPoint[]>([]);
  const lastRef = React.useRef<Coordinates | null>(null);
  const nextIdRef = React.useRef(0);
  const idleTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const removeTimerRef = React.useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const stopRemoving = React.useCallback(() => {
    clearTimeout(idleTimerRef.current);
    clearInterval(removeTimerRef.current);
  }, []);

  const scheduleRemoval = React.useCallback(() => {
    stopRemoving();
    idleTimerRef.current = setTimeout(() => {
      removeTimerRef.current = setInterval(() => {
        setPoints((current) => {
          if (current.length <= 1) {
            clearInterval(removeTimerRef.current);
            lastRef.current = null;
          }
          return current.slice(1);
        });
      }, removeIntervalMs);
    }, IDLE_MS);
  }, [removeIntervalMs, stopRemoving]);

  React.useEffect(() => stopRemoving, [stopRemoving]);

  const addPoint = (position: Coordinates) => {
    const previous = lastRef.current;
    const angle = followDirection && previous ? pointerAngle(previous, position) : 0;
    const point: TrailPoint = {
      ...position,
      id: nextIdRef.current++,
      angle,
      jitter: float ? floatJitter() : NO_JITTER,
    };
    lastRef.current = position;
    setPoints((current) => [...current, point].slice(-maxPoints));
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (reduceMotion || !POINTER_TYPES.includes(event.pointerType)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const position = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (shouldCreatePoint(lastRef.current, position, spacingPx)) addPoint(position);
    scheduleRemoval();
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    scheduleRemoval();
  };

  return (
    <div
      ref={ref}
      data-slot="cursor-trail"
      data-points={points.length}
      className={cn("relative overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
      {reduceMotion ? null : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <AnimatePresence>
            {points.map((point) => (
              <motion.span
                key={point.id}
                data-slot="cursor-trail-point"
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: point.x, top: point.y }}
                // Posição e giro já nascem finais: só opacidade e escala entram animadas.
                initial={{ ...pose(point), opacity: 0, scale: 0.6 }}
                animate={{ ...pose(point), opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0, transition: { duration: exitMs / 1000 } }}
              >
                {content}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

CursorTrail.displayName = "CursorTrail";

export type { CursorTrailProps };
export { CursorTrail, floatJitter, pointerAngle, shouldCreatePoint };
