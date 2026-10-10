/**
 * CursorGrid Component - Flowtomic UI
 *
 * Grade invisível que acende em volta do ponteiro, deixa rastro ao apagar e
 * solta um anel de células a cada clique.
 * Implementação clean room — spec em docs/clean-room/react-bits/cursor-grid.md
 */

"use client";

import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  cellAlpha,
  cellsInRadius,
  type FalloffKind,
  falloffCurve,
  gridSize,
  isPulseDone,
  pulseHitsCell,
  pulseRadius,
  resolveCssColor,
} from "./cursor-grid-utils";

export type CursorGridProps = React.ComponentProps<"div"> & {
  /** Lado da célula, px. @default 56 */
  cellSize?: number;
  /** Cor dos traços (token CSS). @default "var(--primary)" */
  color?: string;
  /** Raio em volta do ponteiro que acende, px. @default 140 */
  radius?: number;
  /** @default "smooth" */
  falloff?: FalloffKind;
  /** Tempo aceso antes de começar a apagar, ms. @default 400 */
  holdTime?: number;
  /** Tempo para apagar do máximo a 0, ms. @default 800 */
  fadeDuration?: number;
  /** @default 1 */
  lineWidth?: number;
  /** @default 1 */
  maxOpacity?: number;
  /** Preenchimento leve das células acesas; 0 = sem preenchimento. @default 0 */
  fillOpacity?: number;
  /** Grade fraca sempre visível; 0 = escondida. @default 0 */
  gridOpacity?: number;
  /** Raio dos cantos da célula, px. @default 0 */
  cellRadius?: number;
  /** Clique solta um anel de células. @default true */
  clickPulse?: boolean;
  /** Velocidade do anel, px/s. @default 600 */
  pulseSpeed?: number;
};

type Cell = { peak: number; lastLitAt: number };
type Pulse = { x: number; y: number; startedAt: number | null };
type Point = { x: number; y: number };

/** Grade fraca desenhada uma vez quando há movimento reduzido. */
const REDUCED_GRID_OPACITY = 0.08;

function applyCanvasSize(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(width * dpr);
  const h = Math.round(height * dpr);
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  return dpr;
}

function traceCell(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, r: number) {
  ctx.beginPath();
  if (r > 0) ctx.roundRect(x, y, size, size, r);
  else ctx.rect(x, y, size, size);
}

function CursorGrid({
  ref,
  className,
  children,
  cellSize = 56,
  color = "var(--primary)",
  radius = 140,
  falloff = "smooth",
  holdTime = 400,
  fadeDuration = 800,
  lineWidth = 1,
  maxOpacity = 1,
  fillOpacity = 0,
  gridOpacity = 0,
  cellRadius = 0,
  clickPulse = true,
  pulseSpeed = 600,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  ...props
}: CursorGridProps) {
  const reduced = useShouldReduceMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const cellsRef = React.useRef(new Map<number, Cell>());
  const pulsesRef = React.useRef<Pulse[]>([]);
  // Posição pendente: o brilho é aplicado no próximo quadro, no relógio do rAF.
  const pointerRef = React.useRef<Point | null>(null);
  const lastNowRef = React.useRef(0);
  const [live, setLive] = React.useState(false);

  const paint = (now: number) => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;
    const { width, height } = root.getBoundingClientRect();
    const dpr = applyCanvasSize(canvas, width, height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const base = reduced ? gridOpacity || REDUCED_GRID_OPACITY : gridOpacity;
    const { cols, rows } = gridSize(width, height, cellSize);
    ctx.strokeStyle = ctx.fillStyle = resolveCssColor(root, color);
    ctx.lineWidth = lineWidth;
    const lit = (index: number) => {
      const cell = cellsRef.current.get(index);
      return cell ? cellAlpha(cell.peak, now - cell.lastLitAt, holdTime, fadeDuration) : 0;
    };
    const inset = lineWidth / 2;
    const drawCell = (index: number) => {
      const glow = lit(index) * maxOpacity;
      const alpha = Math.max(base, glow);
      if (alpha <= 0.002) return;
      const x = (index % cols) * cellSize + inset;
      const y = Math.floor(index / cols) * cellSize + inset;
      const side = cellSize - lineWidth;
      traceCell(ctx, x, y, side, cellRadius);
      ctx.globalAlpha = alpha;
      ctx.stroke();
      if (fillOpacity > 0 && glow > 0.002) {
        ctx.globalAlpha = glow * fillOpacity;
        ctx.fill();
      }
    };
    const indexes =
      base > 0 ? Array.from({ length: cols * rows }, (_, i) => i) : [...cellsRef.current.keys()];
    for (const index of indexes) drawCell(index);
    ctx.globalAlpha = 1;
  };

  const light = (index: number, brightness: number, now: number) => {
    const cell = cellsRef.current.get(index);
    const current = cell ? cellAlpha(cell.peak, now - cell.lastLitAt, holdTime, fadeDuration) : 0;
    if (brightness >= current) cellsRef.current.set(index, { peak: brightness, lastLitAt: now });
  };

  const lightAroundPointer = (now: number, cols: number, rows: number) => {
    const p = pointerRef.current;
    pointerRef.current = null;
    if (!p) return;
    for (const c of cellsInRadius(cols, rows, cellSize, p, radius)) {
      light(c.index, falloffCurve(falloff, 1 - c.dist / radius), now);
    }
  };

  const lightPulses = (now: number, width: number, height: number, cols: number, rows: number) => {
    pulsesRef.current = pulsesRef.current.filter((pulse) => {
      pulse.startedAt ??= now;
      const r = pulseRadius(pulseSpeed, now - pulse.startedAt);
      if (isPulseDone(r, width, height)) return false;
      for (let index = 0; index < cols * rows; index++) {
        const cx = ((index % cols) + 0.5) * cellSize;
        const cy = (Math.floor(index / cols) + 0.5) * cellSize;
        if (pulseHitsCell(r, Math.hypot(cx - pulse.x, cy - pulse.y), cellSize))
          light(index, 1, now);
      }
      return true;
    });
  };

  const onFrame = (now: number) => {
    lastNowRef.current = now;
    const root = rootRef.current;
    if (!root) return;
    const { width, height } = root.getBoundingClientRect();
    const { cols, rows } = gridSize(width, height, cellSize);
    lightAroundPointer(now, cols, rows);
    lightPulses(now, width, height, cols, rows);
    for (const [index, cell] of cellsRef.current) {
      if (cellAlpha(cell.peak, now - cell.lastLitAt, holdTime, fadeDuration) <= 0) {
        cellsRef.current.delete(index);
      }
    }
    paint(now);
    if (!cellsRef.current.size && !pulsesRef.current.length && !pointerRef.current) setLive(false);
  };
  useFrameLoop(onFrame, !reduced && live);

  const paintRef = React.useRef(paint);
  React.useEffect(() => {
    paintRef.current = paint;
  });
  // Redesenha a grade fraca quando o visual muda e quando a área muda de tamanho.
  // biome-ignore lint/correctness/useExhaustiveDependencies: paint é lido por ref; só o visual estático dispara
  React.useEffect(() => {
    paintRef.current(lastNowRef.current);
    const host = rootRef.current;
    if (!host) return;
    const observer = new ResizeObserver(() => paintRef.current(lastNowRef.current));
    observer.observe(host);
    return () => observer.disconnect();
  }, [reduced, gridOpacity, cellSize, color, cellRadius, lineWidth]);

  const point = (event: React.PointerEvent<HTMLDivElement>): Point | null => {
    const root = rootRef.current;
    if (!root) return null;
    const rect = root.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (reduced || (event.pointerType !== "mouse" && event.pointerType !== "pen")) return;
    pointerRef.current = point(event);
    setLive(true);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    pointerRef.current = null;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    const p = point(event);
    if (reduced || !p) return;
    pointerRef.current = p;
    if (clickPulse) pulsesRef.current.push({ ...p, startedAt: null });
    setLive(true);
  };

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <div
      ref={setRefs}
      data-slot="cursor-grid"
      className={cn("relative overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      {...props}
    >
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas não é focável; o aviso é falso positivo */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-slot="cursor-grid-canvas"
        className="pointer-events-none absolute inset-0 size-full"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

CursorGrid.displayName = "CursorGrid";

export { CursorGrid };
