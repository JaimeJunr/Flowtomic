/**
 * Magnetic Component - Flowtomic UI
 *
 * Puxa o filho em direção ao mouse quando o ponteiro chega perto, como um ímã
 * fraco. A raiz fica parada (mede a área); só o elemento interno se move.
 * Em toque e com movimento reduzido nada se move.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/magnetic.md
 */

"use client";

import { animate, motion, useMotionValue } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { isInZone, magnetOffset } from "./magnetic-utils";

export type MagneticProps = React.ComponentProps<"div"> & {
  /** Distância em px, além da borda, em que o ímã liga. */
  padding?: number;
  /** Maior = menos deslocamento. Deslocamento = distância / strength. */
  strength?: number;
  /** Teto do deslocamento em px, para não fugir do layout. */
  maxOffset?: number;
  disabled?: boolean;
  /** Classe do elemento que se move (a raiz não se move). */
  innerClassName?: string;
};

// Ao ligar a mola é rápida (~0,3 s); ao soltar, mais lenta (~0,5 s).
const ENGAGE_SPRING = { stiffness: 300, damping: 24, mass: 0.6 };
const RELEASE_SPRING = { stiffness: 120, damping: 20, mass: 0.6 };

function useMagnet(
  rootRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
  padding: number,
  strength: number,
  maxOffset: number
) {
  const [active, setActive] = React.useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  React.useEffect(() => {
    if (!enabled) {
      setActive(false);
      x.set(0);
      y.set(0);
      return;
    }
    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const near = isInZone(rect, event.clientX, event.clientY, padding);
      const offset = near
        ? magnetOffset(rect, event.clientX, event.clientY, strength, maxOffset)
        : { x: 0, y: 0 };
      setActive(near);
      // A mola vai por evento: trocar o config do useSpring num render chegava tarde e
      // prendia o deslocamento no alvo do evento anterior.
      const spring = { type: "spring" as const, ...(near ? ENGAGE_SPRING : RELEASE_SPRING) };
      animate(x, offset.x, spring);
      animate(y, offset.y, spring);
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [enabled, padding, strength, maxOffset, rootRef, x, y]);

  return { active, x, y };
}

function Magnetic({
  ref,
  className,
  innerClassName,
  children,
  padding = 80,
  strength = 3,
  maxOffset = 24,
  disabled = false,
  ...props
}: MagneticProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const reduceMotion = useShouldReduceMotion();
  const { active, x, y } = useMagnet(
    rootRef,
    !disabled && !reduceMotion,
    padding,
    strength,
    maxOffset
  );

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  return (
    <div
      data-slot="magnetic"
      data-active={active ? "true" : "false"}
      ref={setRefs}
      className={cn("inline-block", className)}
      {...props}
    >
      <motion.div data-slot="magnetic-inner" style={{ x, y }} className={innerClassName}>
        {children}
      </motion.div>
    </div>
  );
}
Magnetic.displayName = "Magnetic";

export { Magnetic };
