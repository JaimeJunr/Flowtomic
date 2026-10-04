/**
 * MonthlySummary - Organism Component
 *
 * Componente complexo que exibe resumo financeiro mensal.
 * Tornado agnóstico de moeda e localização.
 */

import { TrendingDown, TrendingUp } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

const PERCENT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export interface MonthlySummaryProps extends React.ComponentProps<"div"> {
  totalRevenue?: number;
  costs?: number;
  netProfit?: number;
  growthPercentage?: number;
  className?: string;
  /**
   * Função de formatação de moeda (padrão: formata como número simples)
   */
  formatCurrency?: (value: number) => string;
  /**
   * Labels customizáveis
   */
  labels?: {
    title?: string;
    totalRevenue?: string;
    costs?: string;
    netProfit?: string;
    growthLabel?: string;
  };
}

/**
 * Organismo: MonthlySummary
 *
 * Componente complexo que exibe resumo financeiro mensal
 * Composto por múltiplas moléculas e átomos
 */
export function MonthlySummary({
  totalRevenue = 0,
  costs = 0,
  netProfit = 0,
  growthPercentage,
  className,
  formatCurrency = (value: number) => value.toLocaleString("pt-BR"),
  labels = {},
  ...props
}: MonthlySummaryProps) {
  const {
    title = "Resumo do Mês",
    totalRevenue: totalRevenueLabel = "Receita Total",
    costs: costsLabel = "Custos",
    netProfit: netProfitLabel = "Lucro Líquido",
    growthLabel = "vs mês anterior",
  } = labels;

  // Sem `growthPercentage`, mantém o tom neutro (sucesso) que o componente sempre teve.
  const isNegative = (growthPercentage ?? 0) < 0;
  const growthColor = isNegative ? "text-destructive" : "text-success";
  const GrowthIcon = isNegative ? TrendingDown : TrendingUp;

  return (
    <div data-slot="monthly-summary" className={className} {...props}>
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className={cn("rounded-lg p-2", isNegative ? "bg-destructive/10" : "bg-success/10")}>
          <GrowthIcon className={cn("h-5 w-5", growthColor)} />
        </div>
        <span className="text-base font-semibold text-foreground">{title}</span>
      </div>
      <dl className="border-t border-border">
        <div className="flex items-center justify-between border-b border-border py-3">
          <dt className="text-sm text-muted-foreground">{totalRevenueLabel}</dt>
          <dd className="font-mono text-foreground">{formatCurrency(totalRevenue)}</dd>
        </div>
        <div className="flex items-center justify-between border-b border-border py-3">
          <dt className="text-sm text-muted-foreground">{costsLabel}</dt>
          <dd className="font-mono text-foreground">{formatCurrency(costs)}</dd>
        </div>
        <div className="flex items-center justify-between py-3">
          <dt className="text-sm font-semibold text-foreground">{netProfitLabel}</dt>
          <dd className="font-mono text-lg text-foreground">{formatCurrency(netProfit)}</dd>
        </div>
      </dl>
      {growthPercentage !== undefined && (
        <div className="flex items-center gap-1.5 pt-3 text-sm">
          <span className={cn("font-semibold", growthColor)}>
            {PERCENT.format(Math.abs(growthPercentage))}%
          </span>
          <span className="text-muted-foreground">{growthLabel}</span>
        </div>
      )}
    </div>
  );
}

MonthlySummary.displayName = "MonthlySummary";
