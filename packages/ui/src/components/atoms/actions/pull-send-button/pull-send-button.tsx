/**
 * PullSendButton Component - Flowtomic UI
 *
 * Botão de enviar assentado num poço: dá para puxá-lo como um estilingue. Um
 * elástico liga o poço ao botão, um arco mostra a força e, passando do ponto de
 * armar, soltar lança o botão de volta numa mola e solta uma rajada de
 * partículas. Toque e Enter também enviam. Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/pull-send-button.md
 */

"use client";

import { ArrowUp } from "lucide-react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  type BurstParticle,
  bandWidth,
  burst,
  isLoaded,
  type PullAxis,
  resistPull,
} from "./pull-send-button-utils";

type NativeButtonProps = Omit<
  React.ComponentProps<"button">,
  | "onClick"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "style"
>;

export type PullSendButtonProps = NativeButtonProps & {
  /** Ícone do botão. Padrão: seta para cima. */
  children?: React.ReactNode;
  onSend: () => void;
  /** Diâmetro do botão, em px. */
  size?: number;
  /** Distância (px) a partir da qual o envio fica carregado. */
  armAt?: number;
  /** Limite do puxão, em px; a resistência cresce até parar aqui. */
  maxPull?: number;
  /** 0..1. Quanto a mola quica ao assentar. */
  recoil?: number;
  /** Alcance (px) da partícula principal. */
  flight?: number;
  /** Quantidade de partículas. 0 = nenhuma. */
  particles?: number;
  /** Abertura do cone de partículas, em graus. */
  spread?: number;
  axis?: PullAxis;
  /** Se um toque simples (sem puxar) envia. Enter e Espaço sempre enviam. */
  tapSends?: boolean;
  /** Gerador aleatório das partículas; injetável para teste. */
  random?: () => number;
};

type PullGesture = { pointerId: number; startX: number; startY: number; distance: number };
type Burst = { id: number; items: BurstParticle[] };

const WELL_PADDING_PX = 14;
const TAP_THRESHOLD_PX = 4;
const BURST_LIFETIME_MS = 1200;
const UP_ANGLE = -90;
const OVERSHOOT_FACTOR = 0.35;

function PullSendButton({
  ref,
  className,
  children,
  onSend,
  size = 48,
  armAt = 48,
  maxPull = 140,
  recoil = 0.2,
  flight = 120,
  particles = 12,
  spread = 60,
  axis = "any",
  tapSends = true,
  random = Math.random,
  disabled = false,
  "aria-label": ariaLabel = "Enviar",
  ...props
}: PullSendButtonProps) {
  const reduced = useShouldReduceMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [distance, setDistance] = React.useState(0);
  const [bursts, setBursts] = React.useState<Burst[]>([]);
  const gesture = React.useRef<PullGesture | null>(null);
  const tapPending = React.useRef(false);
  const swallowClick = React.useRef(false);
  const burstId = React.useRef(0);
  const timers = React.useRef(new Set<ReturnType<typeof setTimeout>>());

  const well = size + WELL_PADDING_PX * 2;
  const center = well / 2;
  const loaded = isLoaded(distance, armAt);
  const bandX = useTransform(x, (value) => center + value);
  const bandY = useTransform(y, (value) => center + value);

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
    };
  }, []);

  const launch = (angle: number) => {
    if (reduced || particles === 0) return;
    const id = burstId.current++;
    setBursts((current) => [
      ...current,
      { id, items: burst(particles, angle, spread, flight, random) },
    ]);
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setBursts((current) => current.filter((entry) => entry.id !== id));
    }, BURST_LIFETIME_MS);
    timers.current.add(timer);
  };

  const settle = async (fromX: number, fromY: number, send: boolean) => {
    if (send) {
      // Atravessa o poço para o lado oposto antes de assentar na mola.
      const overshoot = -OVERSHOOT_FACTOR;
      await Promise.all([
        animate(x, fromX * overshoot, { duration: 0.12, ease: "easeOut" }),
        animate(y, fromY * overshoot, { duration: 0.12, ease: "easeOut" }),
      ]);
    }
    const spring = { type: "spring", bounce: send ? recoil : 0.1, duration: 0.5 } as const;
    animate(x, 0, spring);
    animate(y, 0, spring);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || reduced || event.button !== 0) return;
    tapPending.current = false;
    swallowClick.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      distance: 0,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const pulled = resistPull(
      event.clientX - current.startX,
      event.clientY - current.startY,
      maxPull,
      axis
    );
    current.distance = pulled.distance;
    x.set(pulled.x);
    y.set(pulled.y);
    setDistance(pulled.distance);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current;
    gesture.current = null;
    if (!current || current.pointerId !== event.pointerId) return;
    setDistance(0);
    if (current.distance < TAP_THRESHOLD_PX) {
      tapPending.current = true;
      void settle(x.get(), y.get(), false);
      return;
    }
    swallowClick.current = true;
    const fromX = x.get();
    const fromY = y.get();
    const send = event.type === "pointerup" && isLoaded(current.distance, armAt);
    void settle(fromX, fromY, send);
    if (!send) return;
    onSend();
    launch(Math.atan2(-fromY, -fromX) * (180 / Math.PI));
  };

  const handleClick = () => {
    if (swallowClick.current) {
      swallowClick.current = false;
      return;
    }
    const isTap = tapPending.current;
    tapPending.current = false;
    if (isTap && !tapSends) return;
    onSend();
    launch(UP_ANGLE);
  };

  return (
    <span
      data-slot="pull-send-button"
      data-loaded={loaded}
      className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-muted"
      style={{ width: well, height: well }}
    >
      {!reduced && (
        <svg
          aria-hidden="true"
          width={well}
          height={well}
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          <circle
            data-slot="pull-send-button-arc"
            cx={center}
            cy={center}
            r={center - 1}
            fill="none"
            pathLength={1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${Math.min(distance / armAt, 1)} 1`}
            transform={`rotate(-90 ${center} ${center})`}
            className="stroke-primary"
          />
          <motion.line
            data-slot="pull-send-button-band"
            x1={center}
            y1={center}
            x2={bandX}
            y2={bandY}
            strokeWidth={bandWidth(distance, maxPull)}
            strokeLinecap="round"
            className={loaded ? "stroke-primary" : "stroke-border"}
          />
        </svg>
      )}
      <motion.button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(
          "relative inline-flex touch-none select-none items-center justify-center rounded-full bg-primary text-primary-foreground outline-none",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          !disabled && !reduced && "cursor-grab active:cursor-grabbing",
          className
        )}
        style={{ width: size, height: size, x: reduced ? 0 : x, y: reduced ? 0 : y }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClick={handleClick}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {children ?? <ArrowUp className="size-1/2" aria-hidden="true" />}
      </motion.button>
      {bursts.flatMap((entry) =>
        entry.items.map((item, index) => <Particle key={`${entry.id}-${index}`} item={item} />)
      )}
    </span>
  );
}

function Particle({ item }: { item: BurstParticle }) {
  const radians = (item.angle * Math.PI) / 180;
  return (
    <motion.span
      aria-hidden="true"
      data-slot="pull-send-button-particle"
      className="pointer-events-none absolute top-1/2 left-1/2 rounded-full bg-primary"
      style={{
        width: item.size,
        height: item.size,
        marginLeft: -item.size / 2,
        marginTop: -item.size / 2,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(radians) * item.distance,
        y: Math.sin(radians) * item.distance,
        opacity: 0,
        scale: 0.4,
      }}
      transition={{ duration: 0.7, delay: item.delay, ease: "easeOut" }}
    />
  );
}

PullSendButton.displayName = "PullSendButton";

export { PullSendButton };
