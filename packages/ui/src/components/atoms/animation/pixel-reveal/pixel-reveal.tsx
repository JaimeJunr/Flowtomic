/**
 * PixelReveal Component - Flowtomic UI
 *
 * Card com dois conteúdos: uma grade de pixels cobre o primeiro aos poucos, o conteúdo troca por
 * baixo e os pixels somem, revelando o segundo. Ao sair, o mesmo caminho de volta.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/pixel-reveal.md
 */

"use client";

import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  gridRows,
  type Origin,
  parseAspectRatio,
  pointerOrigin,
  type RevealPattern,
  revealOrder,
} from "./pixel-reveal-utils";

export type PixelRevealProps = Omit<React.ComponentProps<"div">, "children"> & {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  /** Pixels na largura; as linhas seguem a proporção. @default 10 */
  gridSize?: number;
  /** Cor dos pixels. Token. @default "var(--primary)" */
  pixelColor?: string;
  /** Segundos para cobrir, e de novo para descobrir. @default 0.4 */
  stepDuration?: number;
  /** @default "random" */
  pattern?: RevealPattern;
  /** Quebra a frente da onda/varredura, 0..1. @default 0.3 */
  randomness?: number;
  /** @default "hover" */
  trigger?: "hover" | "click";
  /** Controlado. */
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
  /** Depois de revelar, não volta. @default false */
  once?: boolean;
  /** CSS aspect-ratio. @default "1 / 1" */
  aspectRatio?: string;
};

type Phase = "first" | "covering" | "second" | "uncovering";

const CELL_MS = 200;
const FADE_SECONDS = 0.15;
const CENTER: Origin = { x: 0.5, y: 0.5 };

function useCardSize(ref: React.RefObject<HTMLDivElement | null>) {
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
const settled = (value: boolean): Phase => (value ? "second" : "first");

function usePhase(active: boolean, reduced: boolean, durationMs: number) {
  const [phase, setPhase] = React.useState<Phase>(settled(active));
  const phaseRef = React.useRef(phase);
  phaseRef.current = phase;

  React.useEffect(() => {
    if (phaseRef.current === settled(active)) return;
    if (reduced) {
      setPhase(settled(active));
      return;
    }
    setPhase(active ? "covering" : "uncovering");
    const timer = setTimeout(() => setPhase(settled(active)), durationMs);
    return () => clearTimeout(timer);
  }, [active, reduced, durationMs]);

  return phase;
}

function useActiveState(
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

function Layer({
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

function PixelGrid(props: {
  cols: number;
  rows: number;
  delays: number[];
  covered: boolean;
  color: string;
  stepMs: number;
}) {
  const { cols, rows, delays, covered, color, stepMs } = props;
  return (
    <div
      aria-hidden="true"
      data-slot="pixel-reveal-grid"
      className="pointer-events-none absolute inset-0 grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {delays.map((delay, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: as células são posições fixas da grade
          key={index}
          data-slot="pixel-reveal-cell"
          style={{
            background: color,
            opacity: covered ? 1 : 0,
            transform: `scale(${covered ? 1 : 0.6})`,
            transition: `opacity ${CELL_MS}ms linear, transform ${CELL_MS}ms linear`,
            transitionDelay: `${delay * stepMs}ms`,
          }}
        />
      ))}
    </div>
  );
}

function PixelReveal({
  ref,
  className,
  style,
  firstContent,
  secondContent,
  gridSize = 10,
  pixelColor = "var(--primary)",
  stepDuration = 0.4,
  pattern = "random",
  randomness = 0.3,
  trigger = "hover",
  active,
  onActiveChange,
  once = false,
  aspectRatio = "1 / 1",
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  onClick,
  onKeyDown,
  ...props
}: PixelRevealProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const reduced = useShouldReduceMotion();
  const stepMs = stepDuration * 1000;
  const [isActive, setActive] = useActiveState(active, onActiveChange, once);
  const phase = usePhase(isActive, reduced, stepMs + CELL_MS);
  const [shown, setShown] = React.useState<"first" | "second">(isActive ? "second" : "first");
  const [origin, setOrigin] = React.useState<Origin>(CENTER);
  const size = useCardSize(rootRef);

  // O conteúdo só troca quando a fase assenta: durante a cobertura mantém o anterior.
  React.useEffect(() => {
    if (phase === "first" || phase === "second") setShown(phase);
  }, [phase]);

  const cols = Math.max(1, Math.round(gridSize));
  const rows = size
    ? gridRows(cols, size.width, size.height)
    : Math.max(1, Math.round(cols / parseAspectRatio(aspectRatio)));
  const delays = React.useMemo(
    () => revealOrder(cols, rows, pattern, origin, randomness, Math.random),
    [cols, rows, pattern, origin, randomness]
  );

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const hoverable = trigger === "hover";
  const pointAt = (
    event: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setOrigin(pointerOrigin(rect, event.clientX, event.clientY));
  };
  const toggle = () => setActive(!isActive);

  const visibleShown = reduced ? (isActive ? "second" : "first") : shown;
  const state = reduced ? visibleShown : phase;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: role="button" só existe com trigger="click"; no hover o foco por teclado também revela
    <div
      ref={setRefs}
      data-slot="pixel-reveal"
      data-state={state}
      {...(hoverable ? {} : { role: "button", "aria-pressed": isActive })}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a raiz precisa de foco para o hover por teclado
      tabIndex={0}
      className={cn("relative overflow-hidden rounded-lg border bg-card", className)}
      style={{ aspectRatio, ...style }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!hoverable) return;
        pointAt(event);
        setActive(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (hoverable) setActive(false);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (hoverable) setActive(true);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (hoverable) setActive(false);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (hoverable) return;
        pointAt(event);
        toggle();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (hoverable || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        toggle();
      }}
      {...props}
    >
      <Layer visible={visibleShown === "first"} fade={reduced}>
        {firstContent}
      </Layer>
      <Layer visible={visibleShown === "second"} fade={reduced}>
        {secondContent}
      </Layer>
      {reduced ? null : (
        <PixelGrid
          cols={cols}
          rows={rows}
          delays={delays}
          covered={phase === "covering" || phase === "uncovering"}
          color={pixelColor}
          stepMs={stepMs}
        />
      )}
    </div>
  );
}

PixelReveal.displayName = "PixelReveal";

export { PixelReveal };
