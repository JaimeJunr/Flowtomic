/**
 * ElectricBorder Component - Flowtomic UI
 *
 * Card cuja borda é uma linha elétrica: o contorno arredondado treme em ondulações irregulares,
 * com um brilho suave em volta. O conteúdo fica parado.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/electric-border.md
 */

"use client";

import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { displacePoint, roundedRectPerimeter, roundedRectPoints } from "./electric-border-utils";

export type ElectricBorderProps = React.ComponentProps<"div"> & {
  /** Cor do traço e do brilho. Token. @default "var(--primary)" */
  color?: string;
  /** Multiplicador de velocidade. @default 1 */
  speed?: number;
  /** Intensidade da deformação; 0 = sem tremor. @default 0.12 */
  chaos?: number;
  /** Raio dos cantos, em px. @default 16 */
  radius?: number;
  /** Espessura do traço, em px. @default 2 */
  thickness?: number;
};

// O canvas passa da raiz para caber o brilho e a deformação.
const PAD = 24;
const STEP = 4;
const GLOW_BLUR = 12;
const GLOW_ALPHA = 0.6;
const TIME_SCALE = 1.5;

type Size = { w: number; h: number };

function useBoxSize(ref: React.RefObject<HTMLDivElement | null>): Size {
  const [size, setSize] = React.useState<Size>({ w: 0, h: 0 });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

function useOnScreen(ref: React.RefObject<HTMLDivElement | null>): boolean {
  const [visible, setVisible] = React.useState(true);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

function tracePath(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]): void {
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
}

type DrawParams = Pick<Required<ElectricBorderProps>, "radius" | "thickness"> & {
  size: Size;
  time: number;
  chaos: number;
  stroke: string;
};

function drawFrame(ctx: CanvasRenderingContext2D, params: DrawParams): void {
  const { size, radius, thickness, time, chaos, stroke } = params;
  ctx.clearRect(0, 0, size.w + PAD * 2, size.h + PAD * 2);
  const base = roundedRectPoints(size.w, size.h, radius, STEP);
  if (base.length === 0) return;
  const length = roundedRectPerimeter(size.w, size.h, radius);
  const points = base.map((p) => {
    const d = displacePoint(p, length, time, chaos);
    return { x: d.x + PAD, y: d.y + PAD };
  });
  ctx.lineWidth = thickness;
  ctx.strokeStyle = stroke;
  ctx.save();
  ctx.shadowColor = stroke;
  ctx.shadowBlur = GLOW_BLUR;
  ctx.globalAlpha = GLOW_ALPHA;
  tracePath(ctx, points);
  ctx.stroke();
  ctx.restore();
  tracePath(ctx, points);
  ctx.stroke();
}

function ElectricBorder({
  color = "var(--primary)",
  speed = 1,
  chaos = 0.12,
  radius = 16,
  thickness = 2,
  className,
  style,
  children,
  ref,
  ...props
}: ElectricBorderProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const swatchRef = React.useRef<HTMLSpanElement | null>(null);
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [fallback, setFallback] = React.useState(false);
  const reduced = useShouldReduceMotion();
  const size = useBoxSize(rootRef);
  const visible = useOnScreen(rootRef);

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  React.useEffect(() => {
    ctxRef.current = canvasRef.current?.getContext("2d") ?? null;
    setFallback(ctxRef.current === null);
  }, []);

  const draw = (now: number, amount: number) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.round((size.w + PAD * 2) * dpr);
    const height = Math.round((size.h + PAD * 2) * dpr);
    // Atribuir width/height limpa o canvas e custa caro; só quando muda.
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // getComputedStyle aceita var(--token), que o canvas não resolve sozinho.
    const stroke = swatchRef.current ? getComputedStyle(swatchRef.current).color || color : color;
    drawFrame(ctx, {
      size,
      radius,
      thickness,
      chaos: amount,
      time: (now / 1000) * speed * TIME_SCALE,
      stroke,
    });
  };

  useFrameLoop((now) => draw(now, chaos), !reduced && visible && !fallback);

  // biome-ignore lint/correctness/useExhaustiveDependencies: redesenha o quadro estático quando as props mudam
  React.useEffect(() => {
    if (reduced && !fallback) draw(0, 0);
  }, [reduced, fallback, size, radius, thickness, color]);

  return (
    <div
      ref={setRefs}
      data-slot="electric-border"
      data-animated={String(!reduced)}
      data-fallback={fallback ? "true" : undefined}
      className={cn("relative p-4", className)}
      style={{
        borderRadius: radius,
        ...(fallback ? { borderStyle: "solid", borderWidth: thickness, borderColor: color } : null),
        ...style,
      }}
      {...props}
    >
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não é focável */}
      <canvas
        ref={canvasRef}
        data-slot="electric-border-canvas"
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: -PAD,
          top: -PAD,
          width: size.w + PAD * 2,
          height: size.h + PAD * 2,
        }}
      />
      <span ref={swatchRef} aria-hidden="true" className="hidden" style={{ color }} />
      {children}
    </div>
  );
}

ElectricBorder.displayName = "ElectricBorder";

export { ElectricBorder };
