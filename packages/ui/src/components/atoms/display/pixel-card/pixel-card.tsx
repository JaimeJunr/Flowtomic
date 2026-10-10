/**
 * PixelCard Component - Flowtomic UI
 *
 * Cartão cuja grade de pixels acende do centro para fora no hover ou foco e
 * cintila até a pessoa sair.
 * Implementação clean room — spec em docs/clean-room/react-bits/pixel-card.md
 */

"use client";

import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  allPixelsGone,
  buildPixels,
  mulberry32,
  type Pixel,
  type PixelMode,
  settlePixel,
  stepPixel,
} from "./pixel-card-utils";

export type PixelCardVariant = "default" | "primary" | "accent";

export type PixelCardProps = React.ComponentProps<"div"> & {
  /** @default "default" */
  variant?: PixelCardVariant;
  /** Distância entre pixels em px. Padrão por variante: 5, 6, 5. */
  gap?: number;
  /** Velocidade 0..100. Padrão por variante: 35, 25, 30. */
  speed?: number;
  /** Não reage a foco. @default false */
  noFocus?: boolean;
};

type VariantConfig = { tokens: string[]; gap: number; speed: number; border: string };

const VARIANTS: Record<PixelCardVariant, VariantConfig> = {
  default: {
    tokens: ["--muted-foreground", "--border", "--muted"],
    gap: 5,
    speed: 35,
    border: "",
  },
  primary: {
    tokens: ["--primary", "--accent", "--secondary"],
    gap: 6,
    speed: 25,
    border: "border-primary/40",
  },
  accent: {
    tokens: ["--accent", "--primary", "--muted"],
    gap: 5,
    speed: 30,
    border: "border-accent/40",
  },
};

type Metrics = { width: number; height: number; dpr: number };

const isHoverPointer = (event: React.PointerEvent) =>
  event.pointerType === "mouse" || event.pointerType === "pen";

function readColors(root: HTMLElement, tokens: string[]): string[] {
  const styles = getComputedStyle(root);
  // currentColor é válido no canvas e evita fillStyle vazio quando o token falta.
  return tokens.map((token) => styles.getPropertyValue(token).trim() || "currentColor");
}

function paintPixels(
  ctx: CanvasRenderingContext2D,
  pixels: Pixel[],
  colors: string[],
  metrics: Metrics,
  gap: number
) {
  ctx.setTransform(metrics.dpr, 0, 0, metrics.dpr, 0, 0);
  ctx.clearRect(0, 0, metrics.width, metrics.height);
  for (const pixel of pixels) {
    if (pixel.size <= 0) continue;
    ctx.fillStyle = colors[pixel.color] ?? "currentColor";
    const offset = (gap - pixel.size) / 2;
    ctx.fillRect(pixel.x + offset, pixel.y + offset, pixel.size, pixel.size);
  }
}

function PixelCard({
  variant = "default",
  gap,
  speed,
  noFocus = false,
  className,
  children,
  ref,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: PixelCardProps) {
  const config = VARIANTS[variant];
  const resolvedGap = gap ?? config.gap;
  const resolvedSpeed = speed ?? config.speed;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const pixelsRef = React.useRef<Pixel[]>([]);
  const colorsRef = React.useRef<string[]>([]);
  const metricsRef = React.useRef<Metrics>({ width: 0, height: 0, dpr: 1 });
  const modeRef = React.useRef<PixelMode>("disappear");
  const rand = React.useRef(mulberry32(0x51ed270b));
  const [running, setRunning] = React.useState(false);
  const reduced = useShouldReduceMotion();

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const paint = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    paintPixels(ctx, pixelsRef.current, colorsRef.current, metricsRef.current, resolvedGap);
  };

  const draw = () => {
    const mode = modeRef.current;
    pixelsRef.current = pixelsRef.current.map((pixel) => stepPixel(pixel, mode));
    paint();
    if (mode === "disappear" && allPixelsGone(pixelsRef.current)) setRunning(false);
  };

  const request = (visible: boolean) => {
    modeRef.current = visible ? "appear" : "disappear";
    if (reduced) {
      pixelsRef.current = pixelsRef.current.map((pixel) => settlePixel(pixel, visible));
      paint();
      setRunning(visible);
    } else if (visible) {
      setRunning(true);
    }
  };

  const measure = () => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const rect = root.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    metricsRef.current = { width: rect.width, height: rect.height, dpr };
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    colorsRef.current = readColors(root, config.tokens);
    pixelsRef.current = buildPixels(
      rect.width,
      rect.height,
      resolvedGap,
      config.tokens.length,
      rand.current,
      resolvedSpeed
    );
    if (reduced && modeRef.current === "appear") {
      pixelsRef.current = pixelsRef.current.map((pixel) => settlePixel(pixel, true));
    }
    paint();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: measure só depende de gap, speed, variante e movimento reduzido
  React.useLayoutEffect(() => {
    measure();
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [resolvedGap, resolvedSpeed, variant, reduced]);

  useFrameLoop(draw, running && !reduced, 60);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: efeito decorativo de hover; o conteúdo é do filho
    <div
      ref={setRefs}
      data-slot="pixel-card"
      data-variant={variant}
      data-active={running}
      className={cn(
        "relative isolate grid aspect-[4/5] w-72 place-items-center overflow-hidden rounded-3xl border bg-card",
        config.border,
        className
      )}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (isHoverPointer(event)) request(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (isHoverPointer(event)) request(false);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!noFocus) request(true);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        const next = event.relatedTarget as Node | null;
        if (!noFocus && !event.currentTarget.contains(next)) request(false);
      }}
      {...props}
    >
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo não é focável */}
      <canvas
        ref={canvasRef}
        data-slot="pixel-card-canvas"
        aria-hidden="true"
        className="absolute inset-0 size-full"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

PixelCard.displayName = "PixelCard";

export { PixelCard };
