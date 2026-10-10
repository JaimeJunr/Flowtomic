/**
 * Crosshair Component - Flowtomic UI
 *
 * Duas linhas finas cruzam no ponteiro e o seguem com atraso, com as coordenadas
 * nas bordas. Sobre botões e links a mira enquadra o alvo e mostra a medida;
 * cada clique solta um anel que se expande e some.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/crosshair.md
 */

"use client";

import { motion } from "motion/react";
import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  follow,
  formatCoord,
  isHoverPointer,
  type LockBox,
  lockBox,
  sameLockBox,
  segmentTransform,
} from "./crosshair-utils";

export type CrosshairProps = React.ComponentProps<"div"> & {
  /** Cor das linhas, rótulos e cantoneiras. @default "var(--muted-foreground)" */
  color?: string;
  /** @default 1 */
  thickness?: number;
  /** 0..1 @default 0.85 */
  opacity?: number;
  /** @default "solid" */
  lineStyle?: "solid" | "dashed" | "dotted";
  /** px vazios em volta do ponteiro. @default 0 */
  gap?: number;
  /** 0 = gruda no ponteiro. @default 0.35 */
  smoothing?: number;
  /** @default true */
  showCoordinates?: boolean;
  /** @default "lock" */
  targetEffect?: "lock" | "none";
  /** @default "a, button, [data-crosshair-target]" */
  targetSelector?: string;
  /** @default true */
  clickPulse?: boolean;
  /** Esconde o cursor do sistema e desenha um ponto. @default false */
  hideCursor?: boolean;
};

type Pulse = { id: number; x: number; y: number };
type Point = { x: number; y: number };

const LOCK_PAD = 4;
const PULSE_MS = 500;
const PULSE_SIZE = 48;
const SETTLED_PX = 0.1;
const FIRST_FRAME_MS = 16;

function hasReachedTarget(a: Point, b: Point): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) < SETTLED_PX;
}

type SegmentsProps = { axis: "x" | "y"; gap: number; thickness: number; lineStyle: string };

function LineSegments({ axis, gap, thickness, lineStyle }: SegmentsProps) {
  const horizontal = axis === "x";
  const border = {
    [horizontal ? "borderTopWidth" : "borderLeftWidth"]: `${thickness}px`,
    [horizontal ? "borderTopStyle" : "borderLeftStyle"]: lineStyle,
    borderColor: "currentColor",
  };
  const base = horizontal ? "h-0 w-full" : "h-full w-0";
  return (
    <div
      data-slot={`crosshair-line-${axis}`}
      className={horizontal ? "absolute inset-x-0 top-0 h-0" : "absolute inset-y-0 left-0 w-0"}
      style={{ transform: horizontal ? "translateY(var(--cy))" : "translateX(var(--cx))" }}
    >
      {(["before", "after"] as const).map((side) => (
        <div
          key={side}
          className={cn("absolute top-0 left-0", base)}
          style={{ ...border, transform: segmentTransform(axis, side, gap) }}
        />
      ))}
    </div>
  );
}

const CORNERS = [
  "top-0 left-0 border-t border-l",
  "top-0 right-0 border-t border-r",
  "right-0 bottom-0 border-r border-b",
  "bottom-0 left-0 border-b border-l",
] as const;

function LockFrame({ box, animated }: { box: LockBox; animated: boolean }) {
  return (
    <motion.div
      data-slot="crosshair-lock"
      className="absolute top-0 left-0"
      initial={false}
      animate={{ x: box.x, y: box.y, width: box.width, height: box.height }}
      transition={{ duration: animated ? 0.15 : 0 }}
    >
      {CORNERS.map((corner) => (
        <span
          key={corner}
          className={cn("absolute size-2", corner)}
          style={{ borderColor: "currentColor" }}
        />
      ))}
      <span className="absolute top-full left-0 mt-1 font-mono text-[10px] whitespace-nowrap">
        {box.label}
      </span>
    </motion.div>
  );
}

function PulseRing({ pulse, thickness }: { pulse: Pulse; thickness: number }) {
  return (
    <span data-slot="crosshair-pulse" className="absolute" style={{ left: pulse.x, top: pulse.y }}>
      <motion.span
        className="absolute block rounded-full border"
        style={{ x: "-50%", y: "-50%", borderWidth: thickness, borderColor: "currentColor" }}
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{ width: PULSE_SIZE, height: PULSE_SIZE, opacity: 0 }}
        transition={{ duration: PULSE_MS / 1000, ease: "easeOut" }}
      />
    </span>
  );
}

function usePulses(enabled: boolean) {
  const [pulses, setPulses] = React.useState<Pulse[]>([]);
  const nextId = React.useRef(0);
  const timers = React.useRef(new Set<ReturnType<typeof setTimeout>>());
  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
    };
  }, []);
  const emit = React.useCallback(
    (x: number, y: number) => {
      if (!enabled) return;
      const id = nextId.current++;
      setPulses((list) => [...list, { id, x, y }]);
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        setPulses((list) => list.filter((p) => p.id !== id));
      }, PULSE_MS);
      timers.current.add(timer);
    },
    [enabled]
  );
  return { pulses, emit };
}

function Crosshair({
  ref,
  className,
  children,
  color = "var(--muted-foreground)",
  thickness = 1,
  opacity = 0.85,
  lineStyle = "solid",
  gap = 0,
  smoothing = 0.35,
  showCoordinates = true,
  targetEffect = "lock",
  targetSelector = "a, button, [data-crosshair-target]",
  clickPulse = true,
  hideCursor = false,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  ...props
}: CrosshairProps) {
  const reduced = useShouldReduceMotion();
  const layerRef = React.useRef<HTMLDivElement | null>(null);
  const labelX = React.useRef<HTMLSpanElement | null>(null);
  const labelY = React.useRef<HTMLSpanElement | null>(null);
  const target = React.useRef<Point>({ x: 0, y: 0 });
  const current = React.useRef<Point>({ x: 0, y: 0 });
  const lastFrame = React.useRef(0);
  const [visible, setVisible] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [lock, setLock] = React.useState<LockBox | null>(null);
  const { pulses, emit } = usePulses(clickPulse && !reduced);
  const instant = reduced || smoothing === 0;

  const paint = () => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.style.setProperty("--cx", `${current.current.x}px`);
    layer.style.setProperty("--cy", `${current.current.y}px`);
  };

  const onFrame = (now: number) => {
    const dt = lastFrame.current ? now - lastFrame.current : FIRST_FRAME_MS;
    lastFrame.current = now;
    const c = current.current;
    const t = target.current;
    c.x = follow(c.x, t.x, smoothing, dt);
    c.y = follow(c.y, t.y, smoothing, dt);
    if (hasReachedTarget(c, t)) {
      Object.assign(c, t);
      lastFrame.current = 0;
      setRunning(false);
    }
    paint();
  };
  useFrameLoop(onFrame, running && !instant);

  const locate = (event: React.PointerEvent<HTMLDivElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const updateLock = (event: React.PointerEvent<HTMLDivElement>) => {
    const root = event.currentTarget;
    const hit =
      targetEffect === "lock" ? (event.target as Element).closest?.(targetSelector) : null;
    const next = hit && hit !== root && root.contains(hit) ? hit : null;
    const area = root.getBoundingClientRect();
    const box = next ? lockBox(next.getBoundingClientRect(), area, LOCK_PAD) : null;
    setLock((prev) => (sameLockBox(prev, box) ? prev : box));
  };

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (!isHoverPointer(event.pointerType)) return;
    const point = locate(event);
    target.current = point;
    if (labelX.current) labelX.current.textContent = `x ${formatCoord(point.x)}`;
    if (labelY.current) labelY.current.textContent = `y ${formatCoord(point.y)}`;
    if (instant || !visible) {
      current.current = { ...point };
      paint();
    } else {
      setRunning(true);
    }
    setVisible(true);
    updateLock(event);
  };

  const handleLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    setVisible(false);
    setLock(null);
    setRunning(false);
  };

  const handleDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (!isHoverPointer(event.pointerType)) return;
    const { x, y } = locate(event);
    emit(x, y);
  };

  return (
    <div
      ref={ref}
      data-slot="crosshair"
      data-visible={visible ? "true" : "false"}
      className={cn("relative overflow-hidden", hideCursor && "cursor-none", className)}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerDown={handleDown}
      {...props}
    >
      {children}
      <div
        ref={layerRef}
        aria-hidden="true"
        data-slot="crosshair-layer"
        className="pointer-events-none absolute inset-0 transition-opacity duration-150"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="absolute inset-0" style={{ color, opacity }}>
          <LineSegments axis="x" gap={gap} thickness={thickness} lineStyle={lineStyle} />
          <LineSegments axis="y" gap={gap} thickness={thickness} lineStyle={lineStyle} />
          {showCoordinates && (
            <>
              <span
                ref={labelX}
                data-slot="crosshair-label-x"
                className="absolute top-0 left-0 font-mono text-[10px]"
                style={{ transform: "translate(calc(var(--cx) + 6px), 2px)" }}
              />
              <span
                ref={labelY}
                data-slot="crosshair-label-y"
                className="absolute top-0 left-0 font-mono text-[10px]"
                style={{ transform: "translate(4px, calc(var(--cy) + 6px))" }}
              />
            </>
          )}
          {hideCursor && (
            <span
              data-slot="crosshair-dot"
              className="absolute top-0 left-0 size-1 rounded-full"
              style={{
                backgroundColor: "currentColor",
                transform: "translate(calc(var(--cx) - 2px), calc(var(--cy) - 2px))",
              }}
            />
          )}
          {lock && <LockFrame box={lock} animated={!reduced} />}
          {pulses.map((pulse) => (
            <PulseRing key={pulse.id} pulse={pulse} thickness={thickness} />
          ))}
        </div>
      </div>
    </div>
  );
}

Crosshair.displayName = "Crosshair";

export { Crosshair };
