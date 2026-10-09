/**
 * SpotlightCard Component - Flowtomic UI
 *
 * Cartão sobre o qual uma luz suave segue o ponteiro e a borda acende no trecho
 * mais perto dele. Cartões lado a lado dividem a mesma luz (proximity).
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/spotlight-card.md
 */

"use client";

import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  ambientPosition,
  BORDER_MASK_STYLE,
  beamGradient,
  follow,
  lightColor,
  lightGradient,
  proximityFade,
  type SpotlightShape,
  type SpotlightTone,
  subscribePointer,
} from "./spotlight-card-utils";

export type SpotlightCardProps = React.ComponentProps<"div"> & {
  /** Intensidade da luz, 0..1. @default 0.15 */
  intensity?: number;
  /** Raio da luz em px. @default 240 */
  size?: number;
  /** 0 = disco nítido; 1 = brilho que some desde o centro. @default 0.7 */
  softness?: number;
  /** @default "circle" */
  shape?: SpotlightShape;
  /** Quanto a borda acende perto do ponteiro, 0..1. @default 0.6 */
  borderGlow?: number;
  /** px fora do cartão em que a luz já começa. 0 = só com hover. @default 80 */
  proximity?: number;
  /** 0 = gruda no ponteiro; maior = flutua atrás. @default 0.3 */
  smoothing?: number;
  /** A luz vaga sozinha quando ninguém aponta. @default false */
  ambient?: boolean;
  /** Pressionar faz a luz inchar e clarear. @default true */
  flare?: boolean;
  /** Cor da luz: marca (Urucum) ou neutra (primeiro plano do tema). */
  tone?: SpotlightTone;
};

const FLARE_SIZE_GAIN = 0.25;
const FLARE_INTENSITY_GAIN = 0.6;
const FLARE_RELEASE_MS = 300;
const FLARE_SMOOTHING = 0.15;
const AMBIENT_OPACITY = 0.8;
const REDUCED_OPACITY = 0.5;
const SETTLED = 0.005;
const FIRST_FRAME_MS = 16;

type LightState = { x: number; y: number; o: number; flare: number };

function writeVars(el: HTMLElement, light: LightState, shape: SpotlightShape, base: BaseLight) {
  const { x, y, o, flare } = light;
  el.style.setProperty("--sx", `${x}px`);
  el.style.setProperty("--sy", `${y}px`);
  el.style.setProperty("--so", String(o));
  el.style.setProperty("--ss", `${base.size * (1 + FLARE_SIZE_GAIN * flare)}px`);
  el.style.setProperty(
    "--si",
    String(Math.min(1, base.intensity * (1 + FLARE_INTENSITY_GAIN * flare)))
  );
  if (shape !== "beam") return;
  const { width, height } = el.getBoundingClientRect();
  const beam = beamGradient(x, y, width, height);
  el.style.setProperty("--bx", `${beam.anchorX}px`);
  el.style.setProperty("--brx", `${beam.radiusX}px`);
  el.style.setProperty("--bry", `${beam.radiusY}px`);
}

type BaseLight = { size: number; intensity: number };

function useSpotlight(props: {
  rootRef: React.RefObject<HTMLDivElement | null>;
  shape: SpotlightShape;
  proximity: number;
  smoothing: number;
  ambient: boolean;
  base: BaseLight;
}) {
  const { rootRef, shape, proximity, smoothing, ambient, base } = props;
  const reduced = useShouldReduceMotion();
  const [lit, setLit] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const target = React.useRef({ x: 0, y: 0, o: 0, flare: 0 });
  const current = React.useRef<LightState>({ x: 0, y: 0, o: 0, flare: 0 });
  const pointerNear = React.useRef(false);
  const lastFrame = React.useRef(0);
  const baseRef = React.useRef(base);
  baseRef.current = base;

  const paint = React.useCallback(() => {
    if (rootRef.current) writeVars(rootRef.current, current.current, shape, baseRef.current);
  }, [rootRef, shape]);

  const onPointer = React.useCallback(
    (clientX: number, clientY: number) => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const fade = proximityFade(rect, clientX, clientY, proximity);
      pointerNear.current = fade > 0;
      if (reduced) {
        const light = {
          x: rect.width / 2,
          y: rect.height * 0.15,
          o: fade > 0 ? REDUCED_OPACITY : 0,
        };
        current.current = { ...light, flare: 0 };
        paint();
        setLit(fade > 0);
        return;
      }
      const t = target.current;
      t.x = clientX - rect.left;
      t.y = clientY - rect.top;
      t.o = fade > 0 ? fade : ambient ? AMBIENT_OPACITY : 0;
      if (current.current.o < SETTLED) Object.assign(current.current, { x: t.x, y: t.y });
      setLit(t.o > 0);
      setRunning(true);
    },
    [rootRef, proximity, reduced, ambient, paint]
  );

  React.useEffect(() => subscribePointer(onPointer), [onPointer]);

  React.useEffect(() => {
    if (!ambient || reduced) return;
    setLit(true);
    setRunning(true);
  }, [ambient, reduced]);

  const onFrame = (now: number) => {
    const el = rootRef.current;
    if (!el) return;
    const dt = lastFrame.current ? now - lastFrame.current : FIRST_FRAME_MS;
    lastFrame.current = now;
    const t = target.current;
    if (ambient && !pointerNear.current) {
      const { width, height } = el.getBoundingClientRect();
      Object.assign(t, ambientPosition(now, width, height), { o: AMBIENT_OPACITY });
    }
    const c = current.current;
    c.x = follow(c.x, t.x, smoothing, dt);
    c.y = follow(c.y, t.y, smoothing, dt);
    c.o = follow(c.o, t.o, smoothing, dt);
    c.flare = follow(c.flare, t.flare, FLARE_SMOOTHING, dt);
    if (t.o === 0 && c.o < SETTLED) c.o = 0;
    paint();
    const settled = Math.abs(c.o - t.o) < SETTLED && Math.abs(c.flare - t.flare) < SETTLED;
    if (!ambient && settled && Math.hypot(c.x - t.x, c.y - t.y) < 0.5) {
      lastFrame.current = 0;
      setRunning(false);
    }
  };
  useFrameLoop(onFrame, running && !reduced);

  const setFlare = React.useCallback((value: number) => {
    target.current.flare = value;
    setRunning(true);
  }, []);

  return { lit, reduced, setFlare };
}

function SpotlightCard({
  ref,
  className,
  style,
  children,
  intensity = 0.15,
  size = 240,
  softness = 0.7,
  shape = "circle",
  borderGlow = 0.6,
  proximity = 80,
  smoothing = 0.3,
  ambient = false,
  flare = true,
  tone = "brand",
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  ...props
}: SpotlightCardProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const base = React.useMemo(() => ({ size, intensity }), [size, intensity]);
  const { lit, reduced, setFlare } = useSpotlight({
    rootRef,
    shape,
    proximity,
    smoothing,
    ambient,
    base,
  });
  const [flaring, setFlaring] = React.useState(false);
  const releaseTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const canFlare = flare && !reduced;

  const press = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (!canFlare) return;
    clearTimeout(releaseTimer.current);
    setFlaring(true);
    setFlare(1);
  };
  const release =
    (handler?: (event: React.PointerEvent<HTMLDivElement>) => void) =>
    (event: React.PointerEvent<HTMLDivElement>) => {
      handler?.(event);
      clearTimeout(releaseTimer.current);
      releaseTimer.current = setTimeout(() => {
        setFlaring(false);
        setFlare(0);
      }, FLARE_RELEASE_MS);
    };
  React.useEffect(() => () => clearTimeout(releaseTimer.current), []);

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const lightLayer = lightGradient(shape, softness, lightColor("calc(var(--si) * 100%)", tone));
  const borderLayer = lightGradient(
    shape,
    softness,
    lightColor(`${clampPercent(borderGlow)}%`, tone)
  );

  return (
    <div
      ref={setRefs}
      data-slot="spotlight-card"
      data-lit={lit ? "true" : "false"}
      data-flare={flaring ? "true" : "false"}
      className={cn("relative rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      style={
        {
          "--ss": `${size}px`,
          "--si": String(intensity),
          "--so": "0",
          "--sx": "50%",
          "--sy": "50%",
          ...style,
        } as React.CSSProperties
      }
      onPointerDown={press}
      onPointerUp={release(onPointerUp)}
      onPointerLeave={release(onPointerLeave)}
      onPointerCancel={release(onPointerCancel)}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        data-slot="spotlight-card-light"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: lightLayer, opacity: "var(--so)" }}
      />
      <span
        aria-hidden="true"
        data-slot="spotlight-card-border"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          padding: "1px",
          background: borderLayer,
          opacity: "var(--so)",
          ...BORDER_MASK_STYLE,
        }}
      />
    </div>
  );
}

function clampPercent(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100);
}

SpotlightCard.displayName = "SpotlightCard";

export { SpotlightCard };
export type { SpotlightTone };
