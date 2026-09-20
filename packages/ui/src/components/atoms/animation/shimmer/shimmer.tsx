/**
 * Shimmer Component - Flowtomic UI
 *
 * Componente de texto com efeito shimmer animado
 */

import { motion } from "motion/react";
import { type CSSProperties, type ElementType, type JSX, memo, useMemo } from "react";
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

  if (createMotionComponent && typeof MotionComponent !== "string") {
    return (
      <MotionComponent
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

  const Element = (MotionComponent as ElementType) ?? "p";
  return (
    <Element className={shimmerClassName} style={shimmerStyle}>
      {children}
    </Element>
  );
}

export const Shimmer = memo(ShimmerComponent);
Shimmer.displayName = "Shimmer";
