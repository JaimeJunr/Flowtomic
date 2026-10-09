/**
 * TrueFocus Component - Flowtomic UI
 *
 * Frase em que só uma palavra fica nítida e as outras borradas, com uma moldura de
 * quatro cantos (foco de câmera) que desliza até a palavra ativa. No modo auto o
 * foco avança sozinho e pausa com hover, foco e fora da tela (WCAG 2.2.2).
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/true-focus.md
 */

"use client";

import { motion, useInView } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type TrueFocusProps = Omit<React.ComponentProps<"span">, "children"> & {
  sentence: string;
  /** Separador das palavras. */
  separator?: string;
  /** "auto" = avança sozinho; "hover" = o foco segue a palavra sob o ponteiro. */
  mode?: "auto" | "hover";
  blurPx?: number;
  /** Duração do deslize da moldura e da troca de nitidez, em ms. */
  transitionMs?: number;
  /** Tempo parado em cada palavra no modo auto, em ms. */
  holdMs?: number;
};

type FrameRect = { x: number; y: number; width: number; height: number };

// A moldura fica um pouco fora da caixa da palavra.
const FRAME_MARGIN_PX = 4;
const CORNER_CLASSES = [
  "top-0 left-0 border-t-2 border-l-2",
  "top-0 right-0 border-t-2 border-r-2",
  "bottom-0 left-0 border-b-2 border-l-2",
  "right-0 bottom-0 border-r-2 border-b-2",
];

function splitSentence(sentence: string, separator: string): string[] {
  return sentence
    .split(separator)
    .map((word) => word.trim())
    .filter(Boolean);
}

/** Caixa da moldura em coordenadas da raiz, já com a folga externa. */
function toFrameRect(word: DOMRect, root: DOMRect): FrameRect {
  return {
    x: word.left - root.left - FRAME_MARGIN_PX,
    y: word.top - root.top - FRAME_MARGIN_PX,
    width: word.width + FRAME_MARGIN_PX * 2,
    height: word.height + FRAME_MARGIN_PX * 2,
  };
}

function useFrameRect(
  rootRef: React.RefObject<HTMLSpanElement | null>,
  wordRefs: React.RefObject<(HTMLSpanElement | null)[]>,
  activeIndex: number,
  enabled: boolean,
  sentence: string
): FrameRect | null {
  const [rect, setRect] = React.useState<FrameRect | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `sentence` refaz a medição quando as palavras mudam
  React.useLayoutEffect(() => {
    const word = wordRefs.current[activeIndex];
    const root = rootRef.current;
    if (!enabled || !word || !root) return;
    setRect(toFrameRect(word.getBoundingClientRect(), root.getBoundingClientRect()));
  }, [activeIndex, enabled, sentence, rootRef, wordRefs]);
  return rect;
}

function TrueFocus({
  sentence,
  separator = " ",
  mode = "auto",
  blurPx = 4,
  transitionMs = 450,
  holdMs = 1200,
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ref,
  ...props
}: TrueFocusProps) {
  const words = splitSentence(sentence, separator);
  if (words.length === 0) {
    throw new Error(
      `TrueFocus: invalid sentence, received ${JSON.stringify(sentence)}, expected sentence: string com ao menos 1 palavra`
    );
  }

  const rootRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLSpanElement);
  const wordRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const isInView = useInView(rootRef);
  const reduceMotion = useShouldReduceMotion();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const current = activeIndex % words.length;
  const running = mode === "auto" && words.length > 1 && isInView && !hovered && !focused;

  React.useEffect(() => {
    if (!running) return;
    const timer = setTimeout(
      () => setActiveIndex((current + 1) % words.length),
      holdMs + transitionMs
    );
    return () => clearTimeout(timer);
  }, [running, current, words.length, holdMs, transitionMs]);

  const rect = useFrameRect(rootRef, wordRefs, current, !reduceMotion, sentence);
  const transition = { duration: transitionMs / 1000, ease: "easeOut" } as const;
  const interactive = mode === "hover";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: handlers só pausam/ativam o efeito visual, sem ação
    <span
      ref={rootRef}
      data-slot="true-focus"
      data-active-index={current}
      className={cn("relative inline-flex flex-wrap gap-x-[0.35em]", className)}
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
      {words.map((word, index) => (
        <motion.span
          // biome-ignore lint/suspicious/noArrayIndexKey: palavras são posições fixas da frase
          key={index}
          ref={(node) => {
            wordRefs.current[index] = node;
          }}
          data-slot="true-focus-word"
          tabIndex={interactive ? 0 : undefined}
          className="whitespace-pre outline-none"
          initial={false}
          animate={
            reduceMotion ? undefined : { filter: `blur(${index === current ? 0 : blurPx}px)` }
          }
          transition={transition}
          onPointerEnter={interactive ? () => setActiveIndex(index) : undefined}
          onFocus={interactive ? () => setActiveIndex(index) : undefined}
        >
          {word}
        </motion.span>
      ))}
      {reduceMotion || !rect ? null : (
        <motion.span
          aria-hidden="true"
          data-slot="true-focus-frame"
          className="pointer-events-none absolute top-0 left-0"
          initial={false}
          animate={rect}
          transition={transition}
        >
          {CORNER_CLASSES.map((corner) => (
            <span key={corner} className={cn("absolute size-3 border-primary", corner)} />
          ))}
        </motion.span>
      )}
    </span>
  );
}

TrueFocus.displayName = "TrueFocus";

export type { TrueFocusProps };
export { splitSentence, TrueFocus, toFrameRect };
