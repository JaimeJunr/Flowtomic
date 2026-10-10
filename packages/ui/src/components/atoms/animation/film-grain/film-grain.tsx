/**
 * FilmGrain Component - Flowtomic UI
 *
 * Camada de granulado de filme (com poeira, riscos, varredura e tremor opcionais)
 * por cima de uma área ou da tela toda.
 * Implementação clean room — spec em docs/clean-room/react-bits/film-grain.md
 */

"use client";

import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  dustCount,
  type GridSize,
  grainValue,
  gridSize,
  mulberry32,
  scanlineAlpha,
  scratchChance,
} from "./film-grain-utils";

export type FilmGrainBlendMode = "normal" | "overlay" | "soft-light" | "multiply" | "screen";

export type FilmGrainProps = React.ComponentProps<"div"> & {
  /** Força do grão, 0..1. @default 0.15 */
  opacity?: number;
  /** Tamanho do grão em px CSS. @default 1 */
  size?: number;
  /** Trocas por segundo. 0 = grão parado. @default 24 */
  fps?: number;
  /** @default "overlay" */
  blendMode?: FilmGrainBlendMode;
  /** 0 = grão fino e suave; 1 = duro. @default 0.6 */
  contrast?: number;
  /** Densidade de poeira, 0..1. @default 0 */
  dust?: number;
  /** Frequência de riscos verticais, 0..1. @default 0 */
  scratches?: number;
  /** Intensidade das linhas de varredura, 0..1. @default 0 */
  scanlines?: number;
  /** Tremor da intensidade, 0..1. @default 0 */
  flicker?: number;
  /** Cobre a tela toda (position: fixed) em vez do pai posicionado. @default false */
  fixed?: boolean;
};

type Scratch = { x: number; until: number };
type Effects = Required<
  Pick<FilmGrainProps, "contrast" | "dust" | "scratches" | "scanlines" | "flicker" | "opacity">
>;
type Runtime = { rng: () => number; scratches: Scratch[]; scroll: number; last: number | null };

// Tons extremos para poeira e riscos: intensidade de pixel, não token de tema.
const LIGHT = "oklch(1 0 0 / 0.8)";
const DARK = "oklch(0 0 0 / 0.8)";

function paintGrain(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  fx: Effects,
  rng: () => number
) {
  const image = ctx.createImageData(cols, rows);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = grainValue(rng(), fx.contrast);
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}

function paintDust(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  dust: number,
  rng: () => number
) {
  const count = dustCount(dust, cols * rows);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = rng() < 0.5 ? LIGHT : DARK;
    ctx.fillRect(
      Math.floor(rng() * cols),
      Math.floor(rng() * rows),
      1 + Math.floor(rng() * 2),
      1 + Math.floor(rng() * 2)
    );
  }
  ctx.lineWidth = 1;
  for (let i = 0; i < Math.ceil(count / 8); i++) {
    const x = rng() * cols;
    const y = rng() * rows;
    ctx.strokeStyle = rng() < 0.5 ? LIGHT : DARK;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + (rng() - 0.5) * 8,
      y + (rng() - 0.5) * 8,
      x + (rng() - 0.5) * 12,
      y + (rng() - 0.5) * 12
    );
    ctx.stroke();
  }
}

function paintScratches(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  scratches: number,
  now: number,
  rt: Runtime
) {
  const dt = rt.last === null ? 0 : now - rt.last;
  if (rt.rng() < scratchChance(scratches, dt)) {
    rt.scratches.push({ x: Math.floor(rt.rng() * cols), until: now + 1000 + rt.rng() * 2000 });
  }
  rt.scratches = rt.scratches.filter((s) => s.until > now);
  ctx.fillStyle = LIGHT;
  for (const s of rt.scratches) ctx.fillRect(s.x + Math.round(rt.rng() * 2 - 1), 0, 1, rows);
}

function paintScanlines(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  scanlines: number,
  rt: Runtime
) {
  ctx.fillStyle = `oklch(0 0 0 / ${scanlineAlpha(scanlines)})`;
  rt.scroll = (rt.scroll + 1) % 3;
  for (let y = rt.scroll; y < rows; y += 3) ctx.fillRect(0, y, cols, 1);
}

function FilmGrain({
  opacity = 0.15,
  size = 1,
  fps = 24,
  blendMode = "overlay",
  contrast = 0.6,
  dust = 0,
  scratches = 0,
  scanlines = 0,
  flicker = 0,
  fixed = false,
  className,
  style,
  ref,
  ...props
}: FilmGrainProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const gridRef = React.useRef<GridSize>({ cols: 0, rows: 0 });
  const runtime = React.useRef<Runtime>({
    rng: mulberry32(0x9e3779b9),
    scratches: [],
    scroll: 0,
    last: null,
  });
  const [grid, setGrid] = React.useState<GridSize>({ cols: 0, rows: 0 });
  const [inView, setInView] = React.useState(true);
  const reduced = useShouldReduceMotion();
  const isStatic = reduced || fps <= 0;

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const draw = (now: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // createImageData(0, 0) lança no browser: mínimo de 1 pixel.
    const cols = Math.max(1, gridRef.current.cols);
    const rows = Math.max(1, gridRef.current.rows);
    if (canvas.width !== cols) canvas.width = cols;
    if (canvas.height !== rows) canvas.height = rows;
    const rt = runtime.current;
    paintGrain(ctx, cols, rows, { contrast, dust, scratches, scanlines, flicker, opacity }, rt.rng);
    if (dust > 0) paintDust(ctx, cols, rows, dust, rt.rng);
    if (!reduced && scratches > 0) paintScratches(ctx, cols, rows, scratches, now, rt);
    if (!reduced && scanlines > 0) paintScanlines(ctx, cols, rows, scanlines, rt);
    if (!reduced && flicker > 0 && rootRef.current) {
      rootRef.current.style.opacity = String(opacity * (1 + flicker * 0.2 * (rt.rng() * 2 - 1)));
    }
    rt.last = now;
  };

  const measure = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = gridSize(rect.width, rect.height, size);
    gridRef.current = next;
    setGrid((prev) => (prev.cols === next.cols && prev.rows === next.rows ? prev : next));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: measure só depende de size
  React.useLayoutEffect(() => {
    measure();
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [size]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) setInView(entry.isIntersecting);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (flicker <= 0 && rootRef.current) rootRef.current.style.opacity = String(opacity);
  }, [flicker, opacity]);

  // Parado: redesenha só quando algo que muda a imagem muda.
  // biome-ignore lint/correctness/useExhaustiveDependencies: draw lê as mesmas props listadas
  React.useEffect(() => {
    if (isStatic) draw(performance.now());
  }, [isStatic, grid, contrast, dust, scanlines, opacity]);

  useFrameLoop(draw, !isStatic && inView, Math.max(fps, 1));

  return (
    <div
      ref={setRefs}
      data-slot="film-grain"
      data-fixed={fixed}
      aria-hidden="true"
      className={cn("pointer-events-none inset-0", fixed ? "fixed" : "absolute", className)}
      style={{ mixBlendMode: blendMode, opacity, ...style }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        data-slot="film-grain-canvas"
        className="size-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

FilmGrain.displayName = "FilmGrain";

export { FilmGrain };
