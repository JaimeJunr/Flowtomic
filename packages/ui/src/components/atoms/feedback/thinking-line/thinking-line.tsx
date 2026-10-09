/**
 * ThinkingLine Component - Flowtomic UI
 *
 * Linha "Pensando…" para o raciocínio ao vivo de um assistente: glifo que respira, brilho
 * varrendo o texto, trilha opcional de passos e, ao terminar, assenta em "Pensou por X s".
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/thinking-line.md
 */

"use client";

import { Check, ChevronRight, Sparkle } from "lucide-react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  formatThought,
  hasSettled,
  settledAnnouncement,
  settledLabel,
} from "./thinking-line-utils";

export type ThinkingLineGlyph = "sparkle" | "dot" | "none" | React.ReactNode;

export type ThinkingLineProps = Omit<React.ComponentProps<"div">, "children"> & {
  label?: string;
  /** Vazio = "Pensou por X s" (ou "Pensamento concluído" sem cronômetro). */
  doneLabel?: string;
  glyph?: ThinkingLineGlyph;
  steps?: string[];
  collapsible?: boolean;
  collapseOnSettle?: boolean;
  working?: boolean;
  /** Assenta sozinho depois de N segundos; 0 espera `working` virar false. */
  settleAfterS?: number;
  /** Segundos controlados; quando passado, o relógio interno não roda. */
  elapsed?: number;
  showTimer?: boolean;
  shimmer?: boolean;
  onSettle?: (seconds: number) => void;
};

const BREATHE = "flowtomic-thinking-line-breathe";
const SWEEP = "flowtomic-thinking-line-sweep";
const SWAP = "flowtomic-thinking-line-swap";
const KEYFRAMES_CSS =
  `@keyframes ${BREATHE}{0%,100%{opacity:1}50%{opacity:.55}}` +
  `@keyframes ${SWEEP}{from{background-position:100% center}to{background-position:0% center}}` +
  `@keyframes ${SWAP}{from{opacity:0;filter:blur(2px)}to{opacity:1;filter:blur(0)}}`;
const TICK_MS = 100;

const BREATHE_STYLE: React.CSSProperties = {
  animation: `${BREATHE} 1.6s ease-in-out infinite`,
};
const SWAP_STYLE: React.CSSProperties = { animation: `${SWAP} 350ms ease-out` };
const SHIMMER_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(90deg, currentColor 0%, var(--muted-foreground) 50%, currentColor 100%)",
  backgroundSize: "250% 100%",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  // text-fill (e não color) mantém `currentColor` do gradiente com a cor real do texto.
  WebkitTextFillColor: "transparent",
  animation: `${SWEEP} 1.8s linear infinite`,
};

/** Segundos desde a montagem; zera quando `working` volta a true e congela ao parar. */
function useThoughtClock(
  working: boolean,
  settleAfterS: number,
  controlled: number | undefined
): { seconds: number; settled: boolean } {
  const [ticked, setTicked] = React.useState(0);
  const seconds = controlled ?? ticked;
  const settled = hasSettled({ working, settleAfterS, seconds });

  React.useEffect(() => {
    if (working && controlled === undefined) setTicked(0);
  }, [working, controlled]);

  const running = !settled && controlled === undefined;
  React.useEffect(() => {
    if (!running) return;
    const start = Date.now();
    const id = setInterval(() => setTicked((Date.now() - start) / 1000), TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  return { seconds, settled };
}

function Glyph({
  glyph,
  style,
  settled,
}: {
  glyph: ThinkingLineGlyph;
  style?: React.CSSProperties;
  settled: boolean;
}) {
  if (glyph === "none") return null;
  let content: React.ReactNode = glyph;
  if (glyph === "sparkle") content = <Sparkle className="size-3.5 fill-current" />;
  else if (glyph === "dot") content = <span className="block size-1.5 rounded-full bg-current" />;
  return (
    <span
      data-slot="thinking-line-glyph"
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-opacity duration-300",
        settled && "opacity-40"
      )}
      style={style}
    >
      {content}
    </span>
  );
}

type StepsProps = {
  steps: string[];
  id: string;
  open: boolean;
  settled: boolean;
  textStyle?: React.CSSProperties;
  reduced: boolean;
};

function Steps({ steps, id, open, settled, textStyle, reduced }: StepsProps) {
  const lastIndex = steps.length - 1;
  return (
    <div
      className={cn(
        "grid",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        reduced ? "transition-none" : "transition-[grid-template-rows] duration-300"
      )}
    >
      <ol
        id={id}
        data-slot="thinking-line-steps"
        aria-hidden={open ? undefined : true}
        inert={!open}
        className="m-0 flex min-h-0 list-none flex-col gap-1 overflow-hidden p-0 pl-6 text-muted-foreground text-sm"
      >
        {steps.map((step, index) => {
          const current = index === lastIndex && !settled;
          return (
            <li key={`${index}-${step}`} className="flex items-center gap-2">
              {current ? (
                <span className="size-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Check
                  data-slot="thinking-line-step-check"
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-success"
                />
              )}
              <span style={current ? textStyle : undefined}>{step}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Linha de raciocínio ao vivo: respira e brilha enquanto trabalha, assenta com o tempo gasto. */
function ThinkingLine({
  ref,
  className,
  label = "Pensando…",
  doneLabel = "",
  glyph = "sparkle",
  steps = [],
  collapsible = true,
  collapseOnSettle = true,
  working = true,
  settleAfterS = 0,
  elapsed,
  showTimer = true,
  shimmer = true,
  onSettle,
  ...props
}: ThinkingLineProps) {
  const reduced = useShouldReduceMotion();
  const { seconds, settled } = useThoughtClock(working, settleAfterS, elapsed);
  const stepsId = React.useId();
  const [open, setOpen] = React.useState(!(settled && collapseOnSettle));

  const secondsRef = React.useRef(seconds);
  secondsRef.current = seconds;
  const onSettleRef = React.useRef(onSettle);
  onSettleRef.current = onSettle;
  const wasSettled = React.useRef(settled);
  React.useEffect(() => {
    if (settled && !wasSettled.current) onSettleRef.current?.(secondsRef.current);
    wasSettled.current = settled;
    setOpen(!(settled && collapseOnSettle));
  }, [settled, collapseOnSettle]);

  const animate = !settled && !reduced;
  const sweep = animate && shimmer;
  const textStyle = sweep ? SHIMMER_STYLE : animate ? BREATHE_STYLE : undefined;
  const glyphStyle = animate ? BREATHE_STYLE : undefined;
  const text = settled ? settledLabel({ doneLabel, showTimer, seconds }) : label;
  const hasSteps = steps.length > 0;
  const toggles = collapsible && hasSteps;

  const row = (
    <>
      <Glyph glyph={glyph} style={glyphStyle} settled={settled} />
      <span
        key={settled ? "settled" : "working"}
        data-slot="thinking-line-label"
        aria-hidden="true"
        className="text-foreground text-sm"
        style={settled && !reduced ? SWAP_STYLE : textStyle}
      >
        {text}
      </span>
      {!settled && showTimer && (
        <span
          data-slot="thinking-line-timer"
          aria-hidden="true"
          className="font-mono text-muted-foreground text-xs tabular-nums"
        >
          {formatThought(seconds)}
        </span>
      )}
      {toggles && (
        <ChevronRight
          aria-hidden="true"
          className={cn(
            "size-3.5 text-muted-foreground",
            reduced ? "transition-none" : "transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      )}
    </>
  );

  return (
    <div
      ref={ref}
      data-slot="thinking-line"
      data-state={settled ? "settled" : "working"}
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      <style>{KEYFRAMES_CSS}</style>
      {toggles ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={stepsId}
          aria-label={text}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex w-fit items-center gap-2 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {row}
        </button>
      ) : (
        <div className="inline-flex w-fit items-center gap-2">{row}</div>
      )}
      {hasSteps && (
        <Steps
          steps={steps}
          id={stepsId}
          open={open || !collapsible}
          settled={settled}
          textStyle={textStyle}
          reduced={reduced}
        />
      )}
      <output className="sr-only">
        {settled ? settledAnnouncement({ doneLabel, showTimer, seconds }) : label}
      </output>
    </div>
  );
}

ThinkingLine.displayName = "ThinkingLine";

export { ThinkingLine };
