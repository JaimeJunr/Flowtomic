/**
 * # HoverCard Component
 *
 * O componente `HoverCard` é usado para exibir conteúdo flutuante quando o usuário
 * passa o mouse sobre um elemento. É baseado em Radix UI para garantir acessibilidade completa.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI com suporte completo a leitores de tela
 * - **Hover**: Abre automaticamente ao passar o mouse
 * - **Composição**: HoverCard + HoverCardTrigger + HoverCardContent para flexibilidade
 * - **Foco Gerenciado**: Foco e navegação por teclado gerenciados automaticamente
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { HoverCard, HoverCardTrigger, HoverCardContent } from "@flowtomic/ui/components/atoms/feedback/hover-card";
 *
 * function MyComponent() {
 *   return (
 *     <HoverCard>
 *       <HoverCardTrigger>Hover me</HoverCardTrigger>
 *       <HoverCardContent>
 *         <p>Conteúdo do hover card</p>
 *       </HoverCardContent>
 *     </HoverCard>
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
 * @see [Radix UI Hover Card](https://www.radix-ui.com/primitives/docs/components/hover-card) para mais detalhes
 */

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as React from "react";
import { cn } from "@/lib/utils";

export type HoverCardProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root>;
export type HoverCardTriggerProps = React.ComponentPropsWithoutRef<
  typeof HoverCardPrimitive.Trigger
>;
export type HoverCardContentProps = React.ComponentPropsWithoutRef<
  typeof HoverCardPrimitive.Content
>;

/**
 * HoverCard - Container principal do hover card.
 *
 * Componente usado para gerenciar o estado do hover card.
 */
const HoverCard = HoverCardPrimitive.Root;
HoverCard.displayName = "HoverCard";

/**
 * HoverCardTrigger - Trigger do hover card.
 *
 * Componente usado como trigger para abrir o hover card ao passar o mouse.
 */
const HoverCardTrigger = HoverCardPrimitive.Trigger;
HoverCardTrigger.displayName = "HoverCardTrigger";

/**
 * HoverCardContent - Conteúdo do hover card.
 *
 * Componente usado para exibir o conteúdo do hover card.
 */
const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
