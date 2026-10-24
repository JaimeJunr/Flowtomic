import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { MotionConfigContext, motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms";
import {
  formatTime,
  nearestIndex,
  parseTime,
  percentAt,
  textOf,
  tickPercents,
} from "./day-timeline-utils";

export type DayMoment = {
  id: string;
  /** Horário em 24 h, "HH:MM". */
  time: string;
  /** Rótulo de contexto acima do título ("No trabalho"). */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Texto do balão ao lado do avatar. */
  message?: React.ReactNode;
  /** Reação pequena no canto do balão. */
  reaction?: React.ReactNode;
};

export type DayTimelineProps = Omit<React.ComponentProps<"section">, "defaultValue"> & {
  /** Momentos em ordem de horário. */
  moments: DayMoment[];
  /** Id do momento ativo (controlado). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Personagem opcional acima do cursor, ao lado do balão. */
  avatar?: React.ReactNode;
  /** Início da régua, "HH:MM"; padrão o primeiro momento. */
  start?: string;
  /** Fim da régua, "HH:MM"; padrão o último momento. */
  end?: string;
  /** Intervalo dos traços menores, em minutos. */
  tickMinutes?: number;
  /** Milissegundos por momento; desligado por padrão. */
  autoPlay?: number;
  /** Nome acessível da régua. */
  label?: string;
};

const FLIP_AFTER_PERCENT = 65;

// Classes literais: o Tailwind só gera o que aparece escrito. 24 = metade do avatar (48);
// 376 = avatar + espaço + balão de 320 (prende o grupo dentro do quadro).
const GROUP_LEFT = "@min-[640px]:left-[clamp(0px,calc(var(--pos)_*_1%_-_24px),calc(100%_-_376px))]";
const GROUP_RIGHT =
  "@min-[640px]:right-[clamp(0px,calc((100_-_var(--pos))_*_1%_-_24px),calc(100%_-_376px))] @min-[640px]:flex-row-reverse";

function useShouldReduceMotion(): boolean {
  const reducedMotionConfig = React.useContext(MotionConfigContext).reducedMotion;
  const prefersReduced = useReducedMotion();
  return Boolean(prefersReduced) || reducedMotionConfig === "always";
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

type DragState = { startX: number; startFraction: number; width: number };

function DayTimeline({
  moments,
  value,
  defaultValue,
  onValueChange,
  avatar,
  start,
  end,
  tickMinutes = 30,
  autoPlay,
  label = "Momento do dia",
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ref,
  ...props
}: DayTimelineProps) {
  const [inner, setInner] = React.useState(defaultValue ?? moments[0]?.id);
  const activeId = value ?? inner;
  const found = moments.findIndex((moment) => moment.id === activeId);
  const index = found < 0 ? 0 : found;
  const moment = moments[index];

  const reduceMotion = useShouldReduceMotion();
  const trackRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<DragState | null>(null);
  const [dragFraction, setDragFraction] = React.useState<number | null>(null);
  const [paused, setPaused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const startMinutes = parseTime(start ?? moments[0]?.time ?? "00:00");
  const endMinutes = parseTime(end ?? moments[moments.length - 1]?.time ?? "00:00");
  const momentMinutes = moments.map((item) => parseTime(item.time));
  const percents = momentMinutes.map((at) => percentAt(at, startMinutes, endMinutes));
  const ticks = tickPercents(startMinutes, endMinutes, tickMinutes, momentMinutes);

  const select = React.useCallback(
    (next: number) => {
      const target = moments[Math.min(Math.max(next, 0), moments.length - 1)];
      if (!target || target.id === moment?.id) return;
      if (value === undefined) setInner(target.id);
      onValueChange?.(target.id);
    },
    [moments, moment?.id, value, onValueChange]
  );

  const playing = Boolean(autoPlay) && !paused && !hovered && !focused && !reduceMotion;
  React.useEffect(() => {
    if (!playing || !autoPlay || dragFraction !== null) return;
    const timer = setTimeout(() => select(index === moments.length - 1 ? 0 : index + 1), autoPlay);
    return () => clearTimeout(timer);
  }, [playing, autoPlay, dragFraction, index, moments.length, select]);

  if (!moment) return null;

  const dragging = dragFraction !== null;
  const pos = dragging ? dragFraction * 100 : percents[index];
  const shownTime = dragging
    ? formatTime(startMinutes + dragFraction * (endMinutes - startMinutes))
    : moment.time;
  const flip = pos > FLIP_AFTER_PERCENT;
  const still = reduceMotion || dragging;

  const onKeyDown = (event: React.KeyboardEvent) => {
    const targets: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: moments.length - 1,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    select(targets[event.key]);
  };

  const onDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    const width = trackRef.current?.getBoundingClientRect().width ?? 0;
    if (width <= 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { startX: event.clientX, startFraction: percents[index] / 100, width };
    setDragFraction(percents[index] / 100);
  };

  const onDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    setDragFraction(clamp01(drag.startFraction + (event.clientX - drag.startX) / drag.width));
  };

  const onDragEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    const fraction = clamp01(drag.startFraction + (event.clientX - drag.startX) / drag.width);
    setDragFraction(null);
    select(nearestIndex(percents, fraction * 100));
  };

  const fade = reduceMotion
    ? { initial: false as const }
    : { initial: { opacity: 0 }, animate: { opacity: 1 } };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: os handlers só observam ponteiro e foco para pausar o autoPlay; a seção não é um controle
    <section
      ref={ref}
      data-slot="day-timeline"
      className={cn("@container relative w-full", className)}
      style={{ ...style, "--pos": pos, "--n": moments.length } as React.CSSProperties}
      onPointerEnter={(event) => {
        setHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        onPointerLeave?.(event);
      }}
      onFocus={(event) => {
        if (isKeyboardFocus(event.target)) setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        onBlur?.(event);
      }}
      {...props}
    >
      {autoPlay ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-0 right-4 z-10"
          aria-label={paused ? "Retomar apresentação" : "Pausar apresentação"}
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? <Play /> : <Pause />}
        </Button>
      ) : null}

      <div
        data-slot="day-timeline-stage"
        className="flex min-h-40 items-end px-4 @min-[640px]:px-20"
      >
        <div className="relative flex w-full items-end">
          <div
            className={cn(
              "flex w-full items-end gap-3",
              "@min-[640px]:absolute @min-[640px]:bottom-0 @min-[640px]:w-fit",
              flip ? GROUP_RIGHT : GROUP_LEFT
            )}
          >
            {avatar ? <div className="shrink-0">{avatar}</div> : null}
            {moment.message ? (
              <motion.div
                key={moment.id}
                {...fade}
                transition={{ duration: 0.15 }}
                data-slot="day-timeline-bubble"
                className="relative min-w-0 flex-1 rounded-2xl bg-muted p-4 text-sm @min-[640px]:max-w-[320px] @min-[640px]:flex-none"
              >
                {moment.message}
                {moment.reaction ? (
                  <span className="absolute -right-2 -bottom-2 grid size-7 place-items-center rounded-full border border-border bg-background text-sm">
                    {moment.reaction}
                  </span>
                ) : null}
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden @min-[640px]:px-20">
        <div
          ref={trackRef}
          data-slot="day-timeline-track"
          className={cn(
            "relative left-1/2 h-[72px] w-[calc(var(--n)*160px)] translate-x-[calc(var(--pos)*-1%)]",
            "@min-[640px]:left-0 @min-[640px]:w-full @min-[640px]:translate-x-0",
            !still && "transition-transform duration-300 ease-out"
          )}
        >
          <div
            role="slider"
            tabIndex={0}
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={moments.length - 1}
            aria-valuenow={index}
            aria-valuetext={`${moment.time}, ${textOf(moment.title)}`}
            onKeyDown={onKeyDown}
            className="absolute inset-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          />
          {ticks.map((tick) => (
            <span
              key={tick}
              aria-hidden="true"
              className="pointer-events-none absolute top-[60px] h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-border"
              style={{ left: `${tick}%` }}
            />
          ))}
          {moments.map((item, at) => (
            <button
              key={item.id}
              type="button"
              tabIndex={-1}
              data-slot="day-timeline-moment"
              data-active={at === index ? "" : undefined}
              aria-label={`${item.time}: ${textOf(item.title)}`}
              onClick={() => select(at)}
              className={cn(
                "absolute top-[60px] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full before:absolute before:-inset-2 before:content-['']",
                "bg-[color-mix(in_oklch,var(--muted-foreground)_40%,transparent)] data-[active]:bg-primary"
              )}
              style={{ left: `${percents[at]}%` }}
            />
          ))}
          <div
            data-slot="day-timeline-cursor"
            className={cn(
              "absolute top-0 flex -translate-x-1/2 cursor-grab touch-pan-y select-none flex-col items-center active:cursor-grabbing",
              !still && "transition-[left] duration-300 ease-out"
            )}
            style={{ left: `${pos}%` }}
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
          >
            <div className="flex h-9 items-center gap-0.5 rounded-lg bg-primary px-1 text-primary-foreground">
              <StepButton
                label="Momento anterior"
                disabled={index === 0}
                onClick={() => select(index - 1)}
              >
                <ChevronLeft />
              </StepButton>
              <span className="min-w-12 text-center font-mono text-sm tabular-nums">
                {shownTime}
              </span>
              <StepButton
                label="Próximo momento"
                disabled={index === moments.length - 1}
                onClick={() => select(index + 1)}
              >
                <ChevronRight />
              </StepButton>
            </div>
            <div aria-hidden="true" className="h-6 w-0.5 bg-primary" />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent @min-[640px]:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent @min-[640px]:hidden"
        />
      </div>

      <div
        data-slot="day-timeline-content"
        aria-live={playing ? "off" : "polite"}
        className="mx-auto mt-6 max-w-[60ch] px-4 text-center"
      >
        <motion.div key={moment.id} {...fade} transition={{ duration: 0.15 }}>
          {moment.eyebrow ? (
            <p className="text-sm text-muted-foreground">{moment.eyebrow}</p>
          ) : null}
          <p className="mt-1 text-balance font-semibold tracking-tight text-display-xs @min-[768px]:text-display-sm">
            {moment.title}
          </p>
          {moment.description ? (
            <p className="mt-3 text-muted-foreground">{moment.description}</p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="size-7 text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary-foreground)_15%,transparent)] hover:text-primary-foreground disabled:opacity-40"
    >
      {children}
    </Button>
  );
}

function isKeyboardFocus(target: EventTarget): boolean {
  try {
    return (target as HTMLElement).matches(":focus-visible");
  } catch {
    return true;
  }
}

export { DayTimeline };
