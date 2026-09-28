/**
 * StatCard - Componente Visual
 *
 * Implementação visual usando o Headless UI hook useStatCard
 * Este componente adiciona markup e styles ao hook Headless
 *
 * Uma métrica no mesmo desenho da célula do StatsGrid (DESIGN.md, "Métrica"): rótulo em tinta
 * suave, número em mono na cor do texto, e só a variação ganha cor, pelo sentido do que é bom.
 */

import { type StatCardData, useStatCard } from "@flowtomic/logic";
import { MoreHorizontal, Pin, Settings, Share2, Trash, TriangleAlert } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../atoms";

export interface StatCardProps extends StatCardData {
  /**
   * Título do card
   */
  title: string;

  /**
   * Subtítulo/descrição do card
   */
  subtitle?: string;

  /**
   * @deprecated O número sai sempre na cor do texto (DESIGN.md, "The Color Means Something
   * Rule"); só a variação ganha cor. Mantido para não quebrar quem já passa.
   */
  color?: "primary" | "success" | "warning" | "error" | "info";

  /**
   * Variante do layout do card
   */
  variant?: "compact" | "default" | "detailed";

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
}

const PERCENT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

function trendClass(direction: "up" | "down" | "neutral", good: boolean): string {
  if (direction === "neutral") return "text-muted-foreground";
  return good ? "text-success" : "text-destructive";
}

interface ActionsMenuProps {
  onSettings?: () => void;
  onAddAlert?: () => void;
  onPin?: () => void;
  onShare?: () => void;
  onRemove?: () => void;
}

function ActionsMenu({ onSettings, onAddAlert, onPin, onShare, onRemove }: ActionsMenuProps) {
  const items = [
    { run: onSettings, icon: Settings, label: "Configurações" },
    { run: onAddAlert, icon: TriangleAlert, label: "Adicionar alerta" },
    { run: onPin, icon: Pin, label: "Fixar no painel" },
    { run: onShare, icon: Share2, label: "Compartilhar" },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mais opções"
          className="absolute right-0 top-0 size-8 text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {items.map(
          ({ run, icon: Icon, label }) =>
            run && (
              <DropdownMenuItem key={label} onClick={run}>
                <Icon className="mr-2 size-4 text-muted-foreground" aria-hidden="true" />
                {label}
              </DropdownMenuItem>
            )
        )}
        {onRemove && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onRemove}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 size-4" aria-hidden="true" />
              Remover
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
      locale,
      currency,
      currencyDisplay,
      format,
      lastFormat,
      positive,
      color: _color,
      variant = "default",
      className,
      children,
      showActions = false,
      onSettings,
      onAddAlert,
      onPin,
      onShare,
      onRemove,
      ...props
    },
    ref
  ) => {
    const isCompact = variant === "compact";
    const isNumericValue = typeof value === "number";

    const { formattedValue, formattedLastMonth, trend } = useStatCard({
      value: isNumericValue ? value : 0,
      delta,
      lastMonth,
      prefix,
      suffix,
      locale,
      currency,
      currencyDisplay,
      format,
      lastFormat,
    });

    const hasTrend = delta !== undefined || lastMonth !== undefined;
    // `positive` responde "subir é bom?"; o hook trata como "a variação foi boa?"
    const good = (trend.direction === "up") === (positive ?? true);
    const trendLabel = `${trend.direction === "down" ? "↓" : "↑"} ${PERCENT.format(trend.delta)}%`;

    return (
      <div ref={ref} className={cn("relative flex flex-col gap-2", className)} {...props}>
        <span className={cn("truncate text-sm text-muted-foreground", showActions && "pr-10")}>
          {title}
        </span>
        {showActions && (
          <ActionsMenu
            onSettings={onSettings}
            onAddAlert={onAddAlert}
            onPin={onPin}
            onShare={onShare}
            onRemove={onRemove}
          />
        )}
        <span
          className={cn(
            "font-mono font-medium leading-none tracking-tight break-words",
            isCompact ? "text-2xl" : "text-[32px]"
          )}
        >
          {isNumericValue ? formattedValue : value}
        </span>
        {hasTrend && (
          <span className="flex flex-wrap gap-1.5 text-[13px] text-muted-foreground">
            <span className={cn("font-semibold", trendClass(trend.direction, good))}>
              {trendLabel}
            </span>
            {formattedLastMonth && !isCompact && <span>sobre {formattedLastMonth}</span>}
          </span>
        )}
        {subtitle && !isCompact && (
          <p
            className={cn(
              "text-muted-foreground",
              variant === "detailed" ? "text-sm sm:text-base" : "text-[13px]"
            )}
          >
            {subtitle}
          </p>
        )}
        {children && !isCompact && (
          <div className="mt-2 border-t border-border pt-3">{children}</div>
        )}
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };
