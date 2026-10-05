/**
 * GradientText Component - Flowtomic UI
 *
 * Texto preenchido por um degradê que desliza devagar e sem parar, com moldura
 * arredondada opcional. O padrão usa só tokens do tema; contraste é por conta de quem usa.
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/gradient-text.md
 */

"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type GradientDirection = "horizontal" | "vertical" | "diagonal";

type GradientTextProps = React.ComponentProps<"span"> & {
  /** Cores CSS do degradê (mínimo 2). Padrão: só tokens do tema. */
  colors?: string[];
  /** Duração de um ciclo, em ms. */
  durationMs?: number;
  direction?: GradientDirection;
  /** Vai e volta em vez de recomeçar do início. */
  yoyo?: boolean;
  /** Congela no lugar enquanto o ponteiro está sobre o texto. */
  pauseOnHover?: boolean;
  /** Moldura arredondada com borda de 1px no mesmo degradê. */
  bordered?: boolean;
};

const DEFAULT_COLORS = [
  "var(--primary)",
  "var(--primary-hover)",
  "var(--accent-hover)",
  "var(--primary)",
];
const ANGLES: Record<GradientDirection, number> = { horizontal: 90, vertical: 180, diagonal: 135 };
const BACKGROUND_SIZES: Record<GradientDirection, string> = {
  horizontal: "300% 100%",
  vertical: "100% 300%",
  diagonal: "300% 300%",
};

function resolveAngle(direction: GradientDirection): number {
  return ANGLES[direction];
}

function buildGradient(colors: string[], direction: GradientDirection): string {
  if (colors.length < 2) {
    throw new Error(
      `GradientText: invalid colors, received ${JSON.stringify(colors)}, expected string[] with at least 2 CSS colors`
    );
  }
  return `linear-gradient(${resolveAngle(direction)}deg, ${colors.join(", ")})`;
}

/** Posição do fundo para um progresso de 0 a 100; vertical anda em y, o resto em x. */
function buildPosition(direction: GradientDirection, progress: number): string {
  return direction === "vertical" ? `50% ${progress}%` : `${progress}% 50%`;
}

function GradientText({
  colors = DEFAULT_COLORS,
  durationMs = 8000,
  direction = "horizontal",
  yoyo = true,
  pauseOnHover = false,
  bordered = false,
  className,
  children,
  ref,
  ...props
}: GradientTextProps) {
  const reduceMotion = useShouldReduceMotion();
  const [paused, setPaused] = React.useState(false);
  const controlsRef = React.useRef<ReturnType<typeof animate> | null>(null);
  const progress = useMotionValue(0);
  const backgroundPosition = useTransform(progress, (value) => buildPosition(direction, value));
  const gradient = buildGradient(colors, direction);
  const layerStyle = {
    backgroundImage: gradient,
    backgroundSize: BACKGROUND_SIZES[direction],
    backgroundPosition,
  };

  React.useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(progress, 100, {
      duration: durationMs / 1000,
      ease: "linear",
      repeat: Number.POSITIVE_INFINITY,
      repeatType: yoyo ? "reverse" : "loop",
    });
    controlsRef.current = controls;
    return () => controls.stop();
  }, [reduceMotion, durationMs, yoyo, progress]);

  const setHover = (hovering: boolean) => {
    if (!pauseOnHover) return;
    setPaused(hovering);
    if (hovering) controlsRef.current?.pause();
    else controlsRef.current?.play();
  };

  return (
    <span
      ref={ref}
      data-slot="gradient-text"
      data-animated={!reduceMotion}
      data-paused={paused}
      className={cn("inline-block", bordered && "relative rounded-full px-3 py-1", className)}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      {...props}
    >
      {bordered ? (
        <>
          <motion.span
            aria-hidden="true"
            data-slot="gradient-text-border"
            className="absolute inset-0 rounded-full"
            style={layerStyle}
          />
          <span aria-hidden="true" className="absolute inset-px rounded-full bg-background" />
        </>
      ) : null}
      <motion.span
        data-slot="gradient-text-fill"
        className="relative inline-block bg-clip-text text-transparent"
        style={layerStyle}
      >
        {children}
      </motion.span>
    </span>
  );
}

GradientText.displayName = "GradientText";

export type { GradientTextProps };
export { buildGradient, buildPosition, DEFAULT_COLORS, GradientText, resolveAngle };
