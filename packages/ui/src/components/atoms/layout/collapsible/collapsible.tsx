import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as React from "react";
import { cn } from "@/lib/utils";

export type CollapsibleProps = React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>;
export type CollapsibleTriggerProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Trigger
>;
export type CollapsibleContentProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Content
>;

/**
 * Collapsible - Container principal do collapsible.
 *
 * Componente usado para gerenciar o estado do collapsible.
 */
const Collapsible = CollapsiblePrimitive.Root;
Collapsible.displayName = "Collapsible";

/**
 * CollapsibleTrigger - Trigger do collapsible.
 *
 * Componente usado como trigger para abrir/fechar o collapsible.
 */
const CollapsibleTrigger = CollapsiblePrimitive.Trigger;
CollapsibleTrigger.displayName = "CollapsibleTrigger";

/**
 * CollapsibleContent - Conteúdo do collapsible.
 *
 * Componente usado para exibir o conteúdo quando o collapsible está aberto.
 */
const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
      className
    )}
    {...props}
  />
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
