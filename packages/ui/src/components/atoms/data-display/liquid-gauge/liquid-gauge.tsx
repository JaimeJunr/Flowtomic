/**
 * LiquidGauge Component - Flowtomic UI
 *
 * Tanque de vidro com líquido que corre até o nível, inclina a superfície com a
 * velocidade e balança antes de assentar. O número troca de cor onde a superfície passa.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/liquid-gauge.md
 */

"use client";

import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  clampLevel,
  isSettled,
  keyboardLevel,
  type LiquidState,
  levelFromPointer,
  rippleOffset,
  stepLiquid,
  surfacePolygon,
  surfaceSlope,
} from "./liquid-gauge-utils";

export type LiquidGaugeProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** 0..100. */
  value?: number;
  /** @default 60 */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Clicar/arrastar e teclado definem o nível. @default false */
  interactive?: boolean;
  /** @default true */
  showValue?: boolean;
  disabled?: boolean;
  /** 64×128 / 88×180 / 112×228. @default "default" */
  size?: "sm" | "default" | "lg";
  /** Quantidade de riscos internos. @default 3 */
  ticks?: number;
  /** 0 = ponteiro rígido; maior = mais lento, balança mais. @default 0.15 */
  viscosity?: number;
  /** Inclinação da superfície por velocidade. @default 0.45 */
  tilt?: number;
  /** Quanto o topo/fundo devolve. @default 0.4 */
  splash?: number;
  /** @default "%" */
  unit?: string;
  /** @default "Nível" */
  "aria-label"?: string;
};

const SIZES = {
  sm: { width: 64, height: 128, text: "text-sm" },
  default: { width: 88, height: 180, text: "text-lg" },
  lg: { width: 112, height: 228, text: "text-2xl" },
} as const;

const FIRST_FRAME_MS = 16;
const MS_PER_SECOND = 1000;

type GaugeParts = {
  liquid: HTMLDivElement | null;
  marker: HTMLDivElement | null;
};

function LiquidGauge({
  ref,
  className,
  style,
  value: valueProp,
  defaultValue = 60,
  onValueChange,
  interactive = false,
  showValue = true,
  disabled = false,
  size = "default",
  ticks = 3,
  viscosity = 0.15,
  tilt = 0.45,
  splash = 0.4,
  unit = "%",
  "aria-label": ariaLabel = "Nível",
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: LiquidGaugeProps) {
  const reduced = useShouldReduceMotion();
  const [inner, setInner] = React.useState(() => clampLevel(defaultValue));
  const value = clampLevel(valueProp ?? inner);
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const { width, height, text: textSize } = SIZES[size];

  const physics = React.useRef<LiquidState>({ level: value, velocity: 0 });
  const lastFrame = React.useRef(0);
  const parts = React.useRef<GaugeParts>({ liquid: null, marker: null });
  const dragging = React.useRef(false);
  const [active, setActive] = React.useState(false);

  const paint = React.useCallback(
    (now: number) => {
      const { level, velocity } = physics.current;
      const flat = reduced;
      const slope = flat ? 0 : surfaceSlope(velocity, tilt, height);
      const ripple = flat ? 0 : rippleOffset(velocity, tilt, now);
      if (parts.current.liquid) {
        parts.current.liquid.style.clipPath = surfacePolygon(level, slope, height, ripple);
      }
      if (parts.current.marker) parts.current.marker.style.bottom = `${level}%`;
    },
    [reduced, tilt, height]
  );

  // Repinta a cada render: o React não mexe nesses estilos, só este efeito.
  React.useLayoutEffect(() => {
    if (reduced) physics.current = { level: valueRef.current, velocity: 0 };
    paint(0);
  });

  React.useEffect(() => {
    if (reduced) return setActive(false);
    if (!isSettled(physics.current, value)) setActive(true);
  }, [value, reduced]);

  useFrameLoop((now) => {
    const dt = lastFrame.current ? now - lastFrame.current : FIRST_FRAME_MS;
    lastFrame.current = now;
    const next = stepLiquid(physics.current, valueRef.current, dt / MS_PER_SECOND, {
      viscosity,
      splash,
    });
    if (isSettled(next, valueRef.current)) {
      physics.current = { level: valueRef.current, velocity: 0 };
      lastFrame.current = 0;
      setActive(false);
    } else {
      physics.current = next;
    }
    paint(now);
  }, active && !reduced);

  const commit = (next: number) => {
    if (next === valueRef.current) return;
    valueRef.current = next;
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };

  const commitPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    commit(levelFromPointer(event.clientY, rect.top, rect.height));
  };

  const canInteract = interactive && !disabled;

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (!canInteract || event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragging.current = true;
    commitPointer(event);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (dragging.current && canInteract) commitPointer(event);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerUp?.(event);
    onPointerCancel?.(event);
    dragging.current = false;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!canInteract || event.defaultPrevented) return;
    const next = keyboardLevel(event.key, valueRef.current);
    if (next === null) return;
    event.preventDefault();
    commit(next);
  };

  const label = `${Math.round(value)}${unit}`;
  const number = <span className={cn("font-mono tabular-nums", textSize)}>{label}</span>;

  // O papel é dinâmico (meter/slider), então o Biome não consegue provar o papel estático.
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: role slider quando interativo
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: meter e slider aceitam aria-label
    <div
      ref={ref}
      data-slot="liquid-gauge"
      role={interactive ? "slider" : "meter"}
      tabIndex={canInteract ? 0 : undefined}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={label}
      aria-orientation={interactive ? "vertical" : undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        "relative inline-block touch-none select-none overflow-hidden rounded-lg border bg-muted outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        interactive && !disabled && "cursor-pointer",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      style={{ width, height, ...style }}
      {...props}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {showValue && (
        <div
          data-slot="liquid-gauge-value"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-foreground"
        >
          {number}
        </div>
      )}
      <div
        ref={(node) => {
          parts.current.liquid = node;
        }}
        data-slot="liquid-gauge-liquid"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-primary"
      >
        {showValue && (
          <div
            data-slot="liquid-gauge-value"
            className="absolute inset-0 flex items-center justify-center text-primary-foreground"
          >
            {number}
          </div>
        )}
      </div>
      {Array.from({ length: Math.max(0, ticks) }, (_, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: riscos posicionais de lista fixa
          key={index}
          data-slot="liquid-gauge-tick"
          aria-hidden="true"
          className="pointer-events-none absolute left-0 h-px w-2 bg-border"
          style={{ bottom: `${((index + 1) / (ticks + 1)) * 100}%` }}
        />
      ))}
      {interactive && (
        <div
          ref={(node) => {
            parts.current.marker = node;
          }}
          data-slot="liquid-gauge-marker"
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-0.5 bg-foreground"
        />
      )}
    </div>
  );
}

LiquidGauge.displayName = "LiquidGauge";

export { LiquidGauge };
