/**
 * CircularText Component - Flowtomic UI
 *
 * Texto curto disposto em círculo, como um selo, girando devagar e sem parar,
 * com conteúdo fixo opcional no centro. O hover pode acelerar, desacelerar ou
 * pausar o giro. Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/circular-text.md
 */

"use client";

import { motion, useAnimationFrame, useMotionValue } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type CircularHoverMode = "none" | "slow" | "fast" | "pause";

type CircularTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Diâmetro em px. */
  size?: number;
  /** Uma volta completa, em ms. */
  durationMs?: number;
  /** O que o hover faz com o giro. */
  onHover?: CircularHoverMode;
  /** Conteúdo fixo no centro (não gira). Se for decorativo, quem usa marca. */
  children?: React.ReactNode;
};

const HOVER_SPEED: Record<CircularHoverMode, number> = { none: 1, slow: 0.25, fast: 4, pause: 0 };
// Constante de tempo da suavização: a velocidade muda em ~0,4 s, sem pular de ângulo.
const SPEED_EASE_MS = 120;

/** Cada caractere ocupa uma fatia igual de 360°. */
function charAngle(index: number, count: number): number {
  return (index * 360) / count;
}

function hoverSpeed(mode: CircularHoverMode, hovering: boolean): number {
  return hovering ? HOVER_SPEED[mode] : 1;
}

/** Aproxima a velocidade da meta de forma exponencial, independente do tamanho do quadro. */
function advanceSpeed(current: number, target: number, deltaMs: number): number {
  return current + (target - current) * (1 - Math.exp(-deltaMs / SPEED_EASE_MS));
}

function CircularText({
  text,
  size = 160,
  durationMs = 20000,
  onHover = "none",
  className,
  style,
  children,
  onPointerEnter,
  onPointerLeave,
  ref,
  ...props
}: CircularTextProps) {
  if (text.length === 0) {
    throw new Error(
      `CircularText: invalid text, received ${JSON.stringify(text)}, expected non-empty string`
    );
  }

  const reduceMotion = useShouldReduceMotion();
  const [hovering, setHovering] = React.useState(false);
  const rotation = useMotionValue(0);
  const speedRef = React.useRef(1);
  const target = hoverSpeed(onHover, hovering);
  const chars = Array.from(text);

  useAnimationFrame((_time, delta) => {
    if (reduceMotion) return;
    speedRef.current = advanceSpeed(speedRef.current, target, delta);
    rotation.set((rotation.get() + (delta * speedRef.current * 360) / durationMs) % 360);
  });

  return (
    <div
      ref={ref}
      role="img"
      aria-label={text}
      data-slot="circular-text"
      data-spinning={!reduceMotion && target > 0}
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size, ...style }}
      onPointerEnter={(event) => {
        setHovering(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovering(false);
        onPointerLeave?.(event);
      }}
      {...props}
    >
      <motion.div
        aria-hidden="true"
        data-slot="circular-text-spinner"
        className="absolute inset-0"
        style={{ rotate: rotation }}
      >
        {chars.map((char, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: o mesmo caractere se repete; a posição é a identidade
            key={index}
            data-slot="circular-text-char"
            className="absolute inset-0 flex justify-center whitespace-pre"
            style={{ transform: `rotate(${charAngle(index, chars.length)}deg)` }}
          >
            {char}
          </span>
        ))}
      </motion.div>
      {children ? (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      ) : null}
    </div>
  );
}

CircularText.displayName = "CircularText";

export type { CircularTextProps };
export { advanceSpeed, CircularText, charAngle, hoverSpeed };
