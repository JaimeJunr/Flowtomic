/**
 * # Collapsible Component
 *
 * O componente `Collapsible` é usado para exibir conteúdo que pode ser
 * expandido ou colapsado. É baseado em Radix UI para garantir acessibilidade completa.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI com suporte completo a leitores de tela
 * - **Composição**: Collapsible + CollapsibleTrigger + CollapsibleContent
 * - **Animações**: Animações suaves de abertura/fechamento
 * - **Foco Gerenciado**: Foco e navegação por teclado gerenciados automaticamente
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@flowtomic/ui/components/atoms/layout/collapsible";
 *
 * function MyComponent() {
 *   const [open, setOpen] = React.useState(false);
 *
 *   return (
 *     <Collapsible open={open} onOpenChange={setOpen}>
 *       <CollapsibleTrigger>Toggle</CollapsibleTrigger>
 *       <CollapsibleContent>
 *         Conteúdo colapsável
 *       </CollapsibleContent>
 *     </Collapsible>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta navegação por teclado (Tab, Enter, Espaço)
 * - Segue padrões WAI-ARIA via Radix UI
 * - Suporta leitores de tela
 * - Foco gerenciado automaticamente
 *
 * @see [Radix UI Collapsible](https://www.radix-ui.com/primitives/docs/components/collapsible) para mais detalhes
 */

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
