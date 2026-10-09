/**
 * EvasiveTarget Component - Flowtomic UI
 *
 * Campo invisível onde uma pílula foge do mouse: quanto mais perto o ponteiro,
 * maior o salto; ao se afastar ela volta para casa; depois de `patience` fugas
 * ela desiste e fica parada para ser clicada. Em toque e no teclado nada foge.
 *
 * ATENÇÃO: efeito lúdico para página de erro, easter egg ou onboarding.
 * NUNCA envolva um controle de recusa, de fechar ou de cancelar: quem não
 * consegue clicar não consegue sair.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/evasive-target.md
 */

"use client";

import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  applyWall,
  assertPatience,
  countsAsDodge,
  type EvasiveAxis,
  type EvasiveWall,
  fleeOffset,
  type Point,
  tauntFor,
} from "./evasive-target-utils";

export type EvasiveState = {
  dodges: number;
  gaveUp: boolean;
  caught: boolean;
  fleeing: boolean;
};

export type EvasiveTargetProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Ausente = pílula própria com as falas de `taunts`. */
  children?: React.ReactNode | ((state: EvasiveState) => React.ReactNode);
  taunts?: string[];
  /** Aviso mostrado quando o ponteiro não é mouse. */
  touchNotice?: string;
  fieldHeight?: number;
  /** Distância máxima, em px, que a pílula foge. */
  reach?: number;
  /** Distância do ponteiro em que ela começa a reagir. */
  radius?: number;
  /** Expoente da curva: maior = reage só bem de perto. */
  falloff?: number;
  fleeMs?: number;
  returnMs?: number;
  returnBounce?: number;
  axis?: EvasiveAxis;
  wall?: EvasiveWall;
  /** Fugas antes de desistir (mínimo 1). */
  patience?: number;
  disabled?: boolean;
  onDodge?: (count: number) => void;
  onGiveUp?: () => void;
  onCatch?: () => void;
};

const DEFAULT_TAUNTS = ["Me pega", "Não", "Muito lento", "Quase", "Tá bom, tá bom"];
const HOME: Point = { x: 0, y: 0 };

function wallBounds(field: HTMLElement, pill: HTMLElement | null) {
  const rect = field.getBoundingClientRect();
  const halfX = Math.max((rect.width - (pill?.offsetWidth ?? 0)) / 2, 0);
  const halfY = Math.max((rect.height - (pill?.offsetHeight ?? 0)) / 2, 0);
  return { x: { min: -halfX, max: halfX }, y: { min: -halfY, max: halfY } };
}

/** Pílula que foge do mouse e desiste depois de algumas tentativas. */
function EvasiveTarget({
  ref,
  className,
  style,
  children,
  taunts = DEFAULT_TAUNTS,
  touchNotice = "",
  fieldHeight = 240,
  reach = 72,
  radius = 120,
  falloff = 2,
  fleeMs = 130,
  returnMs = 620,
  returnBounce = 0.1,
  axis = "both",
  wall = "clamp",
  patience = 4,
  disabled = false,
  onDodge,
  onGiveUp,
  onCatch,
  onPointerMove,
  onPointerLeave,
  ...props
}: EvasiveTargetProps) {
  assertPatience(patience);
  const reduced = useShouldReduceMotion();
  const pillRef = React.useRef<HTMLDivElement>(null);
  const armed = React.useRef(true);
  const dodgeCount = React.useRef(0);
  const [offset, setOffset] = React.useState<Point>(HOME);
  const [dodges, setDodges] = React.useState(0);
  const [gaveUp, setGaveUp] = React.useState(false);
  const [caught, setCaught] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const fleeing = offset.x !== 0 || offset.y !== 0;
  const frozen = disabled || gaveUp || reduced;

  const registerDodge = () => {
    dodgeCount.current += 1;
    setDodges(dodgeCount.current);
    onDodge?.(dodgeCount.current);
    if (dodgeCount.current < patience) return false;
    setGaveUp(true);
    setOffset(HOME);
    onGiveUp?.();
    return true;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (event.pointerType !== "mouse") {
      setTouched(true);
      return;
    }
    if (frozen) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const pointer = {
      x: event.clientX - (rect.left + rect.width / 2),
      y: event.clientY - (rect.top + rect.height / 2),
    };
    const raw = fleeOffset(pointer, HOME, reach, radius, falloff, axis);
    const bounds = wallBounds(event.currentTarget, pillRef.current);
    const next = { x: applyWall(raw.x, bounds.x, wall), y: applyWall(raw.y, bounds.y, wall) };
    const step = countsAsDodge(armed.current, Math.hypot(next.x, next.y), reach);
    armed.current = step.armed;
    if (step.counted && registerDodge()) return;
    setOffset(next);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    armed.current = true;
    setOffset(HOME);
  };

  const handleCatch = () => {
    if (disabled) return;
    setCaught(true);
    onCatch?.();
  };

  const state: EvasiveState = { dodges, gaveUp, caught, fleeing };
  const label = tauntFor(dodges, taunts, gaveUp);
  const transition = fleeing
    ? { duration: fleeMs / 1000, ease: "easeOut" as const }
    : { type: "spring" as const, duration: returnMs / 1000, bounce: returnBounce };
  const content =
    typeof children === "function"
      ? children(state)
      : (children ?? (
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "rounded-full px-4 py-2 font-medium text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              caught ? "bg-foreground text-background" : "bg-primary text-primary-foreground"
            )}
          >
            {label}
          </button>
        ));

  return (
    <div
      ref={ref}
      data-slot="evasive-target"
      data-gave-up={gaveUp}
      data-disabled={disabled}
      className={cn("relative flex items-center justify-center", className)}
      style={{ height: fieldHeight, ...style }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      <motion.div
        ref={pillRef}
        data-slot="evasive-target-pill"
        data-fleeing={fleeing}
        data-caught={caught}
        animate={{ x: offset.x, y: offset.y }}
        transition={transition}
        onClick={handleCatch}
      >
        {content}
      </motion.div>
      {touched && touchNotice && (
        <output className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-muted-foreground text-xs">
          {touchNotice}
        </output>
      )}
    </div>
  );
}

EvasiveTarget.displayName = "EvasiveTarget";

export { EvasiveTarget };
