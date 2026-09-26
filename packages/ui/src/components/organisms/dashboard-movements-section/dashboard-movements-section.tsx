/**
 * DashboardMovementsSection - Organism Component
 *
 * Componente complexo que agrupa movimentações semanais.
 * Tornado genérico e reutilizável.
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../atoms";

export interface Movement {
  id: string;
  name: string;
  price: string;
  tag: string;
  buttonText: string;
  /**
   * Callback quando o botão é clicado
   */
  onButtonClick?: () => void;
}

export interface DashboardMovementsSectionProps {
  /**
   * Lista de movimentações
   */
  movements?: Movement[];
  /**
   * Título da seção
   */
  title?: string;
  /**
   * Badge do período (ex: "7 dias")
   */
  periodBadge?: string;
  /**
   * Função para obter cor do status baseado na tag
   */
  getStatusColor?: (tag: string) => string;
  /**
   * Função para obter variante do botão baseado no texto
   */
  getButtonVariant?: (
    buttonText: string
  ) =>
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "success"
    | "info"
    | undefined;
  /**
   * Mensagem quando não há movimentações
   */
  emptyMessage?: string;
  className?: string;
}

/**
 * Organismo: DashboardMovementsSection
 *
 * Componente complexo que agrupa movimentações semanais
 * Composto por moléculas e outros componentes
 */
export const DashboardMovementsSection = React.forwardRef<
  HTMLDivElement,
  DashboardMovementsSectionProps
>(
  (
    {
      movements = [],
      title = "Movimentações Semanais",
      periodBadge = "7 dias",
      getStatusColor,
      getButtonVariant,
      emptyMessage = "Nenhuma movimentação encontrada",
      className,
      ...props
    },
    ref
  ) => {
    // Função padrão para obter cor do status
    const defaultGetStatusColor = (tag: string): string => {
      const normalizedTag = tag.toUpperCase();
      switch (normalizedTag) {
        case "DISPONÍVEL":
        case "AVAILABLE":
          return "bg-success/10 text-success border border-success/30";
        case "RESERVADO":
        case "RESERVED":
          return "bg-accent text-accent-foreground border border-accent-hover";
        case "VENDIDO":
        case "SOLD":
          return "bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/30";
        default:
          return "bg-muted text-foreground border border-border";
      }
    };

    // Função padrão para obter variante do botão. Todas outline: com uma ação por linha,
    // botão sólido em cada uma vira vários botões competindo pela atenção.
    const defaultGetButtonVariant = (
      _buttonText: string
    ):
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "success"
      | "info"
      | undefined => {
      return "outline";
    };

    const statusColorFn = getStatusColor || defaultGetStatusColor;
    const buttonVariantFn = getButtonVariant || defaultGetButtonVariant;

    return (
      <div ref={ref} className={cn("flex flex-col gap-3", className)} {...props}>
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-sm font-semibold">{title}</h2>
          <span aria-hidden className="h-px flex-1 self-center bg-border" />
          {periodBadge && (
            <span className="font-mono text-xs text-muted-foreground">{periodBadge}</span>
          )}
        </div>
        {movements.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="text-sm" aria-label={`Lista de ${title.toLowerCase()}`}>
            {movements.map((movement) => (
              <li
                key={movement.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border py-3 first:border-t-0"
              >
                <span className="min-w-0 flex-1 font-medium text-foreground">{movement.name}</span>
                <span className="font-mono text-foreground/80">{movement.price}</span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    statusColorFn(movement.tag)
                  )}
                >
                  {movement.tag}
                </span>
                <Button
                  variant={buttonVariantFn(movement.buttonText)}
                  size="sm"
                  onClick={movement.onButtonClick}
                  aria-label={`Ação: ${movement.buttonText}`}
                >
                  {movement.buttonText}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

DashboardMovementsSection.displayName = "DashboardMovementsSection";
