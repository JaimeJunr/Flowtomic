/**
 * StarBorder Component - Flowtomic UI
 *
 * Botão (ou link) com borda fina percorrida por um ponto de luz que deixa um
 * rastro desbotando. No hover/foco a estrela dá uma volta rápida; ao clicar,
 * um pulso corre pela borda nos dois sentidos a partir do ponto clicado.
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/star-border.md
 */

"use client";

import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  PULSE_MS,
  type Pulse,
  PulseGroup,
  StarGroup,
  type TrackGeometry,
  useInnerSize,
  useOrbit,
} from "./star-border-parts";
import {
  clampStars,
  glowFilter,
  perimeterFraction,
  type StarDirection,
  type StarHoverMode,
  starGlow,
  starOpacity,
} from "./star-border-utils";

type StarBorderOwnProps = {
  /** Cor da estrela. Token. */
  color?: string;
  /** Segundos por volta. */
  duration?: number;
  direction?: StarDirection;
  /** 1..6, espaçadas igualmente. */
  stars?: number;
  /** Fração do perímetro ocupada pelo rastro, 0..1. */
  trailLength?: number;
  /** px */
  thickness?: number;
  /** px; maior que metade da altura vira pílula. */
  radius?: number;
  /** 0..1 */
  glow?: number;
  hover?: StarHoverMode;
  clickPulse?: boolean;
};

export type StarBorderProps<T extends React.ElementType = "button"> = StarBorderOwnProps & {
  as?: T;
  ref?: React.Ref<HTMLElement>;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof StarBorderOwnProps | "as">;

type PolymorphicInner = StarBorderOwnProps &
  Omit<React.ComponentPropsWithoutRef<"button">, keyof StarBorderOwnProps> & {
    as?: React.ElementType;
    ref?: React.Ref<HTMLElement>;
  };

export function StarBorder<T extends React.ElementType = "button">(props: StarBorderProps<T>) {
  const {
    as,
    ref,
    color = "var(--primary)",
    duration = 4,
    direction = "clockwise",
    stars = 1,
    trailLength = 0.3,
    thickness = 1,
    radius = 12,
    glow = 0.6,
    hover = "lap",
    clickPulse = true,
    className,
    style,
    children,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    ...rest
  } = props as unknown as PolymorphicInner;
  const Comp: React.ElementType = as ?? "button";
  const reduced = useShouldReduceMotion();
  const innerRef = React.useRef<HTMLElement | null>(null);
  const trackRef = React.useRef<SVGSVGElement | null>(null);
  const size = useInnerSize(innerRef);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [lapCount, setLapCount] = React.useState(0);
  const [pulses, setPulses] = React.useState<Pulse[]>([]);
  const pulseId = React.useRef(0);
  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const count = clampStars(stars);
  const active = hovered || focused;
  const geometry: TrackGeometry = { size, thickness, radius };
  const filter = glowFilter(starGlow(hover, glow, active), color);
  const opacity = starOpacity(hover, active);

  useOrbit({
    trackRef,
    active: !reduced,
    duration,
    direction,
    trailLength,
    count,
    lapRequested: lapCount > 0,
  });

  const setRefs = (node: HTMLElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.RefObject<HTMLElement | null>).current = node;
  };

  const startLap = () => {
    if (hover === "lap" && !reduced) setLapCount((n) => n + 1);
  };

  const spawnPulse = (event: React.PointerEvent<HTMLElement>) => {
    if (!clickPulse || reduced) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left - thickness / 2;
    const y = event.clientY - box.top - thickness / 2;
    const fraction = perimeterFraction(
      { width: size.width + thickness, height: size.height + thickness },
      radius,
      x,
      y
    );
    const id = ++pulseId.current;
    setPulses((list) => [...list, { id, fraction }]);
    timers.current.push(
      window.setTimeout(() => setPulses((list) => list.filter((p) => p.id !== id)), PULSE_MS)
    );
  };

  return (
    <Comp
      {...(Comp === "button" && !("type" in rest) ? { type: "button" } : {})}
      {...rest}
      ref={setRefs}
      data-slot="star-border"
      data-hover={hover}
      data-animated={reduced ? "false" : "true"}
      style={{ borderRadius: radius, borderWidth: thickness, ...style }}
      className={cn(
        "relative inline-flex cursor-pointer select-none items-center justify-center border border-border bg-card px-5 py-2.5 font-medium text-card-foreground text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      onPointerDown={(e: React.PointerEvent<HTMLElement>) => {
        onPointerDown?.(e as React.PointerEvent<HTMLButtonElement>);
        spawnPulse(e);
      }}
      onPointerEnter={(e: React.PointerEvent<HTMLButtonElement>) => {
        onPointerEnter?.(e);
        setHovered(true);
        startLap();
      }}
      onPointerLeave={(e: React.PointerEvent<HTMLButtonElement>) => {
        onPointerLeave?.(e);
        setHovered(false);
      }}
      onFocus={(e: React.FocusEvent<HTMLButtonElement>) => {
        onFocus?.(e);
        setFocused(true);
        startLap();
      }}
      onBlur={(e: React.FocusEvent<HTMLButtonElement>) => {
        onBlur?.(e);
        setFocused(false);
      }}
    >
      <svg
        ref={trackRef}
        data-slot="star-border-track"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
        width="100%"
        height="100%"
      >
        {Array.from({ length: count }, (_, i) => (
          <StarGroup
            // biome-ignore lint/suspicious/noArrayIndexKey: as estrelas são posições fixas
            key={i}
            index={i}
            count={count}
            geometry={geometry}
            color={color}
            trailLength={trailLength}
            direction={direction}
            filter={filter}
            opacity={opacity}
          />
        ))}
        {pulses.map((p) => (
          <PulseGroup key={p.id} pulse={p} geometry={geometry} color={color} />
        ))}
      </svg>
      <span className="relative">{children}</span>
    </Comp>
  );
}

StarBorder.displayName = "StarBorder";
