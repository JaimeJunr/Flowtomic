/**
 * GlareHover Component - Flowtomic UI
 *
 * Superfície em que um reflexo diagonal atravessa de um canto ao outro quando o
 * ponteiro entra (ou o foco chega). Varredura de duração fixa, não segue o ponteiro.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/glare-hover.md
 */

"use client";

import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  GLARE_ACTIVE_POSITION,
  GLARE_REST_POSITION,
  GLARE_STATIC_POSITION,
  glareGradient,
  sweepTransition,
} from "./glare-hover-utils";

export type GlareHoverProps = React.ComponentProps<"div"> & {
  /** Cor do reflexo (token). @default "var(--background)" */
  glareColor?: string;
  /** Opacidade do reflexo, 0..1. @default 0.5 */
  glareOpacity?: number;
  /** Ângulo da faixa em graus. @default -45 */
  glareAngle?: number;
  /** Tamanho do gradiente em % da superfície. @default 250 */
  glareSize?: number;
  /** Duração da varredura em ms. @default 650 */
  duration?: number;
  /** Só varre na entrada; na saída volta sem animar. @default false */
  playOnce?: boolean;
};

type GlareLayerProps = {
  active: boolean;
  reduced: boolean;
  playOnce: boolean;
  glareColor: string;
  glareOpacity: number;
  glareAngle: number;
  glareSize: number;
  duration: number;
};

function layerStyle(p: GlareLayerProps): React.CSSProperties {
  // Movimento reduzido: reflexo parado com metade da opacidade, só aparece no hover.
  const opacity = p.reduced ? p.glareOpacity / 2 : p.glareOpacity;
  const position = p.active ? GLARE_ACTIVE_POSITION : GLARE_REST_POSITION;
  const sweeps = !p.reduced && !(p.playOnce && !p.active);
  return {
    backgroundImage: glareGradient(p.glareAngle, p.glareColor, opacity),
    backgroundSize: `${p.glareSize}% ${p.glareSize}%`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: p.reduced ? GLARE_STATIC_POSITION : position,
    transition: sweeps ? sweepTransition(p.duration) : "none",
    ...(p.reduced ? { opacity: p.active ? 1 : 0 } : {}),
  };
}

function GlareHover({
  glareColor = "var(--background)",
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  duration = 650,
  playOnce = false,
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: GlareHoverProps) {
  const reduced = useShouldReduceMotion();
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const active = hovered || focused;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: handlers só ativam o efeito visual, sem ação
    <div
      data-slot="glare-hover"
      data-glare={active ? "active" : "idle"}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card text-card-foreground",
        className
      )}
      onPointerEnter={(event) => {
        setHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        onPointerLeave?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        // Foco que passa para outro filho da mesma superfície não encerra o reflexo.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
        onBlur?.(event);
      }}
      {...props}
    >
      <div
        data-slot="glare-hover-glare"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={layerStyle({
          active,
          reduced,
          playOnce,
          glareColor,
          glareOpacity,
          glareAngle,
          glareSize,
          duration,
        })}
      />
      {children}
    </div>
  );
}

GlareHover.displayName = "GlareHover";

export { GlareHover };
