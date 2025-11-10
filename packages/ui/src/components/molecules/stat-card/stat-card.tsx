/**
 * StatCard - Componente Visual
 *
 * Implementação visual usando o Headless UI hook useStatCard
 * Este componente adiciona markup e styles ao hook Headless
 */

import { type StatCardData, useStatCard } from "flowtomic/logic/hooks/useStatCard/useStatCard";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Minus,
  MoreHorizontal,
  Pin,
  Settings,
  Share2,
  Trash,
  TriangleAlert,
} from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../atoms";

export interface StatCardProps extends Omit<StatCardData, "value"> {
  /**
   * Título do card
   */
  title: string;

  /**
   * Valor principal (pode ser string ou number)
   * Se for number, será usado diretamente no hook
   * Se for string, será exibido como está
   */
  value: string | number;

  /**
   * Subtítulo/descrição do card
   */
  subtitle?: string;

  /**
   * Cor de destaque do card
   */
  color?: "blue" | "green" | "orange" | "red" | "purple";

  /**
   * Classe CSS adicional
   */
  className?: string;

  /**
   * Conteúdo adicional (children)
   */
  children?: React.ReactNode;

  /**
   * Se deve mostrar o menu de ações (dropdown)
   */
  showActions?: boolean;

  /**
   * Callbacks para ações do menu
   */
  onSettings?: () => void;
  onAddAlert?: () => void;
  onPin?: () => void;
  onShare?: () => void;
  onRemove?: () => void;

  // Compatibilidade retroativa com API antiga
  /**
   * @deprecated Use `delta` em vez disso. Tendência visual (up/down/neutral)
   */
  trend?: "up" | "down" | "neutral";

  /**
   * @deprecated Use `delta` em vez disso. Percentual formatado (ex: "+17%")
   */
  trendPercentage?: string;
}

const colorClasses = {
  blue: "bg-card border-border hover:bg-surface-hover",
  green: "bg-card border-border hover:bg-surface-hover",
  orange: "bg-card border-border hover:bg-surface-hover",
  red: "bg-card border-border hover:bg-surface-hover",
  purple: "bg-card border-border hover:bg-surface-hover",
};

const accentColors = {
  blue: "text-accent",
  green: "text-success",
  orange: "text-orange-500",
  red: "text-error",
  purple: "text-primary",
};

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      subtitle,
      delta,
      lastMonth,
      prefix,
      suffix,
      format,
      lastFormat,
      positive,
      color = "blue",
      className,
      children,
      showActions = false,
      onSettings,
      onAddAlert,
      onPin,
      onShare,
      onRemove,
      // Compatibilidade retroativa
      trend,
      trendPercentage,
      ...props
    },
    ref
  ) => {
    // Compatibilidade retroativa: converte trendPercentage para delta
    const computedDelta = React.useMemo(() => {
      if (delta !== undefined) {
        return delta;
      }
      if (trendPercentage) {
        // Remove o sinal + e % e converte para número
        const numericValue = parseFloat(trendPercentage.replace(/[+%]/g, ""));
        if (!Number.isNaN(numericValue)) {
          // Se trend for 'down', torna negativo
          return trend === "down" ? -Math.abs(numericValue) : Math.abs(numericValue);
        }
      }
      return undefined;
    }, [delta, trendPercentage, trend]);

    // Determina se é positivo baseado em trend se delta não estiver disponível
    const computedPositive = React.useMemo(() => {
      if (positive !== undefined) return positive;
      if (computedDelta !== undefined) return computedDelta >= 0;
      if (trend) return trend === "up";
      return undefined;
    }, [positive, computedDelta, trend]);

    // Headless UI Hook - apenas lógica
    // Se value for number, usa o hook; se for string, usa diretamente
    const isNumericValue = typeof value === "number";
    const statCardData = useStatCard(
      isNumericValue
        ? {
            value,
            delta: computedDelta,
            lastMonth,
            prefix,
            suffix,
            format,
            lastFormat,
            positive: computedPositive,
          }
        : {
            value: 0,
            delta: computedDelta,
            lastMonth,
            prefix,
            suffix,
            format,
            lastFormat,
            positive: computedPositive,
          }
    );

    // Valor formatado (do hook ou string direto)
    const displayValue = isNumericValue ? statCardData.formattedValue : value;

    // Ícone de tendência
    const getTrendIcon = () => {
      if (computedDelta === undefined && !trendPercentage) {
        return <Minus className="h-4 w-4 text-muted-foreground" />;
      }
      return statCardData.trend.direction === "up" ? (
        <ArrowUp className="h-4 w-4 text-success" />
      ) : statCardData.trend.direction === "down" ? (
        <ArrowDown className="h-4 w-4 text-error" />
      ) : (
        <Minus className="h-4 w-4 text-muted-foreground" />
      );
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border",
          colorClasses[color],
          className
        )}
        {...props}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6 border-0">
          <div className="space-y-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg bg-opacity-5", accentColors[color])}>
              <ArrowUpRight className={cn("h-4 w-4", accentColors[color])} />
            </div>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -me-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom">
                  {onSettings && (
                    <DropdownMenuItem onClick={onSettings}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
                  )}
                  {onAddAlert && (
                    <DropdownMenuItem onClick={onAddAlert}>
                      <TriangleAlert className="mr-2 h-4 w-4" />
                      Adicionar Alerta
                    </DropdownMenuItem>
                  )}
                  {onPin && (
                    <DropdownMenuItem onClick={onPin}>
                      <Pin className="mr-2 h-4 w-4" />
                      Fixar no Dashboard
                    </DropdownMenuItem>
                  )}
                  {onShare && (
                    <DropdownMenuItem onClick={onShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartilhar
                    </DropdownMenuItem>
                  )}
                  {onRemove && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onRemove} className="text-error">
                        <Trash className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "text-2xl font-medium text-foreground tracking-tight",
                accentColors[color]
              )}
            >
              {displayValue}
            </span>
            {(computedDelta !== undefined || trendPercentage) && (
              <Badge
                variant={statCardData.trend.variant}
                className="text-xs font-semibold inline-flex items-center gap-1"
              >
                {getTrendIcon()}
                {trendPercentage || statCardData.trend.percentage}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground leading-relaxed pt-1">{subtitle}</p>
          )}
          {statCardData.formattedLastMonth && (
            <div className="text-xs text-muted-foreground mt-2 border-t border-border pt-2.5">
              Vs último mês:{" "}
              <span className="font-medium text-foreground">{statCardData.formattedLastMonth}</span>
            </div>
          )}
          {children && <div className="mt-4 pt-4 border-t border-border">{children}</div>}
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };
