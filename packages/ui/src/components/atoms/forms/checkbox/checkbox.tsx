import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props do componente Checkbox.
 * @see CheckboxPrimitive.Root para props disponíveis (checked, onCheckedChange, disabled, etc.)
 */
export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;

/**
 * Componente Checkbox para seleção de opções.
 *
 * @see [Radix UI Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox) para mais detalhes
 */
function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
Checkbox.displayName = "Checkbox";

export { Checkbox };
