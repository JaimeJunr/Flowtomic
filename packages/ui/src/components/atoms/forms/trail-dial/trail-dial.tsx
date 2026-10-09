/**
 * TrailDial Component - Flowtomic UI
 *
 * Mostrador circular arrastável: a conta anda no arco, deixa uma cauda de cometa
 * em velocidade, segue pela inércia ao soltar e assenta numa mola.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/trail-dial.md
 */

"use client";

import { type AnimationPlaybackControls, animate, useMotionValue } from "motion/react";
import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  angleToValue,
  arcPath,
  bounceForVelocity,
  clampDragAngle,
  cometSegments,
  energyFromAngularVelocity,
  pointToAngle,
  releaseTarget,
  snapToStep,
  valueToAngle,
} from "./trail-dial-utils";

export type TrailDialProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Unidade ao lado do número; "" esconde. */
  unit?: string;
  "aria-label"?: string;
  /** Diâmetro em px. */
  size?: number;
  /** Abertura angular do arco, em graus. */
  sweep?: number;
  thickness?: number;
  /** 0..100. Quão rápida a mola assenta. */
  speed?: number;
  tapBounce?: number;
  flickBounce?: number;
  /** 0 = a conta para onde soltou. */
  momentum?: number;
  /** Graus de cauda em velocidade máxima. */
  cometReach?: number;
  /** Px extras de espessura na cabeça da cauda. */
  cometWidth?: number;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number, detail: { velocity: number; bounce: number }) => void;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
  previousAngle: number;
};

const DRAG_THRESHOLD_PX = 3;
// Toques perto do centro não são no arco.
const DEAD_CENTER_RATIO = 0.35;
const PAGE_STEPS = 10;
const ENERGY_DECAY_MS = 300;
const VELOCITY_SMOOTHING = 0.35;
// Parado por mais que isso antes de soltar = sem velocidade.
const STALE_VELOCITY_MS = 100;

const SLIDER_KEYS = [
  "ArrowRight",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
];

function springDuration(speed: number): number {
  return 0.9 - (Math.min(100, Math.max(0, speed)) / 100) * 0.7;
}

function keyboardTarget(key: string, value: number, min: number, max: number, step: number) {
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return value + step;
    case "ArrowLeft":
    case "ArrowDown":
      return value - step;
    case "PageUp":
      return value + step * PAGE_STEPS;
    case "PageDown":
      return value - step * PAGE_STEPS;
    case "Home":
      return min;
    default:
      return max;
  }
}

function TrailDial({
  ref,
  className,
  style,
  value: valueProp,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  "aria-label": ariaLabel = "Nível",
  size = 200,
  sweep = 320,
  thickness = 6,
  speed = 25,
  tapBounce = 0.2,
  flickBounce = 0.1,
  momentum = 1,
  cometReach = 180,
  cometWidth = 10,
  disabled = false,
  onValueChange,
  onValueCommit,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: TrailDialProps) {
  const reduced = useShouldReduceMotion();
  const [inner, setInner] = React.useState(() => snapToStep(defaultValue, min, max, step));
  const value = valueProp ?? inner;
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // `display` é o valor contínuo que a mola anima; `value` é o confirmado (com step).
  const display = useMotionValue(value);
  const [shown, setShown] = React.useState(value);
  const playback = React.useRef<AnimationPlaybackControls | null>(null);
  const animatedTo = React.useRef(value);
  const drag = React.useRef<DragState | null>(null);

  const motion = React.useRef({ angVel: 0, lastAngle: 0, lastTime: 0, lastMove: 0 });
  const energyRef = React.useRef({ energy: 0, direction: 1 as 1 | -1 });
  const [comet, setComet] = React.useState({ energy: 0, direction: 1 as 1 | -1 });

  const radius = size / 2 - (thickness + cometWidth) / 2 - 2;
  const center = size / 2;
  const half = sweep / 2;
  const angleOf = React.useCallback(
    (v: number) => valueToAngle(v, min, max, sweep),
    [min, max, sweep]
  );

  const trackMotion = React.useCallback((angle: number) => {
    const m = motion.current;
    const now = performance.now();
    const dt = now - m.lastTime;
    const delta = angle - m.lastAngle;
    m.lastAngle = angle;
    m.lastTime = now;
    if (dt < 1 || delta === 0) return;
    m.lastMove = now;
    m.angVel += ((delta / dt) * 1000 - m.angVel) * VELOCITY_SMOOTHING;
    const energy = Math.max(energyRef.current.energy, energyFromAngularVelocity(m.angVel));
    energyRef.current = { energy, direction: delta > 0 ? 1 : -1 };
    setComet(energyRef.current);
  }, []);

  React.useEffect(() => {
    motion.current.lastAngle = angleOf(display.get());
    return display.on("change", (v) => {
      setShown(v);
      if (reduced) return;
      trackMotion(angleOf(v));
    });
  }, [display, angleOf, reduced, trackMotion]);

  useFrameLoop(
    (now) => {
      const m = motion.current;
      // Sem movimento novo, a velocidade medida esfria junto com a cauda.
      if (now - m.lastMove > ENERGY_DECAY_MS) m.angVel = 0;
      const decay = 16.7 / ENERGY_DECAY_MS;
      const energy = Math.max(0, energyRef.current.energy - decay);
      energyRef.current = { ...energyRef.current, energy };
      setComet(energyRef.current);
    },
    !reduced && comet.energy > 0
  );

  const moveDisplay = React.useCallback(
    (to: number, bounce: number) => {
      playback.current?.stop();
      animatedTo.current = to;
      if (reduced) return display.jump(to);
      playback.current = animate(display, to, {
        type: "spring",
        bounce,
        visualDuration: springDuration(speed),
      });
    },
    [display, reduced, speed]
  );

  const applyValue = React.useCallback(
    (next: number, velocity: number, bounce: number) => {
      const snapped = snapToStep(next, min, max, step);
      if (snapped !== valueRef.current) {
        valueRef.current = snapped;
        if (valueProp === undefined) setInner(snapped);
        onValueChange?.(snapped);
      }
      moveDisplay(snapped, bounce);
      onValueCommit?.(snapped, { velocity, bounce });
    },
    [min, max, step, valueProp, moveDisplay, onValueChange, onValueCommit]
  );

  // Valor controlado vindo de fora anima com a mola do toque.
  React.useEffect(() => {
    if (drag.current?.moved || animatedTo.current === value) return;
    moveDisplay(value, tapBounce);
  }, [value, tapBounce, moveDisplay]);

  const pointerAngle = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(event.clientX - cx, event.clientY - cy);
    return { dist, rect, angle: pointToAngle(event.clientX, event.clientY, cx, cy) };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (disabled || event.button !== 0) return;
    const { dist, rect, angle } = pointerAngle(event);
    if (dist < (rect.width / 2) * DEAD_CENTER_RATIO) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      previousAngle: clampDragAngle(angle, angle, sweep),
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - current.startX, event.clientY - current.startY);
    if (!current.moved && moved <= DRAG_THRESHOLD_PX) return;
    if (!current.moved) playback.current?.stop();
    current.moved = true;
    const { angle } = pointerAngle(event);
    const clamped = clampDragAngle(angle, current.previousAngle, sweep);
    current.previousAngle = clamped;
    const next = angleToValue(clamped, min, max, sweep, step);
    animatedTo.current = next;
    display.jump(next);
    if (next !== valueRef.current) {
      valueRef.current = next;
      if (valueProp === undefined) setInner(next);
      onValueChange?.(next);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerUp?.(event);
    const current = drag.current;
    drag.current = null;
    if (!current || current.pointerId !== event.pointerId) return;
    if (!current.moved) {
      const { angle } = pointerAngle(event);
      const target = angleToValue(clampDragAngle(angle, angle, sweep), min, max, sweep, step);
      return applyValue(target, 0, tapBounce);
    }
    releaseDrag();
  };

  const releaseDrag = () => {
    const m = motion.current;
    const fresh = performance.now() - m.lastMove <= STALE_VELOCITY_MS;
    const velocity = reduced || !fresh ? 0 : (m.angVel / sweep) * (max - min);
    const inertia = reduced ? 0 : momentum;
    const target = releaseTarget(valueRef.current, velocity, inertia, min, max, step);
    const bounce = reduced ? 0 : bounceForVelocity(velocity, min, max, tapBounce, flickBounce);
    applyValue(target, velocity, bounce);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (disabled || event.defaultPrevented || !SLIDER_KEYS.includes(event.key)) return;
    event.preventDefault();
    const next = keyboardTarget(event.key, valueRef.current, min, max, step);
    if (snapToStep(next, min, max, step) === valueRef.current) return;
    applyValue(next, 0, tapBounce);
  };

  const shownClamped = Math.min(max, Math.max(min, shown));
  const headAngle = angleOf(shownClamped);
  const head = {
    x: center + radius * Math.sin((headAngle * Math.PI) / 180),
    y: center - radius * Math.cos((headAngle * Math.PI) / 180),
  };
  const text = String(snapToStep(shownClamped, min, max, step));
  const valueText = unit ? `${value} ${unit}` : String(value);
  const segments = reduced
    ? []
    : cometSegments({
        angle: headAngle,
        direction: comet.direction,
        energy: comet.energy,
        reach: cometReach,
        thickness,
        width: cometWidth,
        sweep,
      });

  return (
    <div
      ref={ref}
      data-slot="trail-dial"
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      aria-disabled={disabled || undefined}
      aria-orientation="horizontal"
      className={cn(
        "relative inline-block touch-none select-none rounded-full outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing",
        className
      )}
      style={{ width: size, height: size, ...style }}
      {...props}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        aria-hidden="true"
        className="absolute inset-0"
      >
        <path
          data-slot="trail-dial-arc"
          d={arcPath(center, center, radius, -half, half)}
          className="stroke-muted"
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        <path
          data-slot="trail-dial-arc-lit"
          d={arcPath(center, center, radius, -half, headAngle)}
          className="stroke-primary"
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        {segments.length > 0 && (
          <g data-slot="trail-dial-comet">
            {segments.map((segment) => (
              <path
                key={segment.from}
                d={arcPath(center, center, radius, segment.from, segment.to)}
                className="stroke-primary"
                strokeWidth={segment.width}
                strokeLinecap="round"
                opacity={segment.opacity}
              />
            ))}
          </g>
        )}
        <circle
          data-slot="trail-dial-bead"
          cx={head.x}
          cy={head.y}
          r={thickness * 1.2}
          className="fill-primary"
        />
      </svg>
      <div
        data-slot="trail-dial-value"
        className="pointer-events-none absolute inset-0 flex items-baseline justify-center gap-1 pt-[38%] font-mono tabular-nums"
        style={{ fontSize: size * 0.2 }}
      >
        <span className="text-foreground">{text}</span>
        {unit && (
          <span className="text-muted-foreground" style={{ fontSize: "0.5em" }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

TrailDial.displayName = "TrailDial";

export { TrailDial };
