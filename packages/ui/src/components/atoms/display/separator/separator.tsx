/**
 * Separator Component - Flowtomic UI
 *
 * Componente Separator baseado em Radix UI
 */

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import type * as React from "react";
import { cn } from "@/lib/utils";

export type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root>;

/**
 * Separator - Separador horizontal ou vertical
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
}
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
