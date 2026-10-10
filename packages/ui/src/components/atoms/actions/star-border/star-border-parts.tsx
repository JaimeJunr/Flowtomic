"use client";

import { motion } from "motion/react";
import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import {
  type BoxSize,
  lapBoost,
  orbitPhase,
  type StarDirection,
  trailSegments,
} from "./star-border-utils";

export const PULSE_MS = 600;
const PULSE_LENGTH = 0.06;
const PULSE_TRAVEL = 0.2;

export type Pulse = { id: number; fraction: number };

export type TrackGeometry = {
  size: BoxSize;
  thickness: number;
  radius: number;
};

function rectAttrs({ size, thickness, radius }: TrackGeometry) {
  const width = size.width + thickness;
  const height = size.height + thickness;
  return {
    x: -thickness / 2,
    y: -thickness / 2,
    width,
    height,
    rx: Math.max(0, Math.min(radius, width / 2, height / 2)),
    fill: "none" as const,
    pathLength: 1,
  };
}

/** Mede a caixa interna (sem a borda) do elemento; o ResizeObserver cobre mudança de conteúdo e de fonte. */
export function useInnerSize(ref: React.RefObject<HTMLElement | null>): BoxSize {
  const [size, setSize] = React.useState<BoxSize>({ width: 0, height: 0 });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

type StarGroupProps = {
  index: number;
  count: number;
  geometry: TrackGeometry;
  color: string;
  trailLength: number;
  direction: StarDirection;
  filter: string;
  opacity: number;
};

export function StarGroup({
  index,
  count,
  geometry,
  color,
  trailLength,
  direction,
  filter,
  opacity,
}: StarGroupProps) {
  const segments = trailSegments(trailLength, index / count, direction);
  return (
    <g
      data-slot="star-border-star"
      style={{ filter, opacity, transition: "opacity 200ms, filter 200ms" }}
    >
      {segments.map((seg) => (
        <rect
          key={seg.length}
          {...rectAttrs(geometry)}
          stroke={color}
          strokeWidth={geometry.thickness}
          strokeOpacity={seg.opacity}
          strokeLinecap="round"
          strokeDasharray={seg.dashArray}
          strokeDashoffset={seg.dashOffset}
        />
      ))}
    </g>
  );
}

/** Dois traços curtos que saem do ponto clicado em sentidos opostos e somem. */
export function PulseGroup({
  pulse,
  geometry,
  color,
}: {
  pulse: Pulse;
  geometry: TrackGeometry;
  color: string;
}) {
  const f = pulse.fraction;
  const dash = `${PULSE_LENGTH} ${1 - PULSE_LENGTH}`;
  const common = {
    ...rectAttrs(geometry),
    stroke: color,
    strokeWidth: geometry.thickness,
    strokeLinecap: "round" as const,
    strokeDasharray: dash,
  };
  const ease = { duration: PULSE_MS / 1000, ease: "easeOut" as const };
  return (
    <g data-slot="star-border-pulse">
      <motion.rect
        {...common}
        initial={{ strokeDashoffset: -f, opacity: 1 }}
        animate={{ strokeDashoffset: -(f + PULSE_TRAVEL), opacity: 0 }}
        transition={ease}
      />
      <motion.rect
        {...common}
        initial={{ strokeDashoffset: -(f - PULSE_LENGTH), opacity: 1 }}
        animate={{ strokeDashoffset: -(f - PULSE_LENGTH - PULSE_TRAVEL), opacity: 0 }}
        transition={ease}
      />
    </g>
  );
}

type OrbitConfig = {
  trackRef: React.RefObject<SVGSVGElement | null>;
  active: boolean;
  duration: number;
  direction: StarDirection;
  trailLength: number;
  count: number;
  lapRequested: boolean;
};

/** Atualiza os dashoffsets direto no DOM a cada quadro: re-renderizar 60 vezes por segundo seria desperdício. */
export function useOrbit(config: OrbitConfig) {
  const { trackRef, active, duration, direction, trailLength, count, lapRequested } = config;
  const startRef = React.useRef<number | null>(null);
  const lapStartRef = React.useRef<number | null>(null);
  const lapSeenRef = React.useRef(false);

  React.useEffect(() => {
    if (lapRequested && !lapSeenRef.current) lapStartRef.current = Number.NEGATIVE_INFINITY;
    lapSeenRef.current = lapRequested;
  }, [lapRequested]);

  useFrameLoop((now) => {
    const track = trackRef.current;
    if (!track) return;
    if (startRef.current === null) startRef.current = now;
    if (lapStartRef.current === Number.NEGATIVE_INFINITY) lapStartRef.current = now;
    const lap = lapStartRef.current === null ? 0 : lapBoost(now - lapStartRef.current);
    const sign = direction === "clockwise" ? 1 : -1;
    const phase = orbitPhase(now - startRef.current, duration) + lap;
    const groups = track.querySelectorAll('[data-slot="star-border-star"]');
    groups.forEach((group, i) => {
      const head = sign * phase + i / count;
      const segments = trailSegments(trailLength, ((head % 1) + 1) % 1, direction);
      group.querySelectorAll("rect").forEach((rect, k) => {
        rect.setAttribute("stroke-dashoffset", String(segments[k].dashOffset));
      });
    });
  }, active);
}
