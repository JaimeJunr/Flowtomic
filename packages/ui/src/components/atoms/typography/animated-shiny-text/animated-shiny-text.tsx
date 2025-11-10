import type { ComponentPropsWithoutRef, CSSProperties, FC } from "react";

import { cn } from "../../../../lib/utils";

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number;
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "relative inline-block",
        className
      )}
      {...props}
    >
      {/* Texto visível */}
      <span className="relative z-0">{children}</span>
      
      {/* Shimmer overlay - duplica o texto com efeito shimmer */}
      <span
        className={cn(
          "absolute inset-0 z-10 pointer-events-none",
          "animate-shiny-text bg-size-[var(--shiny-width)_100%] bg-clip-text bg-no-repeat bg-position-[0_0]",
          "bg-linear-to-r from-transparent via-white to-transparent",
          "text-transparent mix-blend-mode-screen"
        )}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
};
