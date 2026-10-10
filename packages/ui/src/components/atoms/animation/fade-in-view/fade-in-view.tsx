"use client";

import { motion, useInView } from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  disappearTimerSeconds,
  type FadeEase,
  type FadeState,
  fadeVariants,
} from "./fade-in-view-utils";

export type FadeInViewProps = Omit<
  React.ComponentProps<"div">,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationEnd"
> & {
  /** Desfoque no início. */
  blur?: boolean;
  /** Duração da entrada, em segundos. */
  duration?: number;
  /** Atraso da entrada, em segundos. */
  delay?: number;
  ease?: FadeEase;
  /** Fração visível que dispara, de 0 a 1. */
  threshold?: number;
  initialOpacity?: number;
  /** Segundos depois de aparecer para sumir. 0 = não some. */
  disappearAfter?: number;
  /** Duração da saída, em segundos. */
  disappearDuration?: number;
  disappearEase?: FadeEase;
  /** Anima só na primeira vez que entra na tela. */
  once?: boolean;
  onAppear?: () => void;
  onDisappear?: () => void;
};

function FadeInView({
  ref,
  className,
  children,
  blur = false,
  duration = 0.8,
  delay = 0,
  ease = "easeOut",
  threshold = 0.1,
  initialOpacity = 0,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = "easeIn",
  once = true,
  onAppear,
  onDisappear,
  ...props
}: FadeInViewProps) {
  const reduced = useShouldReduceMotion();
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const [state, setState] = React.useState<FadeState>(reduced ? "shown" : "hidden");
  const inView = useInView(innerRef, { amount: threshold, once });

  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  // Em movimento reduzido o conteúdo já nasce visível; só a visibilidade não é controlada pelo scroll.
  React.useEffect(() => {
    if (reduced) return;
    if (inView) setState("shown");
    else if (!once) setState("hidden");
  }, [inView, once, reduced]);

  React.useEffect(() => {
    if (state !== "shown" || disappearAfter <= 0) return;
    const seconds = reduced
      ? disappearAfter
      : disappearTimerSeconds(delay, duration, disappearAfter);
    const timer = setTimeout(() => setState("gone"), seconds * 1000);
    return () => clearTimeout(timer);
  }, [state, disappearAfter, delay, duration, reduced]);

  // Callbacks por timer (e não por onAnimationComplete) para o fim da animação ser determinístico.
  const callbacks = React.useRef({ onAppear, onDisappear });
  callbacks.current = { onAppear, onDisappear };
  const entrySeconds = reduced ? 0 : delay + duration;
  const exitSeconds = reduced ? 0 : disappearDuration;

  React.useEffect(() => {
    if (state === "hidden") return;
    const seconds = state === "shown" ? entrySeconds : exitSeconds;
    const timer = setTimeout(() => {
      if (state === "shown") callbacks.current.onAppear?.();
      else callbacks.current.onDisappear?.();
    }, seconds * 1000);
    return () => clearTimeout(timer);
  }, [state, entrySeconds, exitSeconds]);

  const variants = fadeVariants({
    blur: blur && !reduced,
    initialOpacity: reduced ? 1 : initialOpacity,
    duration: reduced ? 0 : duration,
    delay: reduced ? 0 : delay,
    ease,
    disappearDuration: reduced ? 0 : disappearDuration,
    disappearEase,
  });

  return (
    <motion.div
      ref={setRefs}
      data-slot="fade-in-view"
      data-state={state}
      className={cn(className)}
      variants={variants}
      initial={reduced ? "shown" : "hidden"}
      animate={state}
      aria-hidden={state === "gone" ? true : undefined}
      inert={state === "gone" ? true : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

FadeInView.displayName = "FadeInView";

export { FadeInView };
