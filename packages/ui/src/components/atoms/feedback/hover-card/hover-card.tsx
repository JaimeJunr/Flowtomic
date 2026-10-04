import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import type * as React from "react";
import { cn } from "@/lib/utils";

export type HoverCardProps = React.ComponentProps<typeof HoverCardPrimitive.Root>;
export type HoverCardTriggerProps = React.ComponentProps<typeof HoverCardPrimitive.Trigger>;
export type HoverCardContentProps = React.ComponentProps<typeof HoverCardPrimitive.Content>;

/**
 * HoverCard - Container principal do hover card.
 *
 * Componente usado para gerenciar o estado do hover card.
 */
function HoverCard(props: HoverCardProps) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}
HoverCard.displayName = "HoverCard";

/**
 * HoverCardTrigger - Trigger do hover card.
 *
 * Componente usado como trigger para abrir o hover card ao passar o mouse.
 */
function HoverCardTrigger(props: HoverCardTriggerProps) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}
HoverCardTrigger.displayName = "HoverCardTrigger";

/**
 * HoverCardContent - Conteúdo do hover card.
 *
 * Componente usado para exibir o conteúdo do hover card.
 */
function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: HoverCardContentProps) {
  return (
    <HoverCardPrimitive.Content
      data-slot="hover-card-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  );
}
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
