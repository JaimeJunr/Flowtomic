/**
 * ClickSpark Component - Flowtomic UI
 *
 * Cada clique solta um estalo de faíscas que saem do ponto do clique e somem.
 * Implementação clean room — spec em docs/clean-room/react-bits/click-spark.md
 */

"use client";

import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  applyEasing,
  resolveCssColor,
  type Spark,
  type SparkEasing,
  sparkAngle,
  sparkSegment,
} from "./click-spark-utils";

export type ClickSparkProps = React.ComponentProps<"div"> & {
  /** Cor dos traços (token CSS). @default "var(--primary)" */
  color?: string;
  /** Comprimento inicial de cada traço, px. @default 10 */
  sparkSize?: number;
  /** Distância que o traço percorre, px. @default 18 */
  sparkRadius?: number;
  /** Traços por clique. @default 8 */
  sparkCount?: number;
  /** Duração de um estalo, ms. @default 400 */
  duration?: number;
  /** @default "ease-out" */
  easing?: SparkEasing;
  /** Multiplicador da distância. @default 1 */
  extraScale?: number;
};

type DrawOptions = Required<
  Pick<
    ClickSparkProps,
    "sparkSize" | "sparkRadius" | "sparkCount" | "duration" | "easing" | "extraScale"
  >
> & { strokeStyle: string };

function drawSparks(
  ctx: CanvasRenderingContext2D,
  sparks: Spark[],
  now: number,
  opts: DrawOptions
) {
  ctx.strokeStyle = opts.strokeStyle;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (const spark of sparks) {
    const p = applyEasing(opts.easing, (now - (spark.startedAt ?? now)) / opts.duration);
    for (let i = 0; i < opts.sparkCount; i++) {
      const s = sparkSegment(sparkAngle(i, opts.sparkCount), p, opts);
      ctx.beginPath();
      ctx.moveTo(spark.x + s.x1, spark.y + s.y1);
      ctx.lineTo(spark.x + s.x2, spark.y + s.y2);
      ctx.stroke();
    }
  }
}

function useCanvasSize(canvasRef: React.RefObject<HTMLCanvasElement | null>, enabled: boolean) {
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!enabled || !canvas || !host) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = host.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    return () => observer.disconnect();
  }, [canvasRef, enabled]);
}

function ClickSpark({
  ref,
  className,
  children,
  color = "var(--primary)",
  sparkSize = 10,
  sparkRadius = 18,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1,
  onPointerDown,
  onClick,
  ...props
}: ClickSparkProps) {
  const reduced = useShouldReduceMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const sparksRef = React.useRef<Spark[]>([]);
  const [count, setCount] = React.useState(0);
  useCanvasSize(canvasRef, !reduced);

  const spawn = (x: number, y: number) => {
    sparksRef.current.push({ x, y, startedAt: null });
    setCount(sparksRef.current.length);
  };

  const onFrame = (now: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    for (const spark of sparksRef.current) spark.startedAt ??= now;
    sparksRef.current = sparksRef.current.filter((s) => now - (s.startedAt ?? now) < duration);
    if (canvas && ctx) {
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const strokeStyle = rootRef.current ? resolveCssColor(rootRef.current, color) : color;
      drawSparks(ctx, sparksRef.current, now, {
        sparkSize,
        sparkRadius,
        sparkCount,
        duration,
        easing,
        extraScale,
        strokeStyle,
      });
    }
    if (sparksRef.current.length !== count) setCount(sparksRef.current.length);
  };
  useFrameLoop(onFrame, !reduced && count > 0);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (reduced || event.button !== 0 || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    spawn(event.clientX - rect.left, event.clientY - rect.top);
  };

  // Enter/Espaço geram click sem ponteiro (detail 0): o estalo sai do centro do alvo.
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (reduced || event.detail !== 0 || !rootRef.current) return;
    const root = rootRef.current.getBoundingClientRect();
    const target = (event.target as HTMLElement).getBoundingClientRect();
    spawn(target.left + target.width / 2 - root.left, target.top + target.height / 2 - root.top);
  };

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: a raiz só escuta eventos que sobem dos filhos; não é um controle
    // biome-ignore lint/a11y/useKeyWithClickEvents: o click aqui vem do teclado dos filhos focáveis (detail 0)
    <div
      ref={setRefs}
      data-slot="click-spark"
      data-sparks={count}
      className={cn("relative", className)}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      {...props}
    >
      {children}
      {reduced ? null : (
        // biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas não é focável; o aviso é falso positivo
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          data-slot="click-spark-canvas"
          className="pointer-events-none absolute inset-0 size-full"
        />
      )}
    </div>
  );
}

ClickSpark.displayName = "ClickSpark";

export { ClickSpark };
