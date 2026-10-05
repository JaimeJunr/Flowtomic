/**
 * GlitchText Component - Flowtomic UI
 *
 * Texto com "defeito digital": duas cópias coloridas, deslocadas para os lados,
 * aparecem em faixas horizontais que pulam de altura em passos. O texto principal
 * fica sempre legível. Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/glitch-text.md
 */

"use client";

import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type GlitchTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  children: string;
  /** Duração de um ciclo de interferência, em ms. Maior = mais lento. */
  durationMs?: number;
  /** Sombras coloridas atrás das cópias. */
  chromatic?: boolean;
  /** "always" = em loop; "hover" = só com ponteiro em cima ou foco dentro. */
  trigger?: "always" | "hover";
};

/** Faixa [topo%, base%]; null = quadro sem cópia visível. */
type Cut = [top: number, bottom: number] | null;

const FRAME_COUNT = 12;
// Rajada: ~25% do ciclo visível, o resto só o texto principal.
const BURST_FRAMES = 3;
const MIN_SLICE_PERCENT = 4;
const MAX_SLICE_PERCENT = 22;
// Semente da janela da rajada, comum às duas camadas: a interferência aparece junta.
const BURST_SEED = 7;
const FULLY_CLIPPED = "inset(0% 0 100% 0)";

/** PRNG pequeno com semente (mulberry32): mesma semente, mesma sequência. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** Uma faixa de 4% a 22% da altura, em posição aleatória. */
function randomSlice(random: () => number): [number, number] {
  const height = Math.round(MIN_SLICE_PERCENT + random() * (MAX_SLICE_PERCENT - MIN_SLICE_PERCENT));
  const top = Math.round(random() * (100 - height));
  return [top, 100 - top - height];
}

/** Cortes determinísticos: uma rajada contínua de quadros visíveis, o resto null. */
function glitchCuts(
  seed: number,
  count: number = FRAME_COUNT,
  burstSeed: number = BURST_SEED
): Cut[] {
  const random = seededRandom(seed);
  const burstStart = Math.floor(seededRandom(burstSeed)() * (count - BURST_FRAMES + 1));
  return Array.from({ length: count }, (_, index) =>
    index >= burstStart && index < burstStart + BURST_FRAMES ? randomSlice(random) : null
  );
}

function toClipPath(cut: Cut): string {
  return cut ? `inset(${cut[0]}% 0 ${cut[1]}% 0)` : FULLY_CLIPPED;
}

/** Keyframes em degrau: cada corte ocupa uma fatia fixa do ciclo, sem interpolar. */
function stepKeyframes(cuts: Cut[]): { values: string[]; times: number[] } {
  const slice = 1 / cuts.length;
  const values: string[] = [];
  const times: number[] = [];
  cuts.forEach((cut, index) => {
    const clip = toClipPath(cut);
    values.push(clip, clip);
    times.push(index * slice, index === cuts.length - 1 ? 1 : (index + 1) * slice - 0.001);
  });
  return { values, times };
}

type LayerSpec = { seed: number; offsetClass: string; colorClass: string; shadowClass: string };

const LAYER_SEEDS = [11, 29] as const;

const LAYERS: LayerSpec[] = [
  {
    seed: LAYER_SEEDS[0],
    offsetClass: "translate-x-[2px]",
    colorClass: "text-primary",
    shadowClass: "[text-shadow:-2px_0_var(--primary)]",
  },
  {
    seed: LAYER_SEEDS[1],
    offsetClass: "-translate-x-[2px]",
    colorClass: "text-info",
    shadowClass: "[text-shadow:2px_0_var(--info)]",
  },
];

function GlitchLayer({
  text,
  spec,
  active,
  chromatic,
  durationMs,
}: {
  text: string;
  spec: LayerSpec;
  active: boolean;
  chromatic: boolean;
  durationMs: number;
}) {
  const { values, times } = React.useMemo(() => stepKeyframes(glitchCuts(spec.seed)), [spec.seed]);
  return (
    <motion.span
      aria-hidden="true"
      data-slot="glitch-text-layer"
      data-active={active}
      className={cn(
        "pointer-events-none absolute inset-0 select-none",
        spec.offsetClass,
        chromatic ? [spec.colorClass, spec.shadowClass] : "text-current",
        active ? "opacity-100" : "opacity-0"
      )}
      initial={{ clipPath: FULLY_CLIPPED }}
      animate={{ clipPath: active ? values : FULLY_CLIPPED }}
      transition={
        active
          ? { duration: durationMs / 1000, ease: "linear", repeat: Infinity, times }
          : { duration: 0 }
      }
    >
      {text}
    </motion.span>
  );
}

function GlitchText({
  children,
  durationMs = 2000,
  chromatic = true,
  trigger = "always",
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ref,
  ...props
}: GlitchTextProps) {
  const reduceMotion = useShouldReduceMotion();
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const active = trigger === "always" || hovered || focused;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: handlers só pausam/ativam o efeito visual, sem ação
    <span
      ref={ref}
      data-slot="glitch-text"
      className={cn("relative inline-block", className)}
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
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        onBlur?.(event);
      }}
      {...props}
    >
      <span>{children}</span>
      {reduceMotion
        ? null
        : LAYERS.map((spec) => (
            <GlitchLayer
              key={spec.seed}
              text={children}
              spec={spec}
              active={active}
              chromatic={chromatic}
              durationMs={durationMs}
            />
          ))}
    </span>
  );
}

GlitchText.displayName = "GlitchText";

export type { GlitchTextProps };
export { GlitchText, glitchCuts, LAYER_SEEDS, stepKeyframes, toClipPath };
