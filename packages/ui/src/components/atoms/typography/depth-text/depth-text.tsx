/**
 * DepthText Component - Flowtomic UI
 *
 * Palavra grande extrudada em 3D: atrás da face nítida há cópias empilhadas em Z que formam a
 * lateral, num tom mais escuro. A pilha inclina na direção do ponteiro (só ponteiro fino) com
 * suavidade e, sem ponteiro, orbita devagar. O loop para fora da tela. Com movimento reduzido
 * fica a extrusão estática.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/depth-text.md
 */

"use client";

import { useInView } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type DepthTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Cópias que formam a extrusão. Limitado a 60 para proteger o DOM. */
  layers?: number;
  /** Distância entre cópias, em px. */
  depthPx?: number;
  /** Cor da extrusão. Default: token da marca. */
  depthColor?: string;
  /** Inclinação máxima, em graus. */
  tiltDeg?: number;
  /** 0..1, quanto a rotação "corre atrás" do alvo por quadro. */
  smoothing?: number;
  perspectivePx?: number;
  /** Órbita sutil quando o ponteiro não está sobre a área. */
  autoOrbit?: boolean;
  /** Voltas por segundo da órbita. */
  orbitSpeed?: number;
  shadow?: boolean;
};

type Rotation = { rotateX: number; rotateY: number };

const MIN_LAYERS = 1;
const MAX_LAYERS = 60;
// A cópia mais funda mantém esta fração da cor da extrusão; o resto é escurecido.
const DEEPEST_COLOR_SHARE = 80;
const REST_ROTATION: Rotation = { rotateX: 0, rotateY: 0 };
// Pose base (spec, regra 2b): de frente a extrusão some atrás da face; inclinação e órbita somam a ela.
const BASE_POSE: Rotation = { rotateX: 10, rotateY: -16 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const toTransform = ({ rotateX, rotateY }: Rotation) =>
  `rotateX(${BASE_POSE.rotateX + rotateX}deg) rotateY(${BASE_POSE.rotateY + rotateY}deg)`;

function clampLayers(layers: number): number {
  return clamp(Math.round(layers), MIN_LAYERS, MAX_LAYERS);
}

/** `offset` é a posição do ponteiro relativa ao centro da raiz, em px. */
function rotationTarget(
  offset: { x: number; y: number },
  size: { width: number; height: number },
  tiltDeg: number
): Rotation {
  const nx = size.width > 0 ? clamp(offset.x / (size.width / 2), -1, 1) : 0;
  const ny = size.height > 0 ? clamp(offset.y / (size.height / 2), -1, 1) : 0;
  return { rotateX: 0 - ny * tiltDeg, rotateY: nx * tiltDeg };
}

function stepRotation(current: Rotation, target: Rotation, smoothing: number): Rotation {
  return {
    rotateX: current.rotateX + (target.rotateX - current.rotateX) * smoothing,
    rotateY: current.rotateY + (target.rotateY - current.rotateY) * smoothing,
  };
}

/** Círculo pequeno (±tilt/2) percorrido `speed` voltas por segundo. */
function orbitTarget(seconds: number, speed: number, tiltDeg: number): Rotation {
  const angle = 2 * Math.PI * speed * seconds;
  return { rotateX: Math.sin(angle) * (tiltDeg / 2), rotateY: Math.cos(angle) * (tiltDeg / 2) };
}

function layerStyle(
  index: number,
  layers: number,
  depthPx: number,
  depthColor: string
): { transform: string; color: string } {
  const share = 100 - (100 - DEEPEST_COLOR_SHARE) * (index / layers);
  return {
    transform: `translateZ(${-index * depthPx}px)`,
    color: `color-mix(in oklab, ${depthColor} ${share}%, black)`,
  };
}

function DepthText({
  text,
  layers = 24,
  depthPx = 3,
  depthColor = "var(--primary)",
  tiltDeg = 8,
  smoothing = 0.12,
  perspectivePx = 900,
  autoOrbit = true,
  orbitSpeed = 0.3,
  shadow = true,
  className,
  style,
  ref,
  ...props
}: DepthTextProps) {
  if (text.trim().length === 0) {
    throw new Error(
      `DepthText: invalid text, received ${JSON.stringify(text)}, expected text: string não vazio`
    );
  }

  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(rootRef);
  const reduceMotion = useShouldReduceMotion();
  const layerCount = clampLayers(layers);

  React.useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (reduceMotion || !isInView || !root || !stage) return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let pointer: { x: number; y: number } | null = null;
    let current = REST_ROTATION;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointer = {
        x: event.clientX - (rect.left + rect.width / 2),
        y: event.clientY - (rect.top + rect.height / 2),
      };
    };
    const onLeave = () => {
      pointer = null;
    };
    const tick = (now: number) => {
      let target = REST_ROTATION;
      if (pointer) {
        const rect = root.getBoundingClientRect();
        target = rotationTarget(pointer, rect, tiltDeg);
      } else if (autoOrbit) {
        target = orbitTarget(now / 1000, orbitSpeed, tiltDeg);
      }
      current = stepRotation(current, target, smoothing);
      stage.style.transform = toTransform(current);
      frame = requestAnimationFrame(tick);
    };

    if (finePointer) {
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [reduceMotion, isInView, tiltDeg, smoothing, autoOrbit, orbitSpeed]);

  return (
    <div
      ref={rootRef}
      data-slot="depth-text"
      className={cn("relative inline-block", className)}
      style={{
        perspective: `${perspectivePx}px`,
        // Sombra na raiz: `filter` no palco com preserve-3d achata todas as camadas num plano.
        filter: shadow
          ? `drop-shadow(0 12px 14px color-mix(in oklab, ${depthColor} 35%, transparent))`
          : undefined,
        ...style,
      }}
      {...props}
    >
      <div
        ref={stageRef}
        data-slot="depth-text-stage"
        className="relative [transform-style:preserve-3d]"
        style={{
          transform: toTransform(REST_ROTATION),
        }}
      >
        {Array.from({ length: layerCount }, (_, i) => i + 1)
          .reverse()
          .map((index) => (
            <span
              key={index}
              aria-hidden="true"
              data-slot="depth-text-layer"
              className="pointer-events-none absolute top-0 left-0 select-none whitespace-nowrap"
              style={layerStyle(index, layerCount, depthPx, depthColor)}
            >
              {text}
            </span>
          ))}
        <span data-slot="depth-text-face" className="relative whitespace-nowrap">
          {text}
        </span>
      </div>
    </div>
  );
}

DepthText.displayName = "DepthText";

export type { DepthTextProps };
export { clampLayers, DepthText, layerStyle, orbitTarget, rotationTarget, stepRotation };
