/**
 * RotatingText Component - Flowtomic UI
 *
 * Palavra que se troca sozinha dentro de uma frase fixa: os caracteres da atual
 * sobem e somem, os da próxima sobem de baixo. Pausa fora da tela, com a aba
 * escondida e quando o ponteiro ou o foco estão sobre o texto (WCAG 2.2.2).
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/rotating-text.md
 */

"use client";

import { AnimatePresence, animate, motion, useInView, type Variants } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type RotatingSplit = "character" | "word" | "none";
type RotatingStaggerFrom = "first" | "last" | "center";

type RotatingTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Palavras (ou frases curtas) que se alternam. Ao menos 1. */
  words: string[];
  intervalMs?: number;
  /** Unidade que sobe e some. */
  splitBy?: RotatingSplit;
  staggerMs?: number;
  staggerFrom?: RotatingStaggerFrom;
  /** Com false, para na última palavra. */
  loop?: boolean;
  /** Troca sozinho. Com false, só muda por `activeIndex`. */
  auto?: boolean;
  /** Índice controlado: o componente mostra esse índice e só pede a troca em `onIndexChange`. */
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
};

const SEGMENT_TRANSITION_S = 0.35;
// A entrada começa com a saída pela metade, para o espaço nunca ficar visivelmente vazio.
const ENTER_OFFSET_S = SEGMENT_TRANSITION_S / 2;
const WIDTH_TRANSITION_S = 0.3;
const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

/** "a", "a ou b", "a, b ou c". */
function formatWordList(words: string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} ou ${words[words.length - 1]}`;
}

function splitWord(word: string, splitBy: RotatingSplit): string[] {
  if (splitBy === "character") return Array.from(word);
  if (splitBy === "word") return word.split(/\s+/).filter(Boolean);
  return [word];
}

/** Posição do pedaço na fila do stagger: 0 é o primeiro a mexer. */
function staggerOrder(index: number, count: number, from: RotatingStaggerFrom): number {
  if (from === "last") return count - 1 - index;
  if (from === "center") return Math.abs(index - Math.floor(count / 2));
  return index;
}

const segmentVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: (delay: number) => ({
    y: "0%",
    opacity: 1,
    transition: {
      duration: SEGMENT_TRANSITION_S,
      delay: delay + ENTER_OFFSET_S,
      ease: EASE_OUT_STRONG,
    },
  }),
  exit: (delay: number) => ({
    y: "-120%",
    opacity: 0,
    transition: { duration: SEGMENT_TRANSITION_S, delay, ease: EASE_OUT_STRONG },
  }),
};

function useTabVisible(): boolean {
  const [visible, setVisible] = React.useState(() => document.visibilityState !== "hidden");
  React.useEffect(() => {
    const sync = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return visible;
}

function RotatingText({
  words,
  intervalMs = 2000,
  splitBy = "character",
  staggerMs = 25,
  staggerFrom = "first",
  loop = true,
  auto = true,
  activeIndex,
  onIndexChange,
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ref,
  ...props
}: RotatingTextProps) {
  if (words.length === 0) {
    throw new Error(
      `RotatingText: invalid words, received ${JSON.stringify(words)}, expected words: string[] com ao menos 1 item`
    );
  }

  const rootRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLSpanElement);
  const isInView = useInView(rootRef);
  const tabVisible = useTabVisible();
  const reduceMotion = useShouldReduceMotion();
  const [internalIndex, setInternalIndex] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const current = (activeIndex ?? internalIndex) % words.length;
  const isLast = current === words.length - 1;
  const running = auto && words.length > 1 && isInView && tabVisible && !hovered && !focused;
  const canAdvance = loop || !isLast;

  // Guarda o callback mais recente: trocar a função não deve zerar o timer.
  const onIndexChangeRef = React.useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;

  React.useEffect(() => {
    if (!running || !canAdvance) return;
    const timer = setTimeout(() => {
      const next = isLast ? 0 : current + 1;
      if (activeIndex === undefined) setInternalIndex(next);
      onIndexChangeRef.current?.(next);
    }, intervalMs);
    return () => clearTimeout(timer);
  }, [running, canAdvance, isLast, current, activeIndex, intervalMs]);

  const measurerRef = React.useRef<HTMLSpanElement>(null);
  const measuredRef = React.useRef(false);

  // Largura da raiz animada explicitamente: o texto vizinho acompanha porque ela muda de fato.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `current` dispara a nova medição
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const width = measurerRef.current?.getBoundingClientRect().width ?? 0;
    if (reduceMotion || !root || width === 0) return;
    if (!measuredRef.current) {
      root.style.width = `${width}px`;
      measuredRef.current = true;
      return;
    }
    const controls = animate(
      root,
      { width: `${width}px` },
      {
        duration: WIDTH_TRANSITION_S,
        ease: EASE_OUT_STRONG,
      }
    );
    return () => controls.stop();
  }, [current, reduceMotion]);

  const rootProps = {
    ref: rootRef,
    "data-slot": "rotating-text",
    "data-index": current,
    className: cn("relative inline-flex overflow-hidden", className),
    onPointerEnter: (event: React.PointerEvent<HTMLSpanElement>) => {
      setHovered(true);
      onPointerEnter?.(event);
    },
    onPointerLeave: (event: React.PointerEvent<HTMLSpanElement>) => {
      setHovered(false);
      onPointerLeave?.(event);
    },
    onFocus: (event: React.FocusEvent<HTMLSpanElement>) => {
      setFocused(true);
      onFocus?.(event);
    },
    onBlur: (event: React.FocusEvent<HTMLSpanElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      onBlur?.(event);
    },
    ...props,
  };
  const word = words[current] as string;
  const segments = splitWord(word, splitBy);

  return (
    <span {...rootProps}>
      <span className="sr-only">{formatWordList(words)}</span>
      {reduceMotion ? (
        <span aria-hidden="true">{word}</span>
      ) : (
        <>
          <span
            ref={measurerRef}
            aria-hidden="true"
            className="pointer-events-none invisible absolute top-0 left-0 whitespace-pre"
          >
            {word}
          </span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={current}
              aria-hidden="true"
              className="inline-flex"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {segments.map((segment, index) => (
                <motion.span
                  // biome-ignore lint/suspicious/noArrayIndexKey: pedaços são posições fixas da palavra
                  key={index}
                  data-slot="rotating-text-segment"
                  className="inline-block whitespace-pre"
                  variants={segmentVariants}
                  custom={(staggerOrder(index, segments.length, staggerFrom) * staggerMs) / 1000}
                >
                  {segment}
                  {splitBy === "word" && index < segments.length - 1 ? " " : null}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </>
      )}
    </span>
  );
}

RotatingText.displayName = "RotatingText";

export type { RotatingTextProps };
export { formatWordList, RotatingText, splitWord, staggerOrder };
