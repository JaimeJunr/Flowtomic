/**
 * BlurText Component - Flowtomic UI
 *
 * Texto que entra em sequência quando aparece na tela: cada palavra (ou letra)
 * sai de invisível, borrada e deslocada para o lugar, nítida e opaca.
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/blur-text.md
 */

"use client";

import { motion, type UseInViewOptions, useInView, type Variants } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type BlurTextElement = "p" | "span" | "h1" | "h2" | "h3" | "h4";

type BlurTextProps = Omit<React.ComponentProps<"p">, "children" | "ref"> & {
  ref?: React.Ref<HTMLElement>;
  /** Texto a animar. Só string: o componente precisa quebrar em pedaços. */
  text: string;
  /** Elemento raiz. */
  as?: BlurTextElement;
  /** Unidade da animação. */
  splitBy?: "word" | "letter";
  /** De onde o pedaço vem. */
  from?: "above" | "below";
  /** Intervalo entre o início de um pedaço e o do próximo, em ms. Padrão: 80 por palavra, 30 por letra. */
  staggerMs?: number;
  /** Duração da entrada de cada pedaço, em ms. */
  durationMs?: number;
  /** Anima só na primeira vez que entra na tela (true) ou toda vez (false). */
  once?: boolean;
  /** Margem do gatilho de visibilidade (sintaxe de rootMargin). */
  inViewMargin?: UseInViewOptions["margin"];
  /** Chamado a cada entrada completa, quando o último pedaço termina de entrar. */
  onComplete?: () => void;
};

type SegmentVariantOptions = { from: "above" | "below"; durationMs: number; staggerMs: number };

const BLUR_EM = 0.25;
const OFFSET_EM = 0.5;
const MAX_DELAY_MS = 1000;
const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];
const DEFAULT_STAGGER_MS = { word: 80, letter: 30 } as const;

/** Padrão do intervalo depende da unidade: letras são muitas, então entram mais juntas. */
function resolveStaggerMs(splitBy: "word" | "letter", staggerMs: number | undefined): number {
  return staggerMs ?? DEFAULT_STAGGER_MS[splitBy];
}

/** Palavras do texto; espaços múltiplos e bordas somem. */
function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Pedaços animados de cada palavra: ela inteira, ou uma letra por pedaço. */
function splitIntoSegments(word: string, splitBy: "word" | "letter"): string[] {
  return splitBy === "letter" ? Array.from(word) : [word];
}

function buildVariants({ from, durationMs, staggerMs }: SegmentVariantOptions): Variants {
  const offset = `${from === "above" ? -OFFSET_EM : OFFSET_EM}em`;
  return {
    hidden: { opacity: 0, filter: `blur(${BLUR_EM}em)`, y: offset },
    visible: (index: number) => ({
      opacity: 1,
      filter: "blur(0px)",
      y: "0em",
      transition: {
        duration: durationMs / 1000,
        delay: Math.min(index * staggerMs, MAX_DELAY_MS) / 1000,
        ease: EASE_OUT_STRONG,
      },
    }),
  };
}

function BlurText({
  text,
  as = "p",
  splitBy = "word",
  from = "above",
  staggerMs,
  durationMs = 500,
  once = true,
  inViewMargin = "0px",
  onComplete,
  className,
  ref,
  ...props
}: BlurTextProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLElement);
  const isInView = useInView(rootRef, { once, margin: inViewMargin });
  const reduceMotion = useShouldReduceMotion();
  const words = splitIntoWords(text);
  const variants = React.useMemo(
    () => buildVariants({ from, durationMs, staggerMs: resolveStaggerMs(splitBy, staggerMs) }),
    [from, durationMs, splitBy, staggerMs]
  );

  // Guarda o callback mais recente: trocar a função não deve reexecutar o efeito do mount.
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  React.useEffect(() => {
    if (reduceMotion) onCompleteRef.current?.();
  }, [reduceMotion]);

  const Root = as as React.ElementType;
  const rootProps = {
    ref: rootRef,
    "data-slot": "blur-text",
    "data-from": from,
    className: cn(className),
    ...props,
  };

  if (reduceMotion) return <Root {...rootProps}>{words.join(" ")}</Root>;

  const lastIndex =
    words.reduce((total, word) => total + splitIntoSegments(word, splitBy).length, 0) - 1;
  let segmentIndex = 0;

  return (
    <Root {...rootProps}>
      <span className="sr-only">{words.join(" ")}</span>
      <span key={text} aria-hidden="true" className="select-none">
        {words.map((word, wordIndex) => {
          const segments = splitIntoSegments(word, splitBy).map((segment, position) => {
            const index = segmentIndex++;
            return (
              <motion.span
                // biome-ignore lint/suspicious/noArrayIndexKey: pedaços são posições fixas do texto
                key={position}
                data-slot="blur-text-segment"
                style={{ display: "inline-block" }}
                variants={variants}
                custom={index}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                onAnimationComplete={(definition) => {
                  if (index === lastIndex && definition === "visible") onCompleteRef.current?.();
                }}
              >
                {segment}
              </motion.span>
            );
          });
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: mesma palavra pode se repetir no texto
            <React.Fragment key={wordIndex}>
              {splitBy === "letter" ? (
                <span
                  data-slot="blur-text-word"
                  style={{ display: "inline-block", whiteSpace: "nowrap" }}
                >
                  {segments}
                </span>
              ) : (
                segments
              )}
              {wordIndex < words.length - 1 ? " " : null}
            </React.Fragment>
          );
        })}
      </span>
    </Root>
  );
}

BlurText.displayName = "BlurText";

export type { BlurTextProps };
export { BlurText, buildVariants, resolveStaggerMs };
