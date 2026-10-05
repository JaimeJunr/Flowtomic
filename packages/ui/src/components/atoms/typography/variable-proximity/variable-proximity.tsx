/**
 * VariableProximity Component - Flowtomic UI
 *
 * Texto cujas letras engordam perto do ponteiro, numa bolha que acompanha o mouse.
 * Usa font-variation-settings (eixo wght e extras), então a fonte precisa ser variável.
 * Respeita movimento reduzido apenas removendo a transição: o efeito é resposta direta
 * ao ponteiro, sem animação autônoma.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/variable-proximity.md
 */

"use client";

import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type FalloffCurve = "linear" | "exponential" | "gaussian";

type VariableProximityProps = Omit<React.ComponentProps<"span">, "children"> & {
  text: string;
  fromWeight?: number;
  toWeight?: number;
  /** Eixos extras em formato CSS, interpolados junto (ex.: { opsz: [9, 40] }). */
  extraAxes?: Record<string, [number, number]>;
  radiusPx?: number;
  falloff?: FalloffCurve;
  /** Área que escuta o ponteiro (default: a própria raiz). */
  containerRef?: React.RefObject<HTMLElement | null>;
};

const GAUSSIAN_SIGMA = 0.35;

/** `x` = distância normalizada pelo raio; devolve a intensidade de 0 a 1. */
function proximityFalloff(curve: FalloffCurve, x: number): number {
  if (x >= 1) return 0;
  if (curve === "exponential") return (1 - x) ** 2;
  if (curve === "gaussian") return Math.exp(-(x * x) / (2 * GAUSSIAN_SIGMA ** 2));
  return Math.max(0, 1 - x);
}

function buildVariationSettings(
  weight: number,
  extraAxes: Record<string, [number, number]>,
  t: number
): string {
  const extras = Object.entries(extraAxes).map(
    ([axis, [from, to]]) => `"${axis}" ${from + (to - from) * t}`
  );
  return [`"wght" ${weight}`, ...extras].join(", ");
}

function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function VariableProximity({
  text,
  fromWeight = 400,
  toWeight = 800,
  extraAxes,
  radiusPx = 80,
  falloff = "linear",
  containerRef,
  className,
  ref,
  ...props
}: VariableProximityProps) {
  const words = splitWords(text);
  if (words.length === 0) {
    throw new Error(
      `VariableProximity: invalid text, received ${JSON.stringify(text)}, expected text: string não vazio`
    );
  }

  const rootRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLSpanElement);
  const charRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const reduceMotion = useShouldReduceMotion();
  const axesKey = JSON.stringify(extraAxes ?? {});

  React.useEffect(() => {
    const target = containerRef?.current ?? rootRef.current;
    if (!target) return;
    const axes: Record<string, [number, number]> = JSON.parse(axesKey);
    let frame = 0;

    const paint = (pointer: { x: number; y: number } | null) => {
      for (const char of charRefs.current) {
        if (!char) continue;
        let t = 0;
        if (pointer) {
          const rect = char.getBoundingClientRect();
          const distance = Math.hypot(
            pointer.x - (rect.left + rect.width / 2),
            pointer.y - (rect.top + rect.height / 2)
          );
          t = proximityFalloff(falloff, distance / radiusPx);
        }
        char.style.fontVariationSettings = buildVariationSettings(
          fromWeight + (toWeight - fromWeight) * t,
          axes,
          t
        );
      }
    };
    const schedule = (pointer: { x: number; y: number } | null) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => paint(pointer));
    };
    const onMove = (event: Event) => {
      const { clientX, clientY } = event as PointerEvent;
      schedule({ x: clientX, y: clientY });
    };
    const onLeave = () => schedule(null);

    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerleave", onLeave);
    };
  }, [containerRef, fromWeight, toWeight, axesKey, radiusPx, falloff]);

  const restingSettings = buildVariationSettings(fromWeight, extraAxes ?? {}, 0);
  let charIndex = 0;

  return (
    <span
      ref={rootRef}
      data-slot="variable-proximity"
      className={cn("inline-block", className)}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: palavras são posições fixas do texto
          <React.Fragment key={wordIndex}>
            {wordIndex > 0 ? " " : null}
            <span className="inline-block whitespace-nowrap">
              {[...word].map((letter) => {
                const index = charIndex++;
                return (
                  <span
                    key={index}
                    ref={(node) => {
                      charRefs.current[index] = node;
                    }}
                    data-slot="variable-proximity-char"
                    data-index={index}
                    className={cn(
                      "inline-block",
                      !reduceMotion && "transition-[font-variation-settings] duration-100 ease-out"
                    )}
                    style={{ fontVariationSettings: restingSettings }}
                  >
                    {letter}
                  </span>
                );
              })}
            </span>
          </React.Fragment>
        ))}
      </span>
    </span>
  );
}

VariableProximity.displayName = "VariableProximity";

export type { FalloffCurve, VariableProximityProps };
export { buildVariationSettings, proximityFalloff, VariableProximity };
