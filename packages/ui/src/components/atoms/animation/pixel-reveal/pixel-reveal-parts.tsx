"use client";

import { motion } from "motion/react";
import * as React from "react";
import type { Origin } from "./pixel-reveal-utils";

export type Phase = "first" | "covering" | "second" | "uncovering";

export const CELL_MS = 200;
const FADE_SECONDS = 0.15;
export const CENTER: Origin = { x: 0.5, y: 0.5 };

export function useCardSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

/** Fase e conteúdo visível; a troca de conteúdo só acontece quando a grade cobre tudo. */
export const settled = (value: boolean): Phase => (value ? "second" : "first");

export function usePhase(
  active: boolean,
  reduced: boolean,
  durationMs: number,
  onComplete?: (active: boolean) => void
) {
  const [phase, setPhase] = React.useState<Phase>(settled(active));
  const phaseRef = React.useRef(phase);
  phaseRef.current = phase;
  const completeRef = React.useRef(onComplete);
  completeRef.current = onComplete;

  React.useEffect(() => {
    if (phaseRef.current === settled(active)) return;
    if (reduced) {
      setPhase(settled(active));
      completeRef.current?.(active);
      return;
    }
    setPhase(active ? "covering" : "uncovering");
    const timer = setTimeout(() => {
      setPhase(settled(active));
      completeRef.current?.(active);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [active, reduced, durationMs]);

  return phase;
}

export function useActiveState(
  controlled: boolean | undefined,
  onActiveChange: ((active: boolean) => void) | undefined,
  once: boolean
) {
  const [inner, setInner] = React.useState(false);
  const value = controlled ?? inner;
  const set = (next: boolean) => {
    if (once && !next) return;
    if (next === value) return;
    if (controlled === undefined) setInner(next);
    onActiveChange?.(next);
  };
  return [value, set] as const;
}

export function Layer({
  visible,
  fade,
  children,
}: {
  visible: boolean;
  fade: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      key={String(visible)}
      hidden={!visible}
      className="absolute inset-0"
      initial={fade && visible ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: FADE_SECONDS }}
    >
      {children}
    </motion.div>
  );
}

export type CellShape = {
  gap: number;
  radius: number;
  scale: number;
  spin: number;
  fade: boolean;
};

export function PixelGrid(props: {
  cols: number;
  rows: number;
  delays: number[];
  covered: boolean;
  color: string;
  stepMs: number;
  shape: CellShape;
}) {
  const { cols, rows, delays, covered, color, stepMs, shape } = props;
  // Sem fade a opacidade vira instantânea no atraso da célula: o pixel aparece e só cresce.
  const opacityMs = shape.fade ? CELL_MS : 0;
  return (
    <div
      aria-hidden="true"
      data-slot="pixel-reveal-grid"
      className="pointer-events-none absolute inset-0 grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: `${shape.gap}px`,
      }}
    >
      {delays.map((delay, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: as células são posições fixas da grade
          key={index}
          data-slot="pixel-reveal-cell"
          style={{
            background: color,
            borderRadius: `${shape.radius}%`,
            opacity: covered ? 1 : 0,
            transform: covered
              ? "scale(1) rotate(0deg)"
              : `scale(${shape.scale}) rotate(${shape.spin}deg)`,
            transition: `opacity ${opacityMs}ms linear, transform ${CELL_MS}ms linear`,
            transitionDelay: `${delay * stepMs}ms`,
          }}
        />
      ))}
    </div>
  );
}
