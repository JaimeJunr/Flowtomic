/**
 * EdgeGlowCard Component - Flowtomic UI
 *
 * Cartão escuro cuja borda acende, num cone apontado para o ponteiro, quando
 * ele chega perto. Opcionalmente uma luz percorre a borda uma vez ao montar.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/edge-glow-card.md
 */

"use client";

import { animate, useMotionValue } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  coneMask,
  edgeState,
  glowOpacity,
  RING_GRADIENT,
  RING_MASK_STYLE,
  ringOpacity,
  spreadDegrees,
  validateEdgeGlowProps,
} from "./edge-glow-card-utils";

export type EdgeGlowCardProps = React.ComponentProps<"div"> & {
  /** Quão perto da borda o brilho começa, 0..100 (% da metade do menor lado). @default 30 */
  edgeSensitivity?: number;
  /** Raio dos cantos em px. @default 28 */
  radius?: number;
  /** Quanto o brilho vaza para fora, px. @default 40 */
  glowRadius?: number;
  /** Multiplicador de opacidade, 0.1..3. @default 1 */
  intensity?: number;
  /** Largura do cone em %, 5..45. @default 25 */
  coneSpread?: number;
  /** Volta de luz na montagem. @default false */
  animated?: boolean;
};

const BORDER_WIDTH = 1.5;
const LAP_SECONDS = 1.2;

function writeLight(el: HTMLElement, angle: number, proximity: number) {
  el.style.setProperty("--angle", `${angle}deg`);
  el.style.setProperty("--proximity", String(proximity));
}

type PointerOptions = { sensitivity: number; reach: number };

function usePointerGlow(rootRef: React.RefObject<HTMLDivElement | null>, opts: PointerOptions) {
  const { sensitivity, reach } = opts;
  React.useEffect(() => {
    let frame = 0;
    let latest: { x: number; y: number } | null = null;
    const flush = () => {
      frame = 0;
      const el = rootRef.current;
      if (!el || !latest) return;
      const rect = el.getBoundingClientRect();
      const state = edgeState(rect, latest.x, latest.y, sensitivity, reach);
      writeLight(el, state.angle, state.proximity);
    };
    const onMove = (event: PointerEvent) => {
      latest = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(flush);
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      latest = null;
      const el = rootRef.current;
      if (el) el.style.setProperty("--proximity", "0");
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [rootRef, sensitivity, reach]);
}

function useLightLap(rootRef: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const angle = useMotionValue(0);
  const proximity = useMotionValue(0);
  React.useEffect(() => {
    if (!enabled) return;
    const paint = () => {
      if (rootRef.current) writeLight(rootRef.current, angle.get(), proximity.get());
    };
    const stops = [angle.on("change", paint), proximity.on("change", paint)];
    const controls = [
      animate(angle, 360, { duration: LAP_SECONDS, ease: "linear" }),
      animate(proximity, [0, 1, 0], { duration: LAP_SECONDS, ease: "easeInOut" }),
    ];
    return () => {
      for (const stop of stops) stop();
      for (const control of controls) control.stop();
    };
  }, [enabled, rootRef, angle, proximity]);
}

function EdgeGlowCard({
  ref,
  className,
  style,
  children,
  edgeSensitivity = 30,
  radius = 28,
  glowRadius = 40,
  intensity = 1,
  coneSpread = 25,
  animated = false,
  ...props
}: EdgeGlowCardProps) {
  validateEdgeGlowProps({ edgeSensitivity, coneSpread, intensity });
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const reduced = useShouldReduceMotion();
  usePointerGlow(rootRef, { sensitivity: edgeSensitivity, reach: glowRadius });
  useLightLap(rootRef, animated && !reduced);

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const cone = coneMask(spreadDegrees(coneSpread));
  const ringStyle = {
    padding: `${BORDER_WIDTH}px`,
    borderRadius: "inherit",
    background: RING_GRADIENT,
    ...RING_MASK_STYLE,
  };
  const coneStyle = { maskImage: cone, WebkitMaskImage: cone };

  return (
    <div
      ref={setRefs}
      data-slot="edge-glow-card"
      className={cn("relative isolate text-card-foreground ring-1 ring-border", className)}
      style={
        {
          "--angle": "0deg",
          "--proximity": "0",
          borderRadius: radius,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="edge-glow-card-glow"
        className="pointer-events-none absolute -z-10"
        style={{
          inset: -glowRadius,
          padding: glowRadius,
          borderRadius: radius + glowRadius,
          filter: `blur(${glowRadius / 2}px)`,
          opacity: glowOpacity(intensity),
          ...coneStyle,
        }}
      >
        {/* Cheio, não anel: um anel de 1,5 px desfocado some. O corpo, por cima, cobre o centro. */}
        <span
          className="block size-full"
          style={{ background: RING_GRADIENT, borderRadius: radius }}
        />
      </span>
      <span
        aria-hidden="true"
        data-slot="edge-glow-card-border"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ borderRadius: "inherit", opacity: ringOpacity(intensity), ...coneStyle }}
      >
        <span className="block size-full" style={ringStyle} />
      </span>
      <span
        aria-hidden="true"
        data-slot="edge-glow-card-body"
        className="pointer-events-none absolute -z-10 bg-card"
        style={{ inset: BORDER_WIDTH, borderRadius: radius - BORDER_WIDTH }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

EdgeGlowCard.displayName = "EdgeGlowCard";

export { EdgeGlowCard };
