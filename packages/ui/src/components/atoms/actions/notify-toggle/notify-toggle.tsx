/**
 * NotifyToggle Component - Flowtomic UI
 *
 * Botão-pílula "Avise-me": ao ligar, o sino balança pendurado pelo topo, a cor
 * e o rótulo trocam com fade e, opcionalmente, ondas saem do sino e um badge
 * mostra a contagem. A largura é sempre a do rótulo mais longo.
 * Baseado em Radix Toggle e motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/notify-toggle.md
 */

"use client";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import { Bell } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { ringKeyframes } from "./notify-toggle-utils";

type NotifyToggleSize = "sm" | "default" | "lg";

export type NotifyToggleProps = Omit<
  React.ComponentProps<typeof TogglePrimitive.Root>,
  "children"
> & {
  offLabel?: string;
  onLabel?: string;
  icon?: React.ReactNode;
  size?: NotifyToggleSize;
  /** Graus do primeiro balanço. */
  ringAmplitude?: number;
  /** Meias-oscilações até parar. */
  ringPasses?: number;
  /** 1 = decai igual; 2 = segunda já pequena; 0.5 = continua balançando. */
  ringDecay?: number;
  ringDurationMs?: number;
  /** Onde o ícone fica pendurado, % da altura (16 = topo). */
  ringPivot?: number;
  count?: number;
  /** Mostra o badge com count > 0 e ligado. */
  showBadge?: boolean;
  waves?: boolean;
};

const SIZE_CLASSES: Record<NotifyToggleSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  default: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2.5 px-5 text-base",
};

const LABEL_SWAP_S = 0.2;
const WAVE_DELAYS_S = [0, 0.18];

function Label({ active, slot, children }: { active: boolean; slot: string; children: string }) {
  return (
    <motion.span
      data-slot={slot}
      aria-hidden={active ? undefined : true}
      className={cn("[grid-area:1/1] justify-self-start", !active && "invisible")}
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: LABEL_SWAP_S }}
    >
      {children}
    </motion.span>
  );
}

function Waves({ burst, durationS }: { burst: number; durationS: number }) {
  return WAVE_DELAYS_S.map((delay) => (
    <motion.span
      key={`${burst}-${delay}`}
      aria-hidden="true"
      data-slot="notify-toggle-wave"
      className="pointer-events-none absolute inset-0 rounded-full border border-current"
      initial={{ opacity: 0.5, scale: 1 }}
      animate={{ opacity: 0, scale: 2.2 }}
      transition={{ duration: durationS, delay, ease: "easeOut" }}
    />
  ));
}

function Badge({ count, reduced }: { count: number; reduced: boolean }) {
  return (
    <span
      data-slot="notify-toggle-badge"
      className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center overflow-hidden rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground"
    >
      <motion.span
        key={count}
        className="inline-block"
        initial={reduced ? false : { y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {count}
      </motion.span>
    </span>
  );
}

type RingState = { burst: number; passes: number };

/** Balanços disparados por interação: ligar (passes cheios) ou count subir (metade). */
function useRing(pressed: boolean, count: number, passes: number) {
  const [ring, setRing] = React.useState<RingState>({ burst: 0, passes });
  const previousCount = React.useRef(count);

  const trigger = React.useCallback((nextPasses: number) => {
    setRing((current) => ({ burst: current.burst + 1, passes: nextPasses }));
  }, []);

  React.useEffect(() => {
    if (pressed && count > previousCount.current) trigger(Math.round(passes / 2));
    previousCount.current = count;
  }, [count, pressed, passes, trigger]);

  return { ring, trigger };
}

/** Botão-pílula que liga/desliga avisos, com sino que balança ao ligar. */
function NotifyToggle({
  ref,
  className,
  offLabel = "Avise-me",
  onLabel = "Você será avisado",
  icon,
  size = "default",
  ringAmplitude = 17,
  ringPasses = 5,
  ringDecay = 1,
  ringDurationMs = 820,
  ringPivot = 16,
  count = 0,
  showBadge = true,
  waves = true,
  pressed: pressedProp,
  defaultPressed = false,
  onPressedChange,
  "aria-label": ariaLabel,
  ...props
}: NotifyToggleProps) {
  const reduced = useShouldReduceMotion();
  const [innerPressed, setInnerPressed] = React.useState(defaultPressed);
  const pressed = pressedProp ?? innerPressed;
  const { ring, trigger } = useRing(pressed, count, ringPasses);

  const handlePressedChange = (next: boolean) => {
    setInnerPressed(next);
    onPressedChange?.(next);
    if (next) trigger(ringPasses);
  };

  const animateRing = !reduced && ring.burst > 0;
  const durationS = ringDurationMs / 1000;
  const badgeVisible = showBadge && pressed && count > 0;

  return (
    <TogglePrimitive.Root
      ref={ref}
      data-slot="notify-toggle"
      aria-label={ariaLabel ?? offLabel}
      pressed={pressed}
      onPressedChange={handlePressedChange}
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-nowrap rounded-full bg-secondary font-medium text-secondary-foreground outline-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      <span data-slot="notify-toggle-icon" className="relative inline-flex">
        {animateRing && waves && (
          <Waves key={`waves-${ring.burst}`} burst={ring.burst} durationS={durationS} />
        )}
        <motion.span
          key={`bell-${ring.burst}`}
          className="inline-flex"
          style={{ transformOrigin: `50% ${ringPivot}%` }}
          animate={
            animateRing
              ? { rotate: ringKeyframes(ringAmplitude, ring.passes, ringDecay) }
              : undefined
          }
          transition={{ duration: durationS, ease: "easeInOut" }}
        >
          {icon ?? <Bell aria-hidden="true" />}
        </motion.span>
        {badgeVisible && <Badge count={count} reduced={reduced} />}
      </span>
      <span className="inline-grid">
        <Label active={!pressed} slot="notify-toggle-label-off">
          {offLabel}
        </Label>
        <Label active={pressed} slot="notify-toggle-label-on">
          {onLabel}
        </Label>
      </span>
      <span className="sr-only" aria-live="polite">
        {pressed ? onLabel : ""}
      </span>
    </TogglePrimitive.Root>
  );
}

NotifyToggle.displayName = "NotifyToggle";

export { NotifyToggle };
