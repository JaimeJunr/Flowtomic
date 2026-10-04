/**
 * Card Component - Flowtomic UI
 *
 * Componente Card próprio do design-system
 * Implementação direta sem dependência de componentes externos
 */

import type * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.ComponentProps<"div">;
export type CardHeaderProps = React.ComponentProps<"div">;
export type CardTitleProps = React.ComponentProps<"h3">;
export type CardDescriptionProps = React.ComponentProps<"p">;
export type CardContentProps = React.ComponentProps<"div">;
export type CardFooterProps = React.ComponentProps<"div">;
export type CardActionProps = React.ComponentProps<"div">;

/**
 * Card - Container principal do card
 */
function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  );
}
Card.displayName = "Card";

/**
 * CardHeader - Cabeçalho do card
 */
function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}
CardHeader.displayName = "CardHeader";

/**
 * CardTitle - Título do card
 */
function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}
CardTitle.displayName = "CardTitle";

/**
 * CardDescription - Descrição do card
 */
function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
CardDescription.displayName = "CardDescription";

/**
 * CardContent - Conteúdo principal do card
 */
function CardContent({ className, ...props }: CardContentProps) {
  return <div data-slot="card-content" className={cn("p-6 pt-0", className)} {...props} />;
}
CardContent.displayName = "CardContent";

/**
 * CardFooter - Rodapé do card
 */
function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}
CardFooter.displayName = "CardFooter";

/**
 * CardAction - Área de ação no header do card
 */
function CardAction({ className, ...props }: CardActionProps) {
  return <div data-slot="card-action" className={cn("ml-auto", className)} {...props} />;
}
CardAction.displayName = "CardAction";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction };
