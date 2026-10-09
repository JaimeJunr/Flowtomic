/**
 * SplitFlapText Component - Flowtomic UI
 *
 * Painel de aeroporto antigo: uma fileira de plaquinhas, uma letra em cada. Ao trocar
 * a frase, só as plaquinhas cuja letra muda viram, passando por letras do charset até
 * parar na certa, da esquerda para a direita. O painel é escuro nos dois temas. Pausa
 * com hover, foco e fora da tela (WCAG 2.2.2). Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/split-flap-text.md
 */

"use client";

import { motion, useInView } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type SplitFlapCharset = "alpha" | "alphanumeric" | "numeric" | (string & {});

type SplitFlapTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Frases que se alternam. */
  words?: string[];
  /** Frase única (tem prioridade sobre `words`). */
  text?: string;
  /** Duração de uma virada, em ms. */
  flipMs?: number;
  /** Atraso entre uma plaquinha e a seguinte, em ms. */
  staggerMs?: number;
  /** Tempo parado em cada frase, em ms. */
  holdMs?: number;
  charset?: SplitFlapCharset;
  /** Quantas letras intermediárias cada plaquinha mostra antes da final. */
  flipsPerChar?: number;
  /** Quantidade fixa de plaquinhas. Default: o tamanho da maior frase. */
  padTo?: number;
  loop?: boolean;
};

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMERIC = "0123456789";
const BLANK = " ";

function charsetOf(charset: SplitFlapCharset): string {
  if (charset === "alpha") return ALPHA;
  if (charset === "numeric") return NUMERIC;
  if (charset === "alphanumeric") return ALPHA + NUMERIC;
  return charset;
}

function tileCountOf(phrases: string[], padTo: number | undefined): number {
  return padTo ?? Math.max(...phrases.map((phrase) => phrase.length));
}

/** Maiúsculas, completada com espaços à direita e cortada em `count`. */
function padPhrase(phrase: string, count: number): string {
  return phrase.toUpperCase().padEnd(count, BLANK).slice(0, count);
}

/** Índices das plaquinhas cuja letra muda entre duas frases já padronizadas. */
function changedTiles(previous: string, next: string): number[] {
  return Array.from(next).flatMap((letter, index) => (previous[index] === letter ? [] : [index]));
}

/** LCG pequeno com semente: a sequência de cada plaquinha é estável entre renders. */
function nextSeed(seed: number): number {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}

/** `flipsPerChar` letras do charset em sequência e, por fim, a letra-alvo. */
function flipSequence(
  target: string,
  charset: string,
  flipsPerChar: number,
  seed: number
): string[] {
  const letters = Array.from(charset);
  let state = nextSeed(seed + 1);
  const sequence = Array.from({ length: flipsPerChar }, () => {
    state = nextSeed(state);
    return letters[state % letters.length] as string;
  });
  return [...sequence, target];
}

function resolvePhrases(text: string | undefined, words: string[] | undefined): string[] {
  const phrases = text !== undefined ? [text] : (words ?? []);
  if (phrases.length === 0 || phrases.every((phrase) => phrase.length === 0)) {
    throw new Error(
      `SplitFlapText: invalid phrase, received text=${JSON.stringify(text)}, words=${JSON.stringify(words)}, expected text: string ou words: string[] com ao menos 1 item`
    );
  }
  return phrases;
}

type TileState = { shown: string; previous: string; step: number; flipping: boolean };

type TileTimings = {
  target: string;
  delayMs: number;
  flipMs: number;
  flipsPerChar: number;
  charset: string;
  seed: number;
  reduceMotion: boolean;
};

function useTileState({
  target,
  delayMs,
  flipMs,
  flipsPerChar,
  charset,
  seed,
  reduceMotion,
}: TileTimings): TileState {
  const [state, setState] = React.useState<TileState>({
    shown: reduceMotion ? target : BLANK,
    previous: BLANK,
    step: 0,
    flipping: false,
  });
  const shownRef = React.useRef(state.shown);
  shownRef.current = state.shown;

  React.useEffect(() => {
    if (reduceMotion || target === shownRef.current) {
      setState((s) => ({ ...s, shown: target, flipping: false }));
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sequence = flipSequence(target, charset, flipsPerChar, seed);
    sequence.forEach((letter, index) => {
      const start = delayMs + index * flipMs;
      timers.push(
        setTimeout(
          () => setState((s) => ({ ...s, previous: s.shown, step: s.step + 1, flipping: true })),
          start
        ),
        // A letra troca no meio da dobra, quando a aba cobre a metade de cima.
        setTimeout(() => setState((s) => ({ ...s, shown: letter })), start + flipMs / 2)
      );
    });
    timers.push(
      setTimeout(
        () => setState((s) => ({ ...s, flipping: false })),
        delayMs + sequence.length * flipMs
      )
    );
    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, [target, delayMs, flipMs, flipsPerChar, charset, seed, reduceMotion]);

  return state;
}

function FlapTile(props: TileTimings) {
  const { shown, previous, step, flipping } = useTileState(props);
  const show = (letter: string) => (letter === BLANK ? "" : letter);
  return (
    <span
      aria-hidden="true"
      data-slot="split-flap-tile"
      data-flipping={flipping}
      className="relative inline-flex h-[1.4em] w-[1em] items-center justify-center overflow-hidden rounded-[0.12em] border border-border bg-card text-card-foreground [perspective:300px]"
    >
      {show(shown)}
      <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
      {flipping ? (
        <motion.span
          key={step}
          className="absolute inset-0 flex origin-bottom items-center justify-center bg-card [clip-path:inset(0_0_50%_0)]"
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -90 }}
          transition={{ duration: props.flipMs / 1000, ease: "easeIn" }}
        >
          {show(previous)}
        </motion.span>
      ) : null}
    </span>
  );
}

function SplitFlapText({
  words,
  text,
  flipMs = 120,
  staggerMs = 60,
  holdMs = 2400,
  charset = "alphanumeric",
  flipsPerChar = 6,
  padTo,
  loop = true,
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ref,
  ...props
}: SplitFlapTextProps) {
  const phrases = resolvePhrases(text, words);
  const tileCount = tileCountOf(phrases, padTo);

  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  const isInView = useInView(rootRef);
  const reduceMotion = useShouldReduceMotion();
  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const current = phraseIndex % phrases.length;
  const isLast = current === phrases.length - 1;
  const running = phrases.length > 1 && (loop || !isLast) && isInView && !hovered && !focused;

  React.useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setPhraseIndex(isLast ? 0 : current + 1), holdMs);
    return () => clearTimeout(timer);
  }, [running, isLast, current, holdMs]);

  const padded = padPhrase(phrases[current] as string, tileCount);
  const tileCharset = charsetOf(charset);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: handlers só pausam/ativam o efeito visual, sem ação
    <div
      ref={rootRef}
      data-slot="split-flap-text"
      className={cn(
        "dark inline-flex gap-[0.12em] rounded-lg bg-card p-[0.3em] font-mono text-card-foreground",
        className
      )}
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
      <span className="sr-only">{phrases[current]}</span>
      {Array.from(padded).map((letter, index) => (
        <FlapTile
          // biome-ignore lint/suspicious/noArrayIndexKey: plaquinhas são posições fixas do painel
          key={index}
          target={letter}
          delayMs={index * staggerMs}
          flipMs={flipMs}
          flipsPerChar={flipsPerChar}
          charset={tileCharset}
          seed={index + current * 101}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}

SplitFlapText.displayName = "SplitFlapText";

export type { SplitFlapCharset, SplitFlapTextProps };
export { changedTiles, charsetOf, flipSequence, padPhrase, SplitFlapText, tileCountOf };
