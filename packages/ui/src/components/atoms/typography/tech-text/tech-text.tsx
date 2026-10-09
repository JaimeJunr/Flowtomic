/**
 * TechText Component - Flowtomic UI
 *
 * Logotipo de texto grande e sólido. Onde o ponteiro passa, as letras viram contorno
 * tracejado, como numa ferramenta de design vetorial: uma moldura de seleção desliza até
 * a letra ativa com etiqueta ("R · 150px"), dá para arrastar a letra (volta com mola) e,
 * sem ponteiro, uma varredura percorre a palavra. Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/tech-text.md
 */

"use client";

import { motion, useInView } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  activeLetterIndex,
  areaFillOpacity,
  BASELINE_EM,
  buildLayout,
  dragLabel,
  FALLBACK_ADVANCE_EM,
  fitFontSize,
  type Layout,
  measureAdvancesEm,
  selectionLabel,
  speckPositions,
} from "./tech-text-utils";

type TechTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Maior tamanho, em px. Encolhe para caber no container. */
  maxFontSizePx?: number;
  /** Espaço extra entre letras, em em. */
  letterSpacingEm?: number;
  /** Cor da moldura, conector e etiquetas. */
  accentColor?: string;
  /** "area" = círculo em volta do ponteiro; "letter" = só a letra ativa; "off" = sempre sólido. */
  reveal?: "area" | "letter" | "off";
  /** Raio do modo área, em px. */
  reachPx?: number;
  /** 0 = borda dura; 1 = transição longa entre preenchido e contorno. */
  softness?: number;
  lineStyle?: "dashed" | "solid";
  dashPx?: number;
  gapPx?: number;
  strokeWidthPx?: number;
  /** Quadradinhos piscando em volta da letra ativa. 0 = desliga. */
  specks?: number;
  selection?: boolean;
  labels?: boolean;
  draggable?: boolean;
  /** Varredura automática sem ponteiro. */
  sweep?: boolean;
  sweepSpeed?: number;
};

type Point = { x: number; y: number };
type Drag = { index: number; origin: Point; dx: number; dy: number };
type Glyph = { char: string; left: number; width: number };

const SWEEP_IDLE_MS = 1500;
const SWEEP_STEP_MS = 500;
const SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;
const INSTANT = { duration: 0 } as const;

function glyphsOf(text: string, layout: Layout): Glyph[] {
  return [...text].flatMap((char, index) =>
    char.trim() === ""
      ? []
      : [{ char, left: layout.boxes[index].left, width: layout.boxes[index].width }]
  );
}

function fillFor(
  reveal: NonNullable<TechTextProps["reveal"]>,
  glyph: Glyph,
  index: number,
  active: number,
  focus: Point | null,
  layout: Layout,
  area: { reachPx: number; softness: number }
): number {
  if (reveal === "off") return 1;
  if (reveal === "letter") return index === active ? 0 : 1;
  if (!focus) return 1;
  const distance = Math.hypot(
    glyph.left + glyph.width / 2 - focus.x,
    layout.heightPx / 2 - focus.y
  );
  return areaFillOpacity(distance, area.reachPx, area.softness);
}

function useLayout(text: string, letterSpacingEm: number, maxFontSizePx: number) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [advances, setAdvances] = React.useState<number[]>(() =>
    [...text].map(() => FALLBACK_ADVANCE_EM)
  );
  const [containerPx, setContainerPx] = React.useState(0);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const style = getComputedStyle(root);
    const font = `${style.fontStyle} ${style.fontWeight} 100px ${style.fontFamily || "sans-serif"}`;
    setAdvances(measureAdvancesEm(text, font));
    setContainerPx(root.clientWidth);
  }, [text]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setContainerPx(root.clientWidth));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const layout = React.useMemo(
    () => buildLayout(advances, letterSpacingEm, containerPx, maxFontSizePx),
    [advances, letterSpacingEm, containerPx, maxFontSizePx]
  );
  return { rootRef, layout };
}

function useSweep(enabled: boolean, count: number, speed: number, hasPointer: boolean) {
  const [idle, setIdle] = React.useState(false);
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    if (hasPointer) return setIdle(false);
    const timer = setTimeout(() => setIdle(true), SWEEP_IDLE_MS);
    return () => clearTimeout(timer);
  }, [hasPointer]);
  const sweeping = enabled && idle && !hasPointer && count > 1;
  React.useEffect(() => {
    if (!sweeping) return;
    const timer = setInterval(() => setStep((value) => (value + 1) % count), SWEEP_STEP_MS / speed);
    return () => clearInterval(timer);
  }, [sweeping, count, speed]);
  return { sweeping, sweepIndex: step % Math.max(1, count) };
}

type SelectionProps = {
  glyph: Glyph;
  layout: Layout;
  offset: Point;
  label: string | null;
  specks: number;
  seed: number;
  accentColor: string;
  animated: boolean;
  dragging: boolean;
};

function Selection({
  glyph,
  layout,
  offset,
  label,
  specks,
  seed,
  accentColor,
  animated,
  dragging,
}: SelectionProps) {
  const dots = React.useMemo(
    () => speckPositions(seed, specks, { width: glyph.width, height: layout.heightPx }),
    [seed, specks, glyph.width, layout.heightPx]
  );
  return (
    <motion.div
      aria-hidden="true"
      data-slot="tech-text-selection"
      className="pointer-events-none absolute top-0 left-0 border"
      style={{ borderColor: accentColor }}
      initial={false}
      animate={{
        x: glyph.left + offset.x,
        y: offset.y,
        width: glyph.width,
        height: layout.heightPx,
      }}
      transition={animated && !dragging ? SPRING : INSTANT}
    >
      {label ? (
        <span
          className="absolute bottom-full left-0 mb-1 whitespace-nowrap px-1 font-mono text-xs text-primary-foreground"
          style={{ backgroundColor: accentColor }}
        >
          {label}
        </span>
      ) : null}
      {dots.map((dot, index) => (
        <motion.span
          // biome-ignore lint/suspicious/noArrayIndexKey: posições fixas por semente
          key={index}
          data-slot="tech-text-speck"
          className="absolute size-0.5"
          style={{ left: dot.x, top: dot.y, backgroundColor: accentColor }}
          initial={false}
          animate={{ opacity: animated ? [0, 1, 0] : 0.6 }}
          transition={
            animated
              ? {
                  duration: dot.durationMs / 1000,
                  delay: dot.delayMs / 1000,
                  repeat: Number.POSITIVE_INFINITY,
                }
              : INSTANT
          }
        />
      ))}
    </motion.div>
  );
}

function TechText({
  text,
  maxFontSizePx = 150,
  letterSpacingEm = -0.04,
  accentColor = "var(--primary)",
  reveal = "letter",
  reachPx = 200,
  softness = 0.7,
  lineStyle = "dashed",
  dashPx = 4,
  gapPx = 2,
  strokeWidthPx = 1.5,
  specks = 8,
  selection = true,
  labels = true,
  draggable = true,
  sweep = true,
  sweepSpeed = 1,
  className,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  ref,
  ...props
}: TechTextProps) {
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error(
      `TechText: invalid text, received ${JSON.stringify(text)}, expected a non-empty string`
    );
  }

  const { rootRef, layout } = useLayout(text, letterSpacingEm, maxFontSizePx);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  const isInView = useInView(rootRef);
  const reduceMotion = useShouldReduceMotion();
  const [pointer, setPointer] = React.useState<Point | null>(null);
  const [drag, setDrag] = React.useState<Drag | null>(null);

  const glyphs = glyphsOf(text, layout);
  const { sweeping, sweepIndex } = useSweep(
    sweep && isInView && !reduceMotion && !drag,
    glyphs.length,
    sweepSpeed,
    pointer !== null
  );
  const boxes = glyphs;
  const active = drag
    ? drag.index
    : pointer
      ? activeLetterIndex(pointer.x, boxes)
      : sweeping
        ? sweepIndex
        : -1;
  const activeGlyph = glyphs[active];
  const focus =
    pointer ??
    (sweeping && activeGlyph
      ? { x: activeGlyph.left + activeGlyph.width / 2, y: layout.heightPx / 2 }
      : null);

  const locate = (event: React.PointerEvent<HTMLDivElement>): Point => {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };
  const dash = lineStyle === "dashed" ? `${dashPx} ${gapPx}` : undefined;
  const transition = reduceMotion ? INSTANT : SPRING;
  const label = drag
    ? dragLabel(drag.dx, drag.dy)
    : selectionLabel(activeGlyph?.char ?? "", layout.fontSizePx);

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={text}
      data-slot="tech-text"
      data-active-index={active}
      data-sweeping={sweeping}
      className={cn("relative block w-full touch-none select-none", className)}
      style={{ height: layout.heightPx }}
      onPointerMove={(event) => {
        const next = locate(event);
        setPointer(next);
        if (drag) setDrag({ ...drag, dx: next.x - drag.origin.x, dy: next.y - drag.origin.y });
        onPointerMove?.(event);
      }}
      onPointerLeave={(event) => {
        if (!drag) setPointer(null);
        onPointerLeave?.(event);
      }}
      onPointerDown={(event) => {
        const origin = locate(event);
        const index = activeLetterIndex(origin.x, boxes);
        if (draggable && index >= 0) {
          setPointer(origin);
          setDrag({ index, origin, dx: 0, dy: 0 });
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }
        onPointerDown?.(event);
      }}
      onPointerUp={(event) => {
        setDrag(null);
        onPointerUp?.(event);
      }}
      onPointerCancel={(event) => {
        setDrag(null);
        onPointerCancel?.(event);
      }}
      {...props}
    >
      <svg
        aria-hidden="true"
        width={layout.widthPx}
        height={layout.heightPx}
        className="block overflow-visible"
        style={{ fontSize: layout.fontSizePx }}
      >
        {glyphs.map((glyph, index) => {
          const fill = fillFor(reveal, glyph, index, active, focus, layout, { reachPx, softness });
          const moved = drag?.index === index;
          return (
            <g
              key={`${glyph.char}-${glyph.left}`}
              transform={`translate(${glyph.left} ${layout.fontSizePx * BASELINE_EM})`}
            >
              <motion.g
                initial={false}
                animate={{ x: moved ? drag.dx : 0, y: moved ? drag.dy : 0 }}
                transition={moved ? INSTANT : transition}
              >
                <text
                  data-slot="tech-text-letter"
                  fill="currentColor"
                  fillOpacity={fill}
                  stroke="currentColor"
                  strokeOpacity={reveal === "off" ? 0 : 1 - fill}
                  strokeWidth={strokeWidthPx}
                  strokeDasharray={dash}
                  className={cn(
                    !reduceMotion && "transition-[fill-opacity,stroke-opacity] duration-200"
                  )}
                >
                  {glyph.char}
                </text>
              </motion.g>
            </g>
          );
        })}
      </svg>
      {selection && activeGlyph ? (
        <Selection
          glyph={activeGlyph}
          layout={layout}
          offset={drag?.index === active ? { x: drag.dx, y: drag.dy } : { x: 0, y: 0 }}
          label={labels ? label : null}
          specks={specks}
          seed={active + 1}
          accentColor={accentColor}
          animated={!reduceMotion}
          dragging={Boolean(drag)}
        />
      ) : null}
    </div>
  );
}

TechText.displayName = "TechText";

export type { TechTextProps };
export {
  activeLetterIndex,
  areaFillOpacity,
  dragLabel,
  fitFontSize,
  selectionLabel,
  speckPositions,
  TechText,
};
