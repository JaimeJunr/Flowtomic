/**
 * FuzzyText Component - Flowtomic UI
 *
 * Texto grande que treme como sinal de vídeo ruim: o desenho é copiado para o canvas
 * visível em faixas de 1px, cada uma deslocada de forma aleatória. Leve em repouso,
 * forte com o ponteiro em cima; opcionalmente com estouro no clique e picos periódicos.
 * Sem canvas 2D ou com movimento reduzido, mostra o texto (puro ou estático).
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/fuzzy-text.md
 */

"use client";

import { useInView } from "motion/react";
import * as React from "react";

import { frameIntervalMs, useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type FuzzyDirection = "horizontal" | "vertical" | "both";

type FuzzyTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  children: string;
  baseIntensity?: number;
  hoverIntensity?: number;
  /** Deslocamento máximo de uma faixa, em px. Padrão: 0,15 × tamanho da fonte. */
  rangePx?: number;
  /** Limite de quadros por segundo. */
  fps?: number;
  direction?: FuzzyDirection;
  /** Quadros para a intensidade mudar suavemente entre estados. 0 = instantâneo. */
  easeFrames?: number;
  hover?: boolean;
  clickBurst?: boolean;
  glitch?: boolean;
  glitchIntervalMs?: number;
  glitchDurationMs?: number;
};

type Layout = {
  source: HTMLCanvasElement;
  /** Tamanho do texto e margem, em px de dispositivo. */
  width: number;
  height: number;
  margin: number;
  dpr: number;
  rangePx: number;
};

const BURST_MS = 150;
const LINE_HEIGHT_RATIO = 1.3;
const MAX_DPR = 2;
const DEFAULT_RANGE_RATIO = 0.15;

/** Alcance padrão proporcional à fonte: px fixo deixava texto médio ilegível. */
function defaultRangePx(fontSizePx: number): number {
  if (!(fontSizePx > 0)) {
    throw new Error(
      `defaultRangePx: received ${JSON.stringify(fontSizePx)}, expected a font size > 0`
    );
  }
  return fontSizePx * DEFAULT_RANGE_RATIO;
}

/** Deslocamento de uma faixa; `random` em 0..1. */
function stripOffset(random: number, intensity: number, rangePx: number): number {
  return (random * 2 - 1) * rangePx * intensity;
}

function stripOffsets(
  direction: FuzzyDirection,
  randomA: number,
  randomB: number,
  intensity: number,
  rangePx: number
): { dx: number; dy: number } {
  const first = stripOffset(randomA, intensity, rangePx);
  if (direction === "horizontal") return { dx: first, dy: 0 };
  if (direction === "vertical") return { dx: 0, dy: first };
  return { dx: first, dy: stripOffset(randomB, intensity, rangePx) };
}

/** Anda 1/easeFrames por quadro em direção ao alvo, sem passar dele. */
function nextIntensity(current: number, target: number, easeFrames: number): number {
  if (easeFrames <= 0) return target;
  const step = 1 / easeFrames;
  if (Math.abs(target - current) <= step) return target;
  return current + Math.sign(target - current) * step;
}

function intensityTarget(state: {
  base: number;
  hover: number;
  hovered: boolean;
  burst: boolean;
  glitching: boolean;
}): number {
  if (state.burst || state.glitching) return 1;
  return state.hovered ? state.hover : state.base;
}

/** O pico fica no fim de cada intervalo, para a primeira pintura ser calma. */
function isGlitching(elapsedMs: number, intervalMs: number, durationMs: number): boolean {
  if (elapsedMs < 0 || intervalMs <= 0) return false;
  return elapsedMs % intervalMs >= intervalMs - durationMs;
}

function drawStrips(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  intensity: number,
  direction: FuzzyDirection
): void {
  const { source, width, height, margin, dpr, rangePx } = layout;
  ctx.clearRect(0, 0, width + margin * 2, height + margin * 2);
  const vertical = direction === "vertical";
  const count = vertical ? width : height;
  for (let index = 0; index < count; index++) {
    const { dx, dy } = stripOffsets(direction, Math.random(), Math.random(), intensity, rangePx);
    const x = margin + dx * dpr;
    const y = margin + dy * dpr;
    if (vertical) ctx.drawImage(source, index, 0, 1, height, x + index, y, 1, height);
    else ctx.drawImage(source, 0, index, width, 1, x, y + index, width, 1);
  }
}

function cssFont(style: CSSStyleDeclaration): { font: string; sizePx: number } {
  const sizePx = Number.parseFloat(style.fontSize) || 16;
  const family = style.fontFamily || "sans-serif";
  return { font: `${style.fontStyle} ${style.fontWeight} ${sizePx}px ${family}`, sizePx };
}

/** Desenha o texto no canvas fora da tela e ajusta o canvas visível (com margem). */
function prepareLayout(
  visible: HTMLCanvasElement,
  text: string,
  rangePxProp: number | undefined,
  root: HTMLElement
): { layout: Layout; ctx: CanvasRenderingContext2D } | null {
  const ctx = visible.getContext("2d");
  const source = document.createElement("canvas");
  const sourceCtx = source.getContext("2d");
  if (!ctx || !sourceCtx) return null;
  const style = getComputedStyle(root);
  const { font, sizePx } = cssFont(style);
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const rangePx = rangePxProp ?? defaultRangePx(sizePx);
  sourceCtx.font = font;
  const cssWidth = Math.ceil(sourceCtx.measureText(text).width);
  const cssHeight = Math.ceil(sizePx * LINE_HEIGHT_RATIO);
  source.width = cssWidth * dpr;
  source.height = cssHeight * dpr;
  sourceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  sourceCtx.font = font;
  sourceCtx.textBaseline = "middle";
  sourceCtx.fillStyle = style.color || "currentColor";
  sourceCtx.fillText(text, 0, cssHeight / 2);
  const margin = Math.ceil(rangePx * dpr);
  visible.width = source.width + margin * 2;
  visible.height = source.height + margin * 2;
  visible.style.width = `${cssWidth + rangePx * 2}px`;
  visible.style.height = `${cssHeight + rangePx * 2}px`;
  visible.style.margin = `-${rangePx}px`;
  return {
    layout: { source, width: source.width, height: source.height, margin, dpr, rangePx },
    ctx,
  };
}

function FuzzyText({
  children,
  baseIntensity = 0.18,
  hoverIntensity = 0.4,
  rangePx,
  fps = 60,
  direction = "horizontal",
  easeFrames = 6,
  hover = true,
  clickBurst = false,
  glitch = false,
  glitchIntervalMs = 2000,
  glitchDurationMs = 200,
  className,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  ref,
  ...props
}: FuzzyTextProps) {
  if (typeof children !== "string" || children.length === 0) {
    throw new Error(
      `FuzzyText: invalid children, received ${JSON.stringify(children)}, expected a non-empty string`
    );
  }

  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawRef = React.useRef<{ layout: Layout; ctx: CanvasRenderingContext2D } | null>(null);
  const intensityRef = React.useRef(baseIntensity);
  const hoveredRef = React.useRef(false);
  const burstUntilRef = React.useRef(0);
  const startRef = React.useRef(0);
  const isInView = useInView(rootRef);
  const reduceMotion = useShouldReduceMotion();
  const [supported, setSupported] = React.useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: baseIntensity só semeia o valor inicial
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const prepared = root && canvas ? prepareLayout(canvas, children, rangePx, root) : null;
    drawRef.current = prepared;
    setSupported(Boolean(prepared));
    startRef.current = performance.now();
    if (!prepared) return;
    intensityRef.current = reduceMotion ? 0 : baseIntensity;
    drawStrips(prepared.ctx, prepared.layout, intensityRef.current, direction);
  }, [children, rangePx, direction, reduceMotion]);

  const onFrame = (now: number) => {
    const prepared = drawRef.current;
    if (!prepared) return;
    const target = intensityTarget({
      base: baseIntensity,
      hover: hoverIntensity,
      hovered: hoveredRef.current,
      burst: now < burstUntilRef.current,
      glitching: glitch && isGlitching(now - startRef.current, glitchIntervalMs, glitchDurationMs),
    });
    intensityRef.current = nextIntensity(intensityRef.current, target, easeFrames);
    drawStrips(prepared.ctx, prepared.layout, intensityRef.current, direction);
  };
  useFrameLoop(onFrame, supported && isInView && !reduceMotion, fps);

  return (
    <div
      ref={rootRef}
      data-slot="fuzzy-text"
      className={cn("relative inline-block", className)}
      onPointerEnter={(event) => {
        if (hover) hoveredRef.current = true;
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        hoveredRef.current = false;
        onPointerLeave?.(event);
      }}
      onPointerDown={(event) => {
        if (clickBurst) burstUntilRef.current = performance.now() + BURST_MS;
        onPointerDown?.(event);
      }}
      {...props}
    >
      <span className={supported ? "sr-only" : undefined}>{children}</span>
      {supported ? (
        // biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas não é focável; o texto equivalente está no sr-only
        <canvas
          ref={canvasRef}
          data-slot="fuzzy-text-canvas"
          aria-hidden="true"
          className="block max-w-none"
        />
      ) : null}
    </div>
  );
}

FuzzyText.displayName = "FuzzyText";

export type { FuzzyDirection, FuzzyTextProps };
export {
  defaultRangePx,
  frameIntervalMs,
  FuzzyText,
  intensityTarget,
  isGlitching,
  nextIntensity,
  stripOffset,
  stripOffsets,
};
