/**
 * DashboardMovementsSection - Organism Component
 *
 * Componente complexo que agrupa movimentações semanais.
 * Tornado genérico e reutilizável.
 */

import React from "react";
import { cn } from "../../../lib/utils";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "../../atoms";

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
          return "bg-accent/10 text-accent border border-accent/30";
        case "VENDIDO":
        case "SOLD":
          return "bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/30";
        default:
          return "bg-muted text-foreground border border-border";
      }
    };

    // Função padrão para obter variante do botão
    const defaultGetButtonVariant = (
      buttonText: string
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
      const normalizedText = buttonText.toUpperCase();
      if (normalizedText.includes("VENDER") || normalizedText.includes("ENTREGUE")) {
        return "success";
      }
      if (normalizedText.includes("AGUARDANDO") || normalizedText.includes("WAITING")) {
        return "info";
      }
      return "default";
    };

    const statusColorFn = getStatusColor || defaultGetStatusColor;
    const buttonVariantFn = getButtonVariant || defaultGetButtonVariant;

    return (
      <Card
        ref={ref}
        className={cn(
          "bg-card border border-border hover:shadow-lg transition-all duration-300",
          className
        )}
        {...props}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            {periodBadge && (
              <Badge variant="secondary" className="text-xs">
                {periodBadge}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
          ) : (
            <ul className="space-y-4" aria-label={`Lista de ${title.toLowerCase()}`}>
              {movements.map((movement) => (
                <li
                  key={movement.id}
                  className="flex items-center justify-between bg-background rounded-lg p-4 border border-border hover:border-ring hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm"
                      aria-hidden="true"
                    >
                      {movement.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-foreground">{movement.name}</div>
                      <div className="text-primary font-semibold text-sm">{movement.price}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-xs px-3 py-1 rounded-full font-medium",
                        statusColorFn(movement.tag)
                      )}
                      aria-label={`Status: ${movement.tag}`}
                    >
                      {movement.tag}
                    </Badge>
                    <Button
                      variant={buttonVariantFn(movement.buttonText)}
                      size="sm"
                      onClick={movement.onButtonClick}
                      aria-label={`Ação: ${movement.buttonText}`}
                    >
                      {movement.buttonText}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  }
);

DashboardMovementsSection.displayName = "DashboardMovementsSection";
