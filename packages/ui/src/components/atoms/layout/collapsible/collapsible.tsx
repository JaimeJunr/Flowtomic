import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import type * as React from "react";
import { cn } from "@/lib/utils";

export type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root>;
export type CollapsibleTriggerProps = React.ComponentProps<typeof CollapsiblePrimitive.Trigger>;
export type CollapsibleContentProps = React.ComponentProps<typeof CollapsiblePrimitive.Content>;

/**
 * Collapsible - Container principal do collapsible.
 *
 * Componente usado para gerenciar o estado do collapsible.
 */
function Collapsible(props: CollapsibleProps) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}
Collapsible.displayName = "Collapsible";

/**
 * CollapsibleTrigger - Trigger do collapsible.
 *
 * Componente usado como trigger para abrir/fechar o collapsible.
 */
function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />;
}
CollapsibleTrigger.displayName = "CollapsibleTrigger";

/**
 * CollapsibleContent - Conteúdo do collapsible.
 *
 * Componente usado para exibir o conteúdo quando o collapsible está aberto.
 */
function CollapsibleContent({ className, ...props }: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className
      )}
      {...props}
    />
  );
}
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
