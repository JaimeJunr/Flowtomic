import * as LabelPrimitive from "@radix-ui/react-label";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props do componente Label.
 * @see LabelPrimitive.Root para props disponíveis (htmlFor, etc.)
 */
export interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {}

/**
 * Componente Label para associar texto a controles de formulário.
 *
 * @see [Radix UI Label](https://www.radix-ui.com/primitives/docs/components/label) para mais detalhes
 */
function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

Label.displayName = "Label";

export { Label };
