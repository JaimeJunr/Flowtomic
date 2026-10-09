/**
 * Shimmer Component - Flowtomic UI
 *
 * Componente de texto com efeito shimmer animado
 */

import { motion, useAnimationControls } from "motion/react";
import {
  type CSSProperties,
  type ElementType,
  type JSX,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

export type TextShimmerProps = {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
  /** Lado de onde o brilho parte. "start" = comportamento original. */
  direction?: "start" | "end";
  /** Pausa entre uma passada do brilho e a próxima, em ms. */
  repeatDelayMs?: number;
  /** Congela o brilho enquanto o ponteiro está sobre o texto. */
  pauseOnHover?: boolean;
};

type ShimmerDirection = NonNullable<TextShimmerProps["direction"]>;

type ShimmerMotion = {
  initial: { backgroundPosition: string };
  animate: { backgroundPosition: string };
  transition: {
    repeat: number;
    duration: number;
    ease: "linear";
    repeatDelay?: number;
  };
};

export function buildShimmerMotion({
  direction,
  duration,
  repeatDelayMs,
}: {
  direction: ShimmerDirection;
  duration: number;
  repeatDelayMs?: number;
}): ShimmerMotion {
  if (repeatDelayMs !== undefined && !(repeatDelayMs >= 0)) {
    throw new RangeError(
      `invalid repeatDelayMs: received ${repeatDelayMs}, expected a non-negative number of milliseconds`
    );
  }
  const start = direction === "end" ? "0% center" : "100% center";
  const end = direction === "end" ? "100% center" : "0% center";
  return {
    initial: { backgroundPosition: start },
    animate: { backgroundPosition: end },
    transition: {
      repeat: Number.POSITIVE_INFINITY,
      duration,
      ease: "linear",
      ...(repeatDelayMs ? { repeatDelay: repeatDelayMs / 1000 } : {}),
    },
  };
}

// Pausa congela o valor atual; ao retomar, termina a passada em curso e só então volta ao loop,
// para o brilho continuar do mesmo ponto em vez de pular para o começo.
function useHoverPausableSweep(shimmerMotion: ShimmerMotion, enabled: boolean) {
  const controls = useAnimationControls();
  const elementRef = useRef<HTMLElement | null>(null);
  const runRef = useRef(0);
  const [paused, setPaused] = useState(false);

  const startLoop = useCallback(() => {
    controls.set(shimmerMotion.initial);
    controls.start(shimmerMotion.animate, shimmerMotion.transition);
  }, [controls, shimmerMotion]);

  const pause = useCallback(() => {
    runRef.current += 1;
    controls.stop();
    setPaused(true);
  }, [controls]);

  const resume = useCallback(async () => {
    setPaused(false);
    const run = ++runRef.current;
    const from = Number.parseFloat(shimmerMotion.initial.backgroundPosition);
    const to = Number.parseFloat(shimmerMotion.animate.backgroundPosition);
    const current = Number.parseFloat(elementRef.current?.style.backgroundPosition ?? "");
    const span = to - from;
    const remaining = Number.isFinite(current) && span !== 0 ? (to - current) / span : 1;
    if (remaining < 1) {
      await controls.start(
        { backgroundPosition: shimmerMotion.animate.backgroundPosition },
        { duration: shimmerMotion.transition.duration * Math.max(remaining, 0), ease: "linear" }
      );
    }
    if (run === runRef.current) startLoop();
  }, [controls, shimmerMotion, startLoop]);

  // Com `animate={controls}` nada começa sozinho: dispara o loop na montagem.
  useEffect(() => {
    if (enabled) startLoop();
  }, [enabled, startLoop]);

  return {
    controls,
    elementRef,
    paused,
    handlers: enabled ? { onPointerEnter: pause, onPointerLeave: resume } : {},
  };
}

const createMotionComponent =
  typeof motion?.create === "function"
    ? (Component: keyof JSX.IntrinsicElements | ElementType) =>
        motion.create(Component as keyof JSX.IntrinsicElements)
    : null;

// `motion.create` devolve um componente novo a cada chamada; criá-lo durante o render remontaria o
// texto e reiniciaria a animação. O cache fica fora do render, então a mesma tag (ou componente
// passado em `as`) sempre resolve para o mesmo componente animado.
const motionComponents = new Map<ElementType, ElementType>();

function getMotionComponent(Component: ElementType): ElementType {
  if (!createMotionComponent) return Component;
  let motionComponent = motionComponents.get(Component);
  if (!motionComponent) {
    motionComponent = createMotionComponent(Component) as ElementType;
    motionComponents.set(Component, motionComponent);
  }
  return motionComponent;
}

type ShimmerElementProps = { Tag: ElementType } & Record<string, unknown>;

// O elemento chega por prop porque o `react-hooks/static-components` não enxerga o cache acima e
// trata como "criado no render" qualquer tag que venha do retorno de uma função.
function ShimmerElement({ Tag, ...props }: ShimmerElementProps) {
  return <Tag {...props} />;
}

function ShimmerComponent({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
  direction = "start",
  repeatDelayMs,
  pauseOnHover = false,
}: TextShimmerProps) {
  const MotionComponent = getMotionComponent(Component);

  const shouldReduceMotion = useShouldReduceMotion();
  const shimmerMotion = useMemo(
    () => buildShimmerMotion({ direction, duration, repeatDelayMs }),
    [direction, duration, repeatDelayMs]
  );
  const sweep = useHoverPausableSweep(shimmerMotion, pauseOnHover && !shouldReduceMotion);

  const dynamicSpread = useMemo(() => (children?.length ?? 0) * spread, [children, spread]);

  const shimmerClassName = cn(
    "relative inline-block bg-size-[250%_100%,auto] bg-clip-text text-transparent",
    "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
    className
  );
  const shimmerStyle = {
    "--spread": `${dynamicSpread}px`,
    backgroundImage:
      "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))",
  } as CSSProperties;

  if (createMotionComponent && typeof MotionComponent !== "string" && !shouldReduceMotion) {
    return (
      <ShimmerElement
        Tag={MotionComponent}
        data-slot="shimmer"
        animate={pauseOnHover ? sweep.controls : shimmerMotion.animate}
        className={shimmerClassName}
        initial={shimmerMotion.initial}
        style={shimmerStyle}
        transition={shimmerMotion.transition}
        {...(pauseOnHover
          ? { ref: sweep.elementRef, "data-paused": String(sweep.paused), ...sweep.handlers }
          : {})}
      >
        {children}
      </ShimmerElement>
    );
  }

  const Element = shouldReduceMotion ? Component : ((MotionComponent as ElementType) ?? "p");
  return (
    <Element data-slot="shimmer" className={shimmerClassName} style={shimmerStyle}>
      {children}
    </Element>
  );
}

export const Shimmer = memo(ShimmerComponent);
Shimmer.displayName = "Shimmer";
