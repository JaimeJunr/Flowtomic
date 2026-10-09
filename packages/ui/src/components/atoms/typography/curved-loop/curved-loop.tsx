/**
 * CurvedLoop Component - Flowtomic UI
 *
 * Faixa de texto que corre sem fim ao longo de uma curva suave, como uma fita
 * arqueada. Dá para agarrar e arrastar (ou usar as setas com foco); ao soltar,
 * a faixa segue na direção do último arrasto. Pausa fora da tela.
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/curved-loop.md
 */

"use client";

import { useAnimationFrame, useInView } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type CurvedLoopDirection = "left" | "right";

type CurvedLoopProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Velocidade em px/s. */
  speed?: number;
  /** Quanto a curva desce no meio, em unidades do viewBox. 0 = reta. Negativo = arco para cima. */
  curve?: number;
  direction?: CurvedLoopDirection;
  draggable?: boolean;
};

const VIEWBOX_WIDTH = 1440;
const FONT_SIZE = 56;
const VERTICAL_PADDING = 60;
// Espaços não separáveis: a textPath colapsa espaços comuns.
const SEPARATOR = "  ";
const KEY_STEP = 40;
const MAX_FRAME_MS = 64;
const AVERAGE_GLYPH_EM = 0.55;
const CURVE_SAMPLES = 32;

type CurvePath = { d: string; baseY: number; height: number };

/** Quadrática de borda a borda; o ponto de controle fica no meio, `curve` abaixo da linha de base. */
function buildCurvePath(curve: number): CurvePath {
  const baseY = VERTICAL_PADDING + Math.max(0, -curve);
  const height = baseY + Math.max(0, curve) + VERTICAL_PADDING;
  const d = `M0,${baseY} Q${VIEWBOX_WIDTH / 2},${baseY + curve} ${VIEWBOX_WIDTH},${baseY}`;
  return { d, baseY, height };
}

/** Leva o valor para [0, period): o "salto" de uma cópia inteira é invisível. */
function wrapOffset(value: number, period: number): number {
  if (!(period > 0)) {
    throw new Error(`CurvedLoop: invalid period, received ${period}, expected period > 0`);
  }
  return ((value % period) + period) % period;
}

/** Fallback para ambientes sem `getComputedTextLength` (jsdom). */
function estimateTextLength(text: string, fontSize: number): number {
  return text.length * fontSize * AVERAGE_GLYPH_EM;
}

/** Comprimento de arco da quadrática (ponto de controle `curve` abaixo do meio), por amostragem. */
function quadraticLength(width: number, curve: number): number {
  let length = 0;
  let previousX = 0;
  let previousY = 0;
  for (let step = 1; step <= CURVE_SAMPLES; step++) {
    const t = step / CURVE_SAMPLES;
    const x = width * t;
    const y = 2 * (1 - t) * t * curve;
    length += Math.hypot(x - previousX, y - previousY);
    previousX = x;
    previousY = y;
  }
  return length;
}

/** Cópias necessárias para cobrir 2x o comprimento da curva (mais uma, que cobre o salto do período). */
function repeatCount(curveLength: number, copyLength: number): number {
  if (!(copyLength > 0)) return 1;
  return Math.ceil((2 * curveLength) / copyLength) + 1;
}

/** Px da tela para unidades do viewBox; sem largura medida (jsdom) vale 1:1. */
function pxToUnits(px: number, renderedWidth: number): number {
  return renderedWidth > 0 ? px * (VIEWBOX_WIDTH / renderedWidth) : px;
}

function measureCopy(node: SVGTextContentElement | null, copy: string): number {
  const measured = node?.getComputedTextLength?.();
  return measured && measured > 0 ? measured : estimateTextLength(copy, FONT_SIZE);
}

function CurvedLoop({
  text,
  speed = 60,
  curve = 120,
  direction = "left",
  draggable = true,
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
  ref,
  ...props
}: CurvedLoopProps) {
  if (text.trim() === "") {
    throw new Error(
      `CurvedLoop: invalid text, received ${JSON.stringify(text)}, expected text: string não vazio`
    );
  }

  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  const measurerRef = React.useRef<SVGTextElement>(null);
  const textPathRef = React.useRef<SVGTextPathElement>(null);
  const offsetRef = React.useRef(0);
  const lastXRef = React.useRef(0);
  const pathId = `curved-loop-${React.useId().replace(/:/g, "")}`;

  const isInView = useInView(rootRef);
  const reduceMotion = useShouldReduceMotion();
  const [currentDirection, setCurrentDirection] = React.useState<CurvedLoopDirection>(direction);
  const [dragging, setDragging] = React.useState(false);
  const [copyLength, setCopyLength] = React.useState(() =>
    estimateTextLength(`${text}${SEPARATOR}`, FONT_SIZE)
  );

  React.useEffect(() => setCurrentDirection(direction), [direction]);

  const copy = `${text}${SEPARATOR}`;
  const geometry = buildCurvePath(curve);
  const copies = repeatCount(quadraticLength(VIEWBOX_WIDTH, curve), copyLength);

  React.useLayoutEffect(() => {
    setCopyLength(measureCopy(measurerRef.current, copy));
  }, [copy]);

  // `position` cresce quando o texto anda para a direita. `startOffset` fica em [-período, 0):
  // sempre há texto cobrindo o início da curva, e o salto de uma cópia no wrap é invisível.
  const moveBy = React.useCallback(
    (delta: number) => {
      offsetRef.current = wrapOffset(offsetRef.current + delta, copyLength);
      textPathRef.current?.setAttribute("startOffset", String(offsetRef.current - copyLength));
    },
    [copyLength]
  );

  React.useLayoutEffect(() => moveBy(0), [moveBy]);

  const moving = !reduceMotion && isInView && !dragging;

  useAnimationFrame((_, frameMs) => {
    if (!moving) return;
    const width = rootRef.current?.getBoundingClientRect().width ?? 0;
    const step = pxToUnits((speed * Math.min(frameMs, MAX_FRAME_MS)) / 1000, width);
    moveBy(currentDirection === "left" ? -step : step);
  });

  const dragProps = draggable
    ? {
        role: "group",
        "aria-roledescription": "faixa de texto arrastável",
        tabIndex: 0,
        onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
          lastXRef.current = event.clientX;
          setDragging(true);
          event.currentTarget.setPointerCapture?.(event.pointerId);
          onPointerDown?.(event);
        },
        onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
          if (dragging) {
            const dx = event.clientX - lastXRef.current;
            lastXRef.current = event.clientX;
            if (dx !== 0) {
              const width = event.currentTarget.getBoundingClientRect().width;
              moveBy(pxToUnits(dx, width));
              setCurrentDirection(dx > 0 ? "right" : "left");
            }
          }
          onPointerMove?.(event);
        },
        onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => {
          setDragging(false);
          onPointerUp?.(event);
        },
        onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => {
          setDragging(false);
          onPointerCancel?.(event);
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "ArrowRight") moveBy(KEY_STEP);
          if (event.key === "ArrowLeft") moveBy(-KEY_STEP);
          onKeyDown?.(event);
        },
      }
    : { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onKeyDown };

  return (
    <div
      ref={rootRef}
      data-slot="curved-loop"
      data-direction={currentDirection}
      data-dragging={dragging}
      data-moving={moving}
      className={cn(
        "w-full select-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
        draggable && (dragging ? "cursor-grabbing" : "cursor-grab"),
        className
      )}
      style={draggable ? { touchAction: "pan-y" } : undefined}
      {...dragProps}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${geometry.height}`}
        className="block w-full overflow-visible"
        style={{ fontSize: FONT_SIZE }}
      >
        <path id={pathId} d={geometry.d} fill="none" stroke="none" />
        <text
          ref={measurerRef}
          visibility="hidden"
          style={{ whiteSpace: "pre" }}
          fontSize={FONT_SIZE}
        >
          {copy}
        </text>
        <text fill="currentColor" fontSize={FONT_SIZE} style={{ whiteSpace: "pre" }}>
          <textPath ref={textPathRef} href={`#${pathId}`} startOffset={0}>
            {copy.repeat(copies)}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

CurvedLoop.displayName = "CurvedLoop";

export type { CurvedLoopProps };
export {
  buildCurvePath,
  CurvedLoop,
  estimateTextLength,
  pxToUnits,
  quadraticLength,
  repeatCount,
  wrapOffset,
};
