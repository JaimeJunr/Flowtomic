/**
 * Shimmer Component - Flowtomic UI
 *
 * Componente de texto com efeito shimmer animado
 */

import { MotionConfigContext, motion, useReducedMotion } from "motion/react";
import { type CSSProperties, type ElementType, type JSX, memo, useContext, useMemo } from "react";
import { cn } from "@/lib/utils";

export type TextShimmerProps = {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
};

const createMotionComponent =
  typeof motion?.create === "function"
    ? (Component: keyof JSX.IntrinsicElements | ElementType) =>
        motion.create(Component as keyof JSX.IntrinsicElements)
    : null;

function ShimmerComponent({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const MotionComponent = useMemo(
    () =>
      createMotionComponent
        ? createMotionComponent(Component as keyof JSX.IntrinsicElements)
        : (Component as ElementType),
    [Component]
  );

  // Mesmo critério do sliding-number: preferência do sistema ou MotionConfig reducedMotion="always"
  const reducedMotionConfig = useContext(MotionConfigContext).reducedMotion;
  const shouldReduceMotion = useReducedMotion() || reducedMotionConfig === "always";

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
      <MotionComponent
        data-slot="shimmer"
        animate={{ backgroundPosition: "0% center" }}
        className={shimmerClassName}
        initial={{ backgroundPosition: "100% center" }}
        style={shimmerStyle}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration,
          ease: "linear",
        }}
      >
        {children}
      </MotionComponent>
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
